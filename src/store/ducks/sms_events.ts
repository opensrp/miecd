/* eslint-disable @typescript-eslint/no-explicit-any */
import { keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { EC_CHILD, EC_FAMILY_MEMBER, EC_WOMAN, EVENT_DATE_DATE_FORMAT, EVENT_ID } from '../../constants';
import { groupBy, formatDateStrings, sortByEventDate } from '../../helpers/utils';
import { SmsFilterFunction, CompartmentsSmsFilterFunction } from '../../types';
import { Dictionary } from '@onaio/utils';
import { createSelector } from 'reselect';
import { TreeNode } from '../../helpers/locationHierarchy/types';
import intersect from 'fast_array_intersect';
import { LogFaceModules } from '../../configs/settings';

/** The reducer name */
export const reducerName = 'SmsReducer';
export type ClientType = typeof EC_CHILD | typeof EC_FAMILY_MEMBER | typeof EC_WOMAN;

export interface BaseLogFaceSms {
    event_id: string;
    EventDate: string;
    health_worker_location_name: string;
    sms_type: string;
    patient_id: string;
    patient_name: string;
    age: string;
    message: string;
    logface_risk: string;
    health_worker_name: string;
    event_date: string;
    risk_level: string;
    location_id: string;
    client_type: ClientType;
    health_worker_contact: string;
    message_vt: string;
}

// describes smsEvents received from the slices serving the logface with data.
export interface PregnancyLogFaceSms extends BaseLogFaceSms {
    pregnancy_id: string;
}

// describes smsEvents received from the slices serving the Nutrition logface with data.
export interface NutritionLogFaceSms extends PregnancyLogFaceSms {
    nutrition_status: string;
    growth_status: string;
    feeding_category: string;
    child_risk_level: string;
    gender: string;
}

/** common fields to compartment sms */
export interface BaseCompartmentsSms {
    health_insurance: string;
    event_id: string;
    ethnicity: string;
    household: string;
    toilet: string;
    handwashing: string;
}

export interface BaseCompartmentSms {
    patient_id: string;
    base_entity_id: string;
    practitioner_name: string;
    event_date: string;
    team: string;
    age: string;
    event_id: string;
}

/** Interfaces for SMS record objects as received from discover*/
export interface PregnancySmsData extends BaseCompartmentSms {
    event_type: string;
    contact: string;
    anc_visit_date: string;
    next_anc_date: string;
    parity: number;
    gravidity: number;
    height: number;
    weight: number;
    mother_symptoms: string;
    previous_risks: string;
    bmi: number;
    lmp: string;
    lmp_edd: string;
    risk_level: string;
    bp: string;
    location_id: string;
    planned_delivery_location: string;
    location_name: string;
}

export interface NutritionSmsData extends BaseCompartmentSms {
    muac: number;
    weight: number;
    height: number;
    status: string;
    supplements: string;
    team: string;
    weight_z_score: number;
    height_z_score: number;
    nutrition_status: string;
    growth_status: string;
    feeding_category: string;
    location_id: string;
    dob: string;
    location_name: string;
}

export interface NbcPncSmsData extends BaseCompartmentSms {
    event_type: string;
    client_type: string;
    child_symptoms: string;
    mother_symptoms: string;
    breastfeeding: string;
    intervention: string;
    risk_level: string;
    team: string;
    location_id: string;
    location_name: string;
    previous_risks: string;
    delivery_location: string;
    dob: string;
}

export type CompartmentSmsTypes = PregnancySmsData | NutritionSmsData | NbcPncSmsData;

export type LogFaceSmsType = PregnancyLogFaceSms | NutritionLogFaceSms;

/** Interface for SMS record object as received from discover */
export interface SmsData extends NutritionLogFaceSms, Dictionary {
    height: number;
    weight: number;
    previous_risks: string;
    lmp_edd: string | number;
    parity: number;
    gravidity: number;
    location_id: string;
    child_symptoms: string;
    mother_symptoms: string;
    date_of_birth: string;
    event_date: string;
    intervention: string;
    bp: string;
    planned_delivery_location: string;
    location: string;
    delivery_location: string;
}

// actions
/** FETCH_SMS action type */
export const FETCHED_SMS = 'opensrp/reducer/FETCHED_SMS';
/** FETCH_SMS action type for logface sms's */
export const FETCHED_LOGFACE_SMS = 'opensrp/reducer/FETCHED_LOGFACE_SMS';
/** remove sms action type for logface sms's */
export const REMOVE_LOGFACE_SMS = 'opensrp/reducer/REMOVE_LOGFACE_SMS';
/** REMOVE_SMS action type */
export const REMOVE_SMS = 'opensrp/reducer/REMOVE_SMS';
/** ADD_FILTER_ARGS type */
export const ADD_FILTER_ARGS = 'opensrp/reducer/ADD_FILTER_ARGS';
/** REMOVE_FILTER_ARGS type */
export const REMOVE_FILTER_ARGS = 'opensrp/reducer/REMOVE_FILTER_ARGS';

/** interface for logface sms fetch */
export interface FetchLogFaceSmsAction extends AnyAction {
    smsData: Dictionary<LogFaceSmsType>;
    type: typeof FETCHED_LOGFACE_SMS;
    module: LogFaceModules;
}

/** interface for Remove logface Sms action */
export interface RemoveLogFaceSmsAction extends AnyAction {
    type: typeof REMOVE_LOGFACE_SMS;
}

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
    filterArgs: CompartmentsSmsFilterFunction[];
    type: typeof ADD_FILTER_ARGS;
}

