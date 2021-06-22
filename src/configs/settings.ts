/** This is the main configuration module */
import { TFunction } from 'react-i18next';
import { GREEN, RED, YELLOW } from './colors';
import { AuthorizationGrantType, Providers } from '@onaio/gatekeeper';
import {
    PREGNANCY_MODULE,
    NUTRITION_MODULE,
    NBC_AND_PNC_MODULE,
    NUTRITION_REPORT,
    ACCOUNT_CHECK,
    ANC_REPORT,
    ANC_VISIT,
    BIRTH_REPORT,
    DEATH_REPORT,
    DELIVERY_PLANNING,
    DEPARTURE_CODE,
    HOME_VISIT_REPORT,
    MONTHLY_NUTRITION_REPORT,
    NUTRITION_REGISTRATION,
    POSTNATAL_AND_NEWBORN_CARE,
    PREGNANCY_DETECTION,
    PREGNANCY_IDENTIFICATION,
    PREGNANCY_REGISTRATION,
    RED_ALERT_REPORT,
    REFUSAL_REPORT,
    RESPONSE_REPORT,
    SOCIAL_DETERMINANTS,
    PREGNANCY,
    NBC_AND_PNC,
    NBC_AND_PNC_CHILD,
    NBC_AND_PNC_WOMAN,
    NUTRITION,
    FETCH_COMPARTMENTS_PREGNANCY_SLICE,
    FETCH_COMPARTMENTS_NBC_AND_PNC_SLICE,
    FETCH_COMPARTMENTS_NUTRITION_SLICE,
    BACKEND_CALLBACK_URL,
    REACT_LOGIN_URL,
    BACKEND_LOGIN_URL,
    BACKEND_CALLBACK_PATH,
    REACT_CALLBACK_PATH,
} from '../constants';
import {
    BACKEND_ACTIVE,
    DOMAIN_NAME,
    ENABLE_ONADATA_OAUTH,
    ENABLE_OPENSRP_OAUTH,
    NBC_AND_PNC_LOGFACE_SLICE,
    NUTRITION_LOGFACE_SLICE,
    ONADATA_ACCESS_TOKEN_URL,
    ONADATA_AUTHORIZATION_URL,
    ONADATA_CLIENT_ID,
    ONADATA_OAUTH_STATE,
    ONADATA_USER_URL,
    OPENSRP_ACCESS_TOKEN_URL,
    OPENSRP_AUTHORIZATION_URL,
    OPENSRP_CLIENT_ID,
    OPENSRP_OAUTH_STATE,
    OPENSRP_USER_URL,
    PREGNANCY_LOGFACE_SLICE,
    COMPARTMENTS_PREGNANCY_SLICE,
    COMPARTMENTS_NBC_AND_PNC_SLICE,
    COMPARTMENTS_NUTRITION_SLICE,
    SUPERSET_API_BASE,
    SUPERSET_NBC_AND_PNC_ANALYSIS_DASHBOARD,
    SUPERSET_NUTRITION_ANALYSIS_DASHBOARD,
    SUPERSET_PREGNANCY_ANALYSIS_DASHBOARD,
} from './env';
import { Dictionary } from 'helpers/utils';

/** Authentication Configs */
export const providers: Providers = {
    ...(ENABLE_OPENSRP_OAUTH && {
        OpenSRP: {
            accessTokenUri: OPENSRP_ACCESS_TOKEN_URL,
            authorizationUri: OPENSRP_AUTHORIZATION_URL,
            clientId: OPENSRP_CLIENT_ID,
            redirectUri: `${DOMAIN_NAME}/oauth/callback/OpenSRP/`,
            scopes: ['read', 'write'],
            state: OPENSRP_OAUTH_STATE,
            userUri: OPENSRP_USER_URL,
        },
    }),
    ...(ENABLE_ONADATA_OAUTH && {
        Ona: {
            accessTokenUri: ONADATA_ACCESS_TOKEN_URL,
            authorizationUri: ONADATA_AUTHORIZATION_URL,
            clientId: ONADATA_CLIENT_ID,
            redirectUri: `${DOMAIN_NAME}/oauth/callback/Ona/`,
            scopes: ['read', 'write'],
            state: ONADATA_OAUTH_STATE,
            userUri: ONADATA_USER_URL,
        },
    }),
};

/** constant react-hot-toast config */
export const toastConfig = {
    style: {
        minWidth: '250px',
    },
    duration: 2000,
};

