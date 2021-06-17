import {
    OPENSRP_SECURITY_AUTHENTICATE,
    LOCATION_FILTER_PARAM,
    RISK_CATEGORY_FILTER_PARAM,
    SMS_TYPE_FILTER_PARAM,
    SEARCH_FILTER_PARAM,
    PREGNANCY_DETECTION,
    UPDATE_PREGNANCY_DETECTION,
    NUTRITION_REGISTRATION,
    UPDATE_NUTRITION_REGISTRATION,
    DEATH_REPORT,
    UPDATE_DEATH_REPORT,
} from '../constants';
import { getQueryParams } from 'containers/LogFace/utils';
import { TFunction } from 'i18next';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { OpenSRPService } from 'services/opensrp';
import { getSmsDataByFilters } from 'store/ducks/sms_events';
import { TreeNode } from './locationHierarchy/types';
import { generateJurisdictionTree } from './locationHierarchy/utils';
import { toastToError, getRiskCatFilter } from './utils';
import { LogFaceModules } from 'configs/settings';

const selectSmsData = getSmsDataByFilters();

/** hook to get this users assignment details, hierarchy, team assigned and location the team is assigned
 * @param t - the translator function
 */
export const useUserAssignment = (t: TFunction) => {
    return useQuery(
        'userAssignment',
        () => {
            const opensrpService = new OpenSRPService(OPENSRP_SECURITY_AUTHENTICATE);
            return opensrpService.read('');
        },
        {
            select: (response) => {
                return {
                    userHierarchy: generateJurisdictionTree(response.locations),
                    user: response.user,
                    team: response.team.team,
                    location: response.team.team.location,
                };
            },
            onError: (err: Error) => toastToError(err?.message ?? t('An error occurred')),
        },
    );
};

/** redux hok to select filtered sms data based on provided filters
 * @param location - route location details, to get search params
 * @param module - the module
 * @param userLocationTree - for filtering based on the user's assigned level
 */
export const useGetLogFaceFilteredSms = (
    location: RouteComponentProps['location'],
    module: LogFaceModules,
    userHierarchy?: TreeNode,
) => {
    return useSelector((state) => {
        const userLocationIdFilter = getQueryParams(location)[LOCATION_FILTER_PARAM] as string;
        const riskCategoryFilter = getQueryParams(location)[RISK_CATEGORY_FILTER_PARAM] as string;
        const smsTypeFilter = getQueryParams(location)[SMS_TYPE_FILTER_PARAM] as string;
        const searchFilter = getQueryParams(location)[SEARCH_FILTER_PARAM] as string;
        const matchesId = (node: TreeNode) => node.model.id === userLocationIdFilter;
        const userLocationNode = userHierarchy?.first(matchesId);
        let smsFilter = smsTypeFilter ? [smsTypeFilter] : undefined;
        switch (smsTypeFilter) {
            case PREGNANCY_DETECTION:
                smsFilter = [PREGNANCY_DETECTION, UPDATE_PREGNANCY_DETECTION];
                break;
            case NUTRITION_REGISTRATION:
                smsFilter = [NUTRITION_REGISTRATION, UPDATE_NUTRITION_REGISTRATION];
                break;
            case DEATH_REPORT:
                smsFilter = [DEATH_REPORT, UPDATE_DEATH_REPORT];
                break;
            default:
                break;
        }
        return selectSmsData(state, {
            locationNode: userLocationNode,
            riskCategory: getRiskCatFilter(module, riskCategoryFilter),
            smsTypes: smsFilter,
            searchFilter,
            module,
        });
    });
};