/** Create type for SMS reducer actions */
export type SmsActionTypes =
    | FetchSmsAction
    | AddFilterArgsAction
    | RemoveSmsAction
    | RemoveFilterArgs
    | FetchLogFaceSmsAction
    | RemoveLogFaceSmsAction
    | AnyAction;

// action Creators

/** creates action to add logface sms to store
 * @param sms - an array of the sms events
 * @param module - module to save the under
 */
export const fetchLogFaceSms = (sms: LogFaceSmsType[], module: LogFaceModules): FetchLogFaceSmsAction => {
    const cleanedSms = sms.map((smsData) => ({
        ...smsData,
        EventDate: formatDateStrings(smsData.EventDate, EVENT_DATE_DATE_FORMAT),
    }));
    return {
        smsData: keyBy(cleanedSms, (x) => x.event_id),
        module,
        type: FETCHED_LOGFACE_SMS,
    };
};

/** creates action to remove logface sms from store */
export const RemoveLogFaceSms = (): RemoveLogFaceSmsAction => {
    return {
        type: REMOVE_LOGFACE_SMS,
    };
};

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
export const addFilterArgs = (filterArgs: CompartmentsSmsFilterFunction[]): AddFilterArgsAction => {
    return {
        filterArgs,
        type: ADD_FILTER_ARGS as typeof ADD_FILTER_ARGS,
    };
};

export const removeFilterArgs = (): RemoveFilterArgs => {
    return { filterArgs: null, type: REMOVE_FILTER_ARGS };
};
// The reducer

export type LogFaceEvents = { [key in LogFaceModules]?: Dictionary<LogFaceSmsType> };

/** interface for sms state in redux store */
interface SmsState {
    smsData: { [key: string]: SmsData };
    smsDataFetched: boolean;
    filterArgs: SmsFilterFunction[] | null;
    logFaceEvents: LogFaceEvents;
}