export const SmsTypes = [
    RESPONSE_REPORT,
    RED_ALERT_REPORT,
    SOCIAL_DETERMINANTS,
    ANC_VISIT,
    DELIVERY_PLANNING,
    PREGNANCY_DETECTION,
    PREGNANCY_IDENTIFICATION,
    PREGNANCY_REGISTRATION,
    ANC_REPORT,
    HOME_VISIT_REPORT,
    BIRTH_REPORT,
    DEATH_REPORT,
    POSTNATAL_AND_NEWBORN_CARE,
    NUTRITION_REGISTRATION,
    NUTRITION_REPORT,
    MONTHLY_NUTRITION_REPORT,
    DEPARTURE_CODE,
    REFUSAL_REPORT,
    ACCOUNT_CHECK,
] as const;

// sms types that match module pregnancy
export const pregnancySmsTypes = [
    PREGNANCY_DETECTION,
    PREGNANCY_IDENTIFICATION,
    PREGNANCY_REGISTRATION,
    ANC_REPORT,
    HOME_VISIT_REPORT,
    SOCIAL_DETERMINANTS,
    DELIVERY_PLANNING,
    BIRTH_REPORT,
    DEATH_REPORT,
    RED_ALERT_REPORT,
    RESPONSE_REPORT,
    REFUSAL_REPORT,
    DEPARTURE_CODE,
];
// sms types that match module nbc
export const nbcSmsTypes = [
    BIRTH_REPORT, // (with Patient ID column displaying Newborn’s ID)
    DEATH_REPORT, // (code for Newborn/Child Mortality and if DOD – DOB ≤ 28 days)
    POSTNATAL_AND_NEWBORN_CARE,
    RED_ALERT_REPORT, //(with code for Newborns)
    RESPONSE_REPORT, // (response reported for risks(resulting from other reports under this category) as outlined in syntax classification doc)
    REFUSAL_REPORT,
    DEPARTURE_CODE,
];
// sms types that match module pnc
export const pncSmsTypes = [
    DEATH_REPORT, // (code for Mother Mortality and received AFTER a Birth report)
    RED_ALERT_REPORT, //(with code for Mothers and are received AFTER Birth Report)
    RESPONSE_REPORT, // (response reported for risks(resulting from other reports under this category) as outlined in syntax classification doc)
    REFUSAL_REPORT,
    DEPARTURE_CODE,
];
// sms types that match module nutrition
export const nutritionSmsTypes = [MONTHLY_NUTRITION_REPORT, NUTRITION_REGISTRATION, NUTRITION_REPORT];

// sms types for general enquiries
export const generalSmsTypes = [DEPARTURE_CODE, REFUSAL_REPORT, ACCOUNT_CHECK];

export type LogFaceModules = typeof PREGNANCY_MODULE | typeof NBC_AND_PNC_MODULE | typeof NUTRITION_MODULE;

export const LogFaceSliceByModule: { [key in LogFaceModules]: string } = {
    [PREGNANCY_MODULE]: PREGNANCY_LOGFACE_SLICE,
    [NUTRITION_MODULE]: NUTRITION_LOGFACE_SLICE,
    [NBC_AND_PNC_MODULE]: NBC_AND_PNC_LOGFACE_SLICE,
};

export const APP_CALLBACK_URL = BACKEND_ACTIVE ? BACKEND_CALLBACK_URL : REACT_LOGIN_URL;
export const { IMPLICIT, AUTHORIZATION_CODE } = AuthorizationGrantType;
export const AuthGrantType = BACKEND_ACTIVE ? AUTHORIZATION_CODE : IMPLICIT;
export const APP_LOGIN_URL = BACKEND_ACTIVE ? BACKEND_LOGIN_URL : REACT_LOGIN_URL;
export const APP_CALLBACK_PATH = BACKEND_ACTIVE ? BACKEND_CALLBACK_PATH : REACT_CALLBACK_PATH;

/** Factory function for lookup object dictates how the Nutrition risk filters will be done
 * what accessor/column is checked and what value(s) should be matched against
 */
