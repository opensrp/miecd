/* eslint-disable @typescript-eslint/no-explicit-any */
import { values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { EVENT_DATE_DATE_FORMAT, EVENT_ID } from '../../constants';
import { groupBy, formatDateStrings, sortByEventDate } from '../../helpers/utils';
import { SmsFilterFunction } from '../../types';
import { Dictionary } from '@onaio/utils';
import { createSelector } from 'reselect';
import { TreeNode } from './locationHierarchy/types';
import intersect from 'fast_array_intersect';

/** The reducer name */
export const reducerName = 'SmsReducer';

/** Interface for SMS record object as received from discover */
export interface SmsData extends Dictionary {
    age: string;
    EventDate: string;
    event_id: string;
    health_worker_location_name: string;
    message: string;
    anc_id: string;
    logface_risk: string;
    health_worker_name: string;
    sms_type: string;
    height: number;
    weight: number;
    previous_risks: string;
    lmp_edd: any;
    parity: number;
    gravidity: number;
    location_id: string;
    client_type: string;
    child_symptoms: string;
    mother_symptoms: string;
    date_of_birth: string;
    nutrition_status: string;
    growth_status: string;
    feeding_category: string;
    event_date: string;
    intervention: string;
    bp: string;
}

// actions
/** FETCH_SMS action type */
export const FETCHED_SMS = 'opensrp/reducer/FETCHED_SMS';
/** REMOVE_SMS action type */
export const REMOVE_SMS = 'opensrp/reducer/REMOVE_SMS';
/** ADD_FILTER_ARGS type */
export const ADD_FILTER_ARGS = 'opensrp/reducer/ADD_FILTER_ARGS';
/** REMOVE_FILTER_ARGS type */
export const REMOVE_FILTER_ARGS = 'opensrp/reducer/REMOVE_FILTER_ARGS';

/** interface for sms fetch */
export interface FetchSmsAction extends AnyAction {
    smsData: { [key: string]: SmsData };
    type: typeof FETCHED_SMS;
}

/** interface for Remove Sms action */
export interface RemoveSmsAction extends AnyAction {
    // eslint-disable-next-line @typescript-eslint/ban-types
    smsData: {};
    type: typeof REMOVE_SMS;
}

/** Interface for Remove  filter args action */
export interface RemoveFilterArgs extends AnyAction {
    filterArgs: null;
    type: typeof REMOVE_FILTER_ARGS;
}

/** Interface for AddFilterArgs */
export interface AddFilterArgsAction extends AnyAction {
    filterArgs: SmsFilterFunction[];
    type: typeof ADD_FILTER_ARGS;
}

/** Create type for SMS reducer actions */
export type SmsActionTypes = FetchSmsAction | AddFilterArgsAction | RemoveSmsAction | RemoveFilterArgs | AnyAction;

// action Creators

/** Fetch SMS action creator
 * @param {SmsData[]} smsData - SmsData array to add to store
 * @return {FetchSmsAction} - an action to add SmsData to redux store
 */
export const fetchSms = (smsDataList: SmsData[] = []): FetchSmsAction => {
    const cleanedSms = smsDataList.map((smsData) => ({
        ...smsData,
        EventDate: formatDateStrings(smsData.EventDate, EVENT_DATE_DATE_FORMAT),
    }));
    return {
        smsData: groupBy(cleanedSms, EVENT_ID),
        type: FETCHED_SMS as typeof FETCHED_SMS,
    };
};

/** REMOVE SMS action */
export const removeSms: RemoveSmsAction = {
    smsData: {},
    type: REMOVE_SMS,
};

/** Add filter args action creator */
export const addFilterArgs = (filterArgs: SmsFilterFunction[]): AddFilterArgsAction => {
    return {
        filterArgs,
        type: ADD_FILTER_ARGS as typeof ADD_FILTER_ARGS,
    };
};

export const removeFilterArgs = (): RemoveFilterArgs => {
    return { filterArgs: null, type: REMOVE_FILTER_ARGS };
};
// The reducer

/** interface for sms state in redux store */
interface SmsState {
    smsData: { [key: string]: SmsData };
    smsDataFetched: boolean;
    filterArgs: SmsFilterFunction[] | null;
}

/** initial sms-state state */
const initialState: SmsState = {
    filterArgs: null,
    smsData: {},
    smsDataFetched: false,
};

/** the sms reducer function */
export default function reducer(state: SmsState = initialState, action: SmsActionTypes): SmsState {
    switch (action.type) {
        case FETCHED_SMS:
            return {
                ...state,
                smsData: { ...state.smsData, ...action.smsData },
                smsDataFetched: true,
            };
        case REMOVE_SMS:
            return {
                ...state,
                smsData: action.smsData,
                smsDataFetched: false,
            };
        case ADD_FILTER_ARGS:
            return {
                ...state,
                filterArgs: [...(state.filterArgs ? state.filterArgs : []), ...action.filterArgs],
            };
        case REMOVE_FILTER_ARGS:
            return {
                ...state,
                filterArgs: action.filterArgs,
            };
        default:
            return state;
    }
}

// // Selectors

/** returns all data in the store as values whose keys are their respective ids
 * @param {Partial<Store>} state - the redux store
 * @return { { [key: string] : SmsData}[] } - SmsData object[] as values, respective ids as keys
 */
export function getSmsData(state: Partial<Store>): SmsData[] {
    return values((state as any)[reducerName].smsData);
}

/** returns true if sms data has been fetched from superset and false
 * if the data has not been fetched
 */
export function smsDataFetched(state: Partial<Store>): boolean {
    return (state as any)[reducerName].smsDataFetched;
}

/**
 * Returns a list of SmsData that has been filtered based on the value
 * of a field specified.
 * @param {Partial<Store>} state - the state of the SmsReducer redux store.
 * @param {SmsFilterFunction[]}  filterArgs - an array of SMS_FILTER_FUNCTIONs.
 * @return {SmsData[]} - an array of SmsData objects that have passed the filtration criteria of all the filterArgs.
 */
export function getFilteredSmsData(state: Partial<Store>, filterArgs: SmsFilterFunction[]): SmsData[] {
    let results = values((state as any)[reducerName].smsData);
    for (const filterArgsIndex in filterArgs) {
        if (filterArgsIndex) {
            results = results.filter(filterArgs[filterArgsIndex]);
        }
    }
    return results;
}

/** Returns the filterArgs currently in the store */
export function getFilterArgs(state: Partial<Store>): SmsFilterFunction[] {
    if ((state as any)[reducerName].filterArgs) {
        return (state as any)[reducerName].filterArgs;
    }
    return [];
}

export interface RiskCategoryFilter {
    accessor: keyof SmsData;
    filterValue: string;
}

/** RESELECT */
export interface SMSSelectorsFilters {
    locationNode?: TreeNode;
    riskCategory?: RiskCategoryFilter;
    smsTypes?: string[];
    searchFilter?: string;
    patientId?: string;
}

export const getLocationNodeFilter = (_: Partial<Store>, props: SMSSelectorsFilters) => props.locationNode;
export const getRiskCat = (_: Partial<Store>, props: SMSSelectorsFilters) => props.riskCategory;
export const getSmsTypes = (_: Partial<Store>, props: SMSSelectorsFilters) => props.smsTypes;
export const getSearch = (_: Partial<Store>, props: SMSSelectorsFilters) => props.searchFilter;
export const getPatientId = (_: Partial<Store>, filters: SMSSelectorsFilters) => filters.patientId;

/** filter smsData by user's location, will return all smsEvents in locations where the user
 * has access
 */
export const getSmsDataByUserLocation = () =>
    createSelector(getSmsData, getLocationNodeFilter, (smsData, locationNode) => {
        if (locationNode === undefined) {
            return smsData;
        }
        const descendantLocIdsLookup: Record<string, true> = {};
        locationNode.walk((node) => {
            descendantLocIdsLookup[node.model.id] = true;
            return true;
        });
        const smsEventsOfInterest = smsData.filter((sms) => {
            return descendantLocIdsLookup[sms.location_id];
        });
        return smsEventsOfInterest;
    });

/** filter smsData by the smsData risk categorization
 */
export const getSmsDataByRiskCat = () =>
    createSelector(getSmsData, getRiskCat, (smsData, riskCategory) => {
        if (riskCategory?.filterValue === undefined) {
            return smsData;
        }
        const { accessor, filterValue } = riskCategory;
        return smsData.filter((sms) => sms[accessor] === filterValue);
    });

/** filter sms' by their types */
export const getSmsDataBySmsType = () =>
    createSelector(getSmsData, getSmsTypes, (smsData, smsTypes) => {
        if (smsTypes === undefined) {
            return smsData;
        }
        return smsData.filter((sms) => smsTypes.map((type) => type.toLowerCase()).includes(sms.sms_type.toLowerCase()));
    });

/** filter sms events from a search action, this will filter based on the event_id, health_worker_name and patient_id */
export const getSmsDataBySearch = () =>
    createSelector(getSmsData, getSearch, (smsData, search) => {
        if (search === undefined) {
            return smsData;
        }
        return smsData.filter(
            (dataItem) =>
                dataItem.event_id.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
                dataItem.health_worker_name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
                dataItem.anc_id.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
        );
    });

export const getSmsDataByPatientId = () =>
    createSelector(getSmsData, getPatientId, (smsData, patientId) => {
        if (patientId === undefined) {
            return smsData;
        }
        return smsData.filter((sms) => sms.anc_id === patientId);
    });

const selectSmsByLocation = getSmsDataByUserLocation();
const selectSmsByRisk = getSmsDataByRiskCat();
const selectSmsByType = getSmsDataBySmsType();
const selectSmsBySearch = getSmsDataBySearch();
const selectSmsByPatientId = getSmsDataByPatientId();

/** main selector function, composes all of the above reselect selectors for a unified selection interface */
export const getSmsDataByFilters = () => {
    return createSelector(
        selectSmsByLocation,
        selectSmsByRisk,
        selectSmsByType,
        selectSmsBySearch,
        selectSmsByPatientId,
        (byLocation, byRisk, bySmsType, bySearch, byPatientId) => {
            return sortByEventDate(intersect([byLocation, byRisk, bySmsType, bySearch, byPatientId], JSON.stringify));
        },
    );
};