/** initial sms-state state */
const initialState: SmsState = {
    filterArgs: null,
    smsData: {},
    smsDataFetched: false,
    logFaceEvents: {},
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
        case FETCHED_LOGFACE_SMS:
            return {
                ...state,
                logFaceEvents: {
                    ...state.logFaceEvents,
                    [action.module]: {
                        ...state.logFaceEvents[action.module as LogFaceModules],
                        ...action.smsData,
                    },
                },
            };
        case REMOVE_LOGFACE_SMS:
            return {
                ...state,
                logFaceEvents: {},
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

/** filter smsData by the anc_id field
 * @param state - the store
 * @param patientId - patientId whose events we are looking for
 */
export function selectSmsDataByPatientId(state: Partial<Store>, patientId: string) {
    const allSms = getSmsData(state);
    return allSms.filter((sms) => sms.anc_id === patientId);
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
export function getFilteredSmsData(state: Partial<Store>, filterArgs: CompartmentsSmsFilterFunction[]): SmsData[] {
    let results = values((state as any)[reducerName].smsData);
    for (const filterArgsIndex in filterArgs) {
        if (filterArgsIndex) {
            results = results.filter(filterArgs[filterArgsIndex]);
        }
    }
    return results;
}

/** Returns the filterArgs currently in the store */
export function getFilterArgs(state: Partial<Store>): CompartmentsSmsFilterFunction[] {
    if ((state as any)[reducerName].filterArgs) {
        return (state as any)[reducerName].filterArgs;
    }
    return [];
}

export interface RiskCategoryFilter {
    accessor: string;
    filterValue: string[];
}

/** RESELECT */
export interface SMSSelectorsFilters {
    locationNode?: TreeNode;
    riskCategory?: RiskCategoryFilter;
    smsTypes?: string[];
    searchFilter?: string;
    patientId?: string;
    module?: LogFaceModules;
}

export const getLocationNodeFilter = (_: Partial<Store>, props: SMSSelectorsFilters) => props.locationNode;
export const getRiskCat = (_: Partial<Store>, props: SMSSelectorsFilters) => props.riskCategory;
export const getSmsTypes = (_: Partial<Store>, props: SMSSelectorsFilters) => props.smsTypes;
export const getSearch = (_: Partial<Store>, props: SMSSelectorsFilters) => props.searchFilter;
export const getPatientId = (_: Partial<Store>, filters: SMSSelectorsFilters) => filters.patientId;
export const getModule = (_: Partial<Store>, props: SMSSelectorsFilters) => props.module;
export const getLogFaceSmsByModule = (state: Partial<Store>): LogFaceEvents =>
    (state as any)[reducerName].logFaceEvents;

/** base selector for sms, filters by module */
export const logFaceSmsBaseSelector = () =>
    createSelector(getLogFaceSmsByModule, getModule, (logFaceSmsByModule, module) => {
        if (module === undefined) {
            let allSms: LogFaceSmsType[] = [];
            for (const moduleKey in logFaceSmsByModule) {
                allSms = allSms.concat(values(logFaceSmsByModule[moduleKey as LogFaceModules]));
            }
            return allSms;
        }
        const requestedSms = logFaceSmsByModule[module] ?? {};
        return values(requestedSms);
    });

export const baseLogFaceSms = logFaceSmsBaseSelector();

/** filter smsData by user's location, will return all smsEvents in locations where the user
 * has access
 */
export const getSmsDataByUserLocation = () =>
    createSelector(baseLogFaceSms, getLocationNodeFilter, (smsData, locationNode) => {
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
    createSelector(baseLogFaceSms, getRiskCat, (smsData, riskCategory) => {
        if (riskCategory?.filterValue === undefined) {
            return smsData;
        }
        const { accessor, filterValue } = riskCategory;
        return smsData.filter((sms) => filterValue.includes((sms as Dictionary)[accessor]));
    });

/** filter sms' by their types */
export const getSmsDataBySmsType = () =>
    createSelector(baseLogFaceSms, getSmsTypes, (smsData, smsTypes) => {
        if (smsTypes === undefined) {
            return smsData;
        }
        return smsData.filter((sms) => smsTypes.map((type) => type.toLowerCase()).includes(sms.sms_type.toLowerCase()));
    });

/** filter sms events from a search action, this will filter based on the event_id, health_worker_name and patient_id */
export const getSmsDataBySearch = () =>
    createSelector(baseLogFaceSms, getSearch, (smsData, search) => {
        if (search === undefined) {
            return smsData;
        }
        return smsData.filter(
            (dataItem) =>
                dataItem.event_id.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
                dataItem.health_worker_name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
                dataItem.patient_id.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
        );
    });

/** filter sms events by patient Id */
export const getSmsDataByPatientId = () =>
    createSelector(baseLogFaceSms, getPatientId, (smsData, patientId) => {
        if (patientId === undefined) {
            return smsData;
        }
        return smsData.filter((sms) => sms.patient_id === patientId);
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