export const nutritionModuleRiskFilterLookup = (t: TFunction) => {
    return {
        stunting: {
            label: t('Stunting'),
            accessor: 'growth_status',
            filterValue: ['stunted'],
        },
        wasting: {
            label: t('Wasting'),
            accessor: 'nutrition_status',
            filterValue: ['severe wasting'],
        },
        overweight: {
            label: t('Overweight'),
            accessor: 'nutrition_status',
            filterValue: ['overweight'],
        },
        inappropriateFeeding: {
            label: t('Inappropriate Feeding'),
            accessor: 'feeding_category',
            filterValue: ['inappropriately fed'],
        },
        underweight: {
            label: t('Underweight'),
            accessor: 'nutrition_status',
            filterValue: ['underweight'],
        },
        normal: {
            label: t('Normal'),
            accessor: 'nutrition_status',
            filterValue: ['normal'],
        },
    };
};

/** Factory function for lookup object dictates how the Pregnancy risk filters will be done
 * what accessor/column is checked and what value(s) should be matched against
 */
export const pregnancyModuleRiskFilterLookup = (t: TFunction) => {
    return {
        risk: {
            label: t('Risk'),
            accessor: 'risk_level',
            filterValue: ['low', 'high', 'risk'],
            color: YELLOW,
        },
        redAlert: {
            label: t('Red alert'),
            accessor: 'risk_level',
            filterValue: ['red_alert'],
            color: RED,
        },
        noRisk: {
            label: t('No risk'),
            accessor: 'risk_level',
            filterValue: ['no_risk'],
            color: GREEN,
        },
    };
};

/** factory util to generate a lookup object for
 * - know how to apply color style and label to RiskColoring in the logFace views
 * - know how to filter smsEvents with respect to selected risk filter and the module in log face views
 */
export const riskCategories = (t: TFunction) => {
    /** helps convert to a format that is easy to parse when creating select options */
    const convertToOptions = (category: Dictionary<Dictionary<string | string[]>>) => {
        const options = [];
        for (const key in category) {
            options.push({ color: category[key].color, label: category[key].label, value: key } as Dictionary<string>);
        }
        return options;
    };
    const pregnancyCats = pregnancyModuleRiskFilterLookup(t);
    const nutritionCategories = nutritionModuleRiskFilterLookup(t);

    const sharedRiskCats = convertToOptions(pregnancyCats);
    const nutritionCats = convertToOptions(nutritionCategories);

    return {
        [PREGNANCY_MODULE]: sharedRiskCats,
        [NBC_AND_PNC_MODULE]: sharedRiskCats,
        [NUTRITION_MODULE]: nutritionCats,
    };
};

type moduleType =
    | typeof PREGNANCY
    | typeof NBC_AND_PNC
    | typeof NBC_AND_PNC_CHILD
    | typeof NBC_AND_PNC_WOMAN
    | typeof NUTRITION;

/**
 * factory function to generate react-query queryKey and function's sms slice depending on module
 * @param module compartments module type
 * @returns an object with a query key and the corresponding sms slice number
 */
export const queryKeyAndSmsSlice = (module: moduleType) => ({
    queryKey:
        module === PREGNANCY
            ? FETCH_COMPARTMENTS_PREGNANCY_SLICE
            : module === NBC_AND_PNC || module === NBC_AND_PNC_CHILD || module === NBC_AND_PNC_WOMAN
            ? FETCH_COMPARTMENTS_NBC_AND_PNC_SLICE
            : FETCH_COMPARTMENTS_NUTRITION_SLICE,
    smsSlice:
        module === PREGNANCY
            ? COMPARTMENTS_PREGNANCY_SLICE
            : module === NBC_AND_PNC || module === NBC_AND_PNC_CHILD || module === NBC_AND_PNC_WOMAN
            ? COMPARTMENTS_NBC_AND_PNC_SLICE
            : COMPARTMENTS_NUTRITION_SLICE,
});

// analysis page i-frames
export const getAnalysisDashboardEndpoint = (module: LogFaceModules) => {
    const dashboardsByModule = {
        [PREGNANCY_MODULE]: SUPERSET_PREGNANCY_ANALYSIS_DASHBOARD,
        [NBC_AND_PNC_MODULE]: SUPERSET_NBC_AND_PNC_ANALYSIS_DASHBOARD,
        [NUTRITION_MODULE]: SUPERSET_NUTRITION_ANALYSIS_DASHBOARD,
    };

    const dashboardNumber = dashboardsByModule[module];
    return `${SUPERSET_API_BASE}superset/dashboard/${dashboardNumber}/?standalone=true`;
};

// csv export links
export const supersetPregnancyDataExportUrl = (slice: string) =>
    `${SUPERSET_API_BASE}superset/explore_json/?form_data={"slice_id":${slice}}&csv=true`;
