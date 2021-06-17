/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { getOnadataUserInfo, getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { SessionState } from '@onaio/session-reducer';
import {
    LOCATION_SLICES,
    ONADATA_OAUTH_STATE,
    OPENSRP_OAUTH_STATE,
    SUPERSET_SMS_DATA_SLICE,
    USER_LOCATION_DATA_SLICE,
} from '../configs/env';
import {
    LogFaceModules,
    nutritionModuleRiskFilterLookup,
    pregnancyModuleRiskFilterLookup,
    toastConfig,
} from '../configs/settings';
import {
    CHILD_PATIENT_DETAIL,
    COMMUNE,
    COUNTRY,
    DATE_FORMAT,
    DISTRICT,
    EC_CHILD,
    EC_FAMILY_MEMBER,
    EC_WOMAN,
    HIERARCHICAL_DATA_URL,
    MODULE_SEARCH_PARAM_KEY,
    NBC_AND_PNC_CHILD,
    NBC_AND_PNC_COMPARTMENTS_URL,
    NBC_AND_PNC_MODULE,
    NBC_AND_PNC_WOMAN,
    NUTRITION,
    NUTRITION_COMPARTMENTS_URL,
    NUTRITION_MODULE,
    OPENSRP_SECURITY_AUTHENTICATE,
    PATIENT_DETAIL,
    PREGNANCY,
    PREGNANCY_COMPARTMENTS_URL,
    PREGNANCY_MODULE,
    PROVINCE,
    SMS_MESSAGE_DATE_DATE_FORMAT,
    VIETNAM,
    VIETNAM_COUNTRY_LOCATION_ID,
    VILLAGE,
} from '../constants';
import { OpenSRPService } from '../services/opensrp';
import supersetFetch from '../services/superset';
import store from '../store';
import {
    fetchLocations,
    fetchUserId,
    fetchUserLocations,
    Location,
    userIdFetched,
    UserLocation,
    userLocationDataFetched,
} from '../store/ducks/locations';
import { fetchSms, LogFaceSmsType, SmsData, smsDataFetched, CompartmentSmsTypes } from '../store/ducks/sms_events';
import { Dictionary } from '@onaio/utils';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { format, isWithinInterval, parse, subYears, toDate } from 'date-fns';
import { split, trim, replace } from 'lodash';
import * as React from 'react';
import { TFunction } from 'i18next';
import { ActionCreator } from 'redux';
import { SupersetFormData } from '@onaio/superset-connector';
import { stringifyUrl } from 'query-string';
export type { Dictionary };

/** Custom function to get oAuth user info depending on the oAuth2 provider
 * It compares the value of the `state` param in the oAuth2 provider config
 * to the one received from the oAuth2 provider in order to return the correct
 * user info getter function
 * @param {{[key: string]: any }} apiResponse - the API response object
 */
export function oAuthUserInfoGetter(apiResponse: Dictionary): SessionState | void {
    if (Object.keys(apiResponse).includes('oAuth2Data')) {
        switch (apiResponse.oAuth2Data.state) {
            case OPENSRP_OAUTH_STATE:
                return getOpenSRPUserInfo(apiResponse);
            case ONADATA_OAUTH_STATE:
                return getOnadataUserInfo(apiResponse);
        }
    }
}

/**
 * Append a number suffix such as 'st' for 1 and 'nd' for 2 and so on.
 * @param num
 */
export function getNumberSuffix(num: number): string {
    const divisionBy10Remainder: number = num % 10;
    if (divisionBy10Remainder === 1) {
        return 'st';
    }
    if (divisionBy10Remainder === 2) {
        return 'nd';
    }
    if (divisionBy10Remainder === 3) {
        return 'rd';
    }
    return 'th';
}

/**
 *
 * @param userLocationData - an array of UserLocation data fetched from a  Superset slice
 * @param userUUID - the UUID of the user logged in obtained from an openSRP endpoint.
 */
export function getLocationId(userLocationData: UserLocation[], userUUID: string) {
    const userDetailObj =
        userLocationData.length &&
        userLocationData.find((userLocationDataItem: UserLocation) => userLocationDataItem.provider_id === userUUID);
    if (userDetailObj) {
        return userDetailObj.location_id as string;
    }
    return '';
}

/**
 *
 * @param locationId location ID that we want to find in locations
 * @param locations a list of Location objects from which we want to find a location ID
 */
export const locationIdIn = (locationId: string, locations: Location[]) => {
    return locations.find((location: Location) => location.location_id === locationId);
};

/**
 * An object representing the filter function and location level for a logged in user.
 */
export interface FilterFunctionAndLocationLevel {
    locationFilterFunction: (CompartmentSmsData: CompartmentSmsTypes) => boolean;
    locationLevel: number;
}

/**
 * calculate the filter function and location level for a logged in user
 * @param userLocationId - the location ID of the logged in user.
 * @param provinces - a list of locations of level province
 * @param districts - a list of locations of level district
 * @param communes - a list of locations of level commune
 * @param villages - a list of locations of level village
 * @return {FilterFunctionAndLocationLevel} an object that contains the users
 * location level and a filter function based on that location level.
 */
export function getFilterFunctionAndLocationLevel(
    userLocationId: string,
    [provinces, districts, communes, villages]: Location[][],
): FilterFunctionAndLocationLevel {
    let locationFilterFunction: (CompartmentSmsData: CompartmentSmsTypes) => boolean = () => {
        return false;
    };

    let userLocationLevel = 4;

    if (userLocationId === VIETNAM_COUNTRY_LOCATION_ID) {
        userLocationLevel = 0;
        locationFilterFunction = () => true;
    }

    if (locationIdIn(userLocationId, provinces)) {
        userLocationLevel = 1;
        locationFilterFunction = (CompartmentSmsData: CompartmentSmsTypes): boolean => {
            // tslint:disable-next-line: no-shadowed-variable
            const village = villages.find((location: Location) => {
                return location.location_id === CompartmentSmsData.location_id;
            });
            if (village) {
                return (
                    userLocationId === getProvince(village as Location & { level: typeof VILLAGE }, districts, communes)
                );
            }
            return false;
        };
    }

    if (locationIdIn(userLocationId, districts)) {
        userLocationLevel = 2;
        locationFilterFunction = (CompartmentSmsData: CompartmentSmsTypes): boolean => {
            // tslint:disable-next-line: no-shadowed-variable
            const village = villages.find((location: Location) => {
                return location.location_id === CompartmentSmsData.location_id;
            });
            if (village) {
                return userLocationId === getDistrict(village as Location & { level: typeof VILLAGE }, communes);
            }
            return false;
        };
    }

    if (locationIdIn(userLocationId, communes)) {
        userLocationLevel = 3;
        locationFilterFunction = (CompartmentSmsData: CompartmentSmsTypes): boolean => {
            // tslint:disable-next-line: no-shadowed-variable
            const village = villages.find((location: Location) => {
                return location.location_id === CompartmentSmsData.location_id;
            });
            if (village) {
                return userLocationId === getCommune(village as Location & { level: typeof VILLAGE });
            }
            return false;
        };
    }

    if (locationIdIn(userLocationId, villages)) {
        userLocationLevel = 4;
        locationFilterFunction = (CompartmentSmsData: CompartmentSmsTypes): boolean => {
            return userLocationId === CompartmentSmsData.location_id;
        };
    }

    return {
        locationFilterFunction,
        locationLevel: userLocationLevel,
    } as FilterFunctionAndLocationLevel;
}

/**
 * Given a village return it's commune's location ID
 * @param {Location} village - village Location to find commune
 */
export const getCommune = (village: Location & { level: typeof VILLAGE }): string => {
    return village.parent_id;
};

/**
 * Given a village and a list of all communes, find it's District
 * @param {Location} village - village Location for which we want to find a District.
 * @param communes
 */
export const getDistrict = (village: Location & { level: typeof VILLAGE }, communes: Location[]): string | null => {
    const communeId = getCommune(village);
    const commune = communes.find((location: Location) => location.location_id === communeId);
    return commune ? commune.parent_id : null;
};

/**
 * Given a village, a list of all districts and a list of all communes, find it's province
 * @param village - village Location for which we want to find a Province.
 * @param districts
 * @param communes
 */
export const getProvince = (
    village: Location & { level: typeof VILLAGE },
    districts: Location[],
    communes: Location[],
): string | null => {
    const districtId = getDistrict(village, communes);
    return districtId
        ? districts.find((location: Location) => location.location_id === districtId)?.parent_id ?? null
        : null;
};

/**
 * sort SmsData[] by EventDate in descending order(i.e. the most recent events come first)
 * @param {SmsData[]} smsData an array of smsData objects to sort by event date
 */
export const sortByEventDate = <T extends { event_date: string }>(smsData: T[]) => {
    return smsData.sort((event1, event2): number => {
        const date1 = Date.parse(event1.event_date);
        const date2 = Date.parse(event2.event_date);
        return date2 - date1;
    });
};

/**
 * get number of days since a certain day specified by a date string.
 * @param date
 */
export const getNumberOfDaysSinceDate = (date: string): number => {
    return Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24));
};

/*
 * an object representing information required to build the header breadcrumb and to filter out data
 */
export interface HeaderBreadCrumb {
    location: string;
    path: string;
    locationId: string;
    level: string;
}

/**
 * returns an object that is used to create the header breadcrumb on the Compartments component
 * @param locationId - location ID  of where the user is assigned;
 * this could be a province, district, commune or village
 * @return { HeaderBreadCrumb }
 */
export function buildHeaderBreadCrumb(
    locationId: string,
    provinces: Location[],
    districts: Location[],
    communes: Location[],
    villages: Location[],
    countryLocationId: string,
): HeaderBreadCrumb {
    if (locationIdIn(locationId, provinces)) {
        const userProvince = provinces.find((province: Location) => province.location_id === locationId);
        return {
            level: PROVINCE,
            location: userProvince!.location_name,
            locationId: userProvince!.location_id,
            path: '',
        };
    }
    if (locationIdIn(locationId, districts)) {
        const userDistrict = districts.find((district: Location) => district.location_id === locationId);
        const userProvince = provinces.find((province: Location) => province.location_id === userDistrict!.parent_id);
        return {
            level: DISTRICT,
            location: userDistrict!.location_name,
            locationId: userDistrict!.location_id,
            path: `${userProvince!.location_name} / `,
        };
    }
    if (locationIdIn(locationId, communes)) {
        const userCommune = communes.find((commune: Location) => commune.location_id === locationId);
        const userDistrict = districts.find((district: Location) => district.location_id === userCommune!.parent_id);
        const userProvince = provinces.find((province: Location) => province.location_id === userDistrict!.parent_id);
        return {
            level: COMMUNE,
            location: userCommune!.location_name,
            locationId: userCommune!.location_id,
            path: `${userProvince!.location_name} / ${userDistrict!.location_name} / `,
        };
    }
    if (locationIdIn(locationId, villages)) {
        const userVillage = villages.find((village: Location) => village.location_id === locationId);
        const userCommune = communes.find((commune: Location) => commune.location_id === userVillage!.parent_id);
        const userDistrict = districts.find((district: Location) => district.location_id === userCommune!.parent_id);
        const userProvince = provinces.find((province: Location) => province.location_id === userDistrict!.parent_id);
        return {
            level: VILLAGE,
            location: userVillage!.location_name,
            locationId: userVillage!.location_id,
            path: `${userProvince!.location_name} / ${userDistrict!.location_name} / ${userCommune!.location_name} / `,
        };
    }
    if (countryLocationId === locationId) {
        return {
            level: COUNTRY,
            location: VIETNAM,
            locationId: countryLocationId,
            path: '',
        };
    }
    return { path: '', location: '', locationId: '', level: '' };
}

/**
 * Get a link to any of the modules compartments.
 * @param module string representing the module whose link you would like to get
 * @return link to module compartment
 */
export function getModuleLink(
    module: string,
): typeof PREGNANCY_COMPARTMENTS_URL | typeof NUTRITION_COMPARTMENTS_URL | typeof NBC_AND_PNC_COMPARTMENTS_URL | '' {
    switch (module) {
        case PREGNANCY:
            return PREGNANCY_COMPARTMENTS_URL;
        case NUTRITION:
            return NUTRITION_COMPARTMENTS_URL;
        case NBC_AND_PNC_WOMAN:
            return NBC_AND_PNC_COMPARTMENTS_URL;
        case NBC_AND_PNC_CHILD:
            return NBC_AND_PNC_COMPARTMENTS_URL;
        default:
            return '';
    }
}

/**
 * Get a link to the HierarchicalDataTable component
 * @param {string} riskLevel string value that will be passed to hierarchicalDataTable
 * as prop. representing that column should be coloured.
 * @param {string} module string representing the module
 * @param {string} title title to be passed to hierarchical data table as a prop
 * @param {number} permissionLevel - number ranging from 0 - 4 that represents the permission level of the user.
 * @param {string} locationId - the users location id.
 */
export function getLinkToHierarchicalDataTable(
    riskLevel: string,
    module: string,
    title: string,
    permissionLevel: number,
    locationId: string,
) {
    if (permissionLevel === 4) {
        return '#';
    }
    return `${getModuleLink(
        module,
    )}${HIERARCHICAL_DATA_URL}/${module}/${riskLevel}/${title}/${permissionLevel}/down/${locationId}/${permissionLevel}`;
}

/**
 * get a link to patient details depending on the patient type
 * @param {SmsData} smsData - an object representing a single smsEvent
 * @param {string} prependWith- the url we want to prepend this link/string with.
 */
export function getLinkToPatientDetail(smsData: LogFaceSmsType, prependWith: string, module: LogFaceModules) {
    let url = '#';
    if (smsData.client_type === EC_CHILD) {
        url = `${prependWith}/${CHILD_PATIENT_DETAIL}/${smsData.patient_id}`;
    }
    if (smsData.client_type === EC_WOMAN || smsData.client_type === EC_FAMILY_MEMBER) {
        url = `${prependWith}/${PATIENT_DETAIL}/${smsData.patient_id}`;
    }
    return stringifyUrl({ url, query: { [MODULE_SEARCH_PARAM_KEY]: module } });
}

/**
 * fetch the following data asynchronously from superset and add to store:
 * a. userId
 * b. USER_LOCATION_DATA_SLICE
 * c. LOCATION_SLICES
 * d. SUPERSET_SMS_DATA_SLICE
 * @param supersetFetchMethod - optional method to fetch data from superset
 */
export async function fetchData(
    supersetFetchMethod: typeof supersetFetch = supersetFetch,
    toFetchUserHierarchy = true,
    toFetchUserLocation = true,
    toFetchLocations = true,
    toFetchSms = true,
) {
    const promises = [];
    if (toFetchUserHierarchy && !userIdFetched(store.getState())) {
        const opensrpService = new OpenSRPService(OPENSRP_SECURITY_AUTHENTICATE);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userIdPromise = opensrpService.read('').then((response: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const userId = (response as any).user.baseEntityId;
            store.dispatch(fetchUserId(userId));
        });
        promises.push(userIdPromise);
    }

    // fetch user location details
    if (toFetchUserLocation && !userLocationDataFetched(store.getState())) {
        const locationDataPromise = supersetFetchMethod(USER_LOCATION_DATA_SLICE).then((result: UserLocation[]) => {
            store.dispatch(fetchUserLocations(result));
        });
        promises.push(locationDataPromise);
    }

    // fetch all location slices
    for (const slice in LOCATION_SLICES) {
        if (toFetchLocations && slice) {
            const locationPromise = supersetFetchMethod(LOCATION_SLICES[slice]).then((result: Location[]) => {
                store.dispatch(fetchLocations(result));
            });
            promises.push(locationPromise);
        }
    }

    // check if sms data is fetched and then fetch if not fetched already
    if (toFetchSms && !smsDataFetched(store.getState())) {
        const smsDataPromise = supersetFetchMethod(SUPERSET_SMS_DATA_SLICE).then((result: SmsData[]) => {
            store.dispatch(fetchSms(result));
        });
        promises.push(smsDataPromise);
    }

    return Promise.all(promises).catch((err) => {
        throw err;
    });
}

/**
 * Helper function to fetch superset/discover slices and return without dispatch
 * @param supersetSlice superset/discover slice number
 * @returns an array of slice type
 */
export async function fetchSupersetData<ReturnType>(
    supersetSlice: string,
    t: TFunction,
    supersetOptions: SupersetFormData | null = null,
    supersetService: typeof supersetFetch = supersetFetch,
): Promise<ReturnType[]> {
    const asyncOperation = supersetOptions
        ? supersetService(supersetSlice, supersetOptions)
        : supersetService(supersetSlice);
    return asyncOperation
        .then((response: ReturnType[] | undefined) => {
            if (!response) {
                throw new Error(t('Network response was not ok'));
            }
            return response;
        })
        .catch((error) => {
            throw error;
        });
}

/**
 * helper function to fetch data from the auth endpoint
 * @param endpoint authentication endpoint
 * @returns auth data
 */
export async function fetchOpenSrpData(endpoint: string, t: TFunction) {
    const openSrpService = new OpenSRPService(OPENSRP_SECURITY_AUTHENTICATE);
    return (
        openSrpService
            .read(endpoint)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((response: any) => {
                if (!response) {
                    throw new Error(t('Network response was not ok'));
                }
                return response;
            })
            .catch((error) => {
                throw error;
            })
    );
}

/** convert milliseconds to years (rounded off to two decimal places)
 * @param mSeconds - time in milliseconds
 */
export const convertMillisecondsToYear = (mSeconds: number) => {
    const years = mSeconds / (365 * 24 * 60 * 60 * 1000);
    const yearsRounded = Math.round((years + Number.EPSILON) * 100) / 100;
    return yearsRounded;
};

/** facade to display a success toast
 * @param message - message to include in toast
 */
export const toastToSuccess = (message: string) => {
    return toast.success(message, toastConfig);
};

/** facade to display an error toast
 * @param message - message to include in toast
 */
export const toastToError = (message: string) => {
    return toast.error(message, toastConfig);
};

/** custom hook that abstracts behavior of a broken page */
export const useHandleBrokenPage = () => {
    const [broken, setBroken] = useState<boolean>(false);
    const [error, setError] = useState<Error | undefined>();

    /**
     * Convenience function to handle cases where we must abort and tell the user we have done so
     *
     * @param {Error} error - Error object
     */
    function handleBrokenPage(error: Error) {
        toastToError(error.message);
        setError(error);
        setBroken(true);
    }

    return { broken, error, handleBrokenPage };
};

/** formats dates strings in a globally set format
 *
 * @param dateString - the date as a string
 * @param currentFormat - describe how date is formatted, refer https://date-fns.org/v2.21.1/docs/parse#description
 */
export const formatDateStrings = (dateString: string, currentFormat: string) => {
    return format(parse(dateString, currentFormat, new Date()), DATE_FORMAT);
};

/** convert the smsData message field from prose to more easily readable
 * point format
 *
 * @param message - the message prose.
 */
export const parseMessage = (message: string) => {
    const dateRegexInMessage = /\d{2}-\d{2}-\d{4}/;
    let cleanedMessage = message;
    const hasDate = dateRegexInMessage.test(message);
    if (hasDate) {
        const foundDates = message.match(dateRegexInMessage) ?? [];
        const newDateStrings = foundDates?.map((dateString) =>
            formatDateStrings(dateString, SMS_MESSAGE_DATE_DATE_FORMAT),
        );
        foundDates.forEach((dateString, index) => {
            cleanedMessage = replace(cleanedMessage, RegExp(dateString), newDateStrings[index]);
        });
    }
    const propValues = split(cleanedMessage, '\n');
    const replacedEquals = propValues.map(trim).map((entry) => replace(entry, / =\s*/, ' : '));
    const addedUnits = AddUnitsToMessageValues(replacedEquals);
    return (
        <ul>
            {addedUnits.map((value, index) => {
                return <li key={`${value}-${index}`}>{value}</li>;
            })}
        </ul>
    );
};

/** adds units to values in smsEvents.message */
const AddUnitsToMessageValues = (parsedMessage: string[]) => {
    return parsedMessage.map((each) => {
        const [property, ...value] = split(each, ':');
        let valueWithUnit = value.join(':');
        const trimmedPropName = trim(property);
        if (trimmedPropName.toLowerCase().includes('weight')) {
            valueWithUnit = `${value.join(':')}kg`;
        }
        if (
            trimmedPropName.toLowerCase().includes('height') ||
            trimmedPropName.toLowerCase().includes('muac') ||
            trimmedPropName.toLowerCase().includes('length')
        ) {
            valueWithUnit = `${value.join(':')}cm`;
        }

        return [property, valueWithUnit].join(':');
    });
};

/** help extract an easily parseable age object from sms.age value */
export const getAndParseAge = (ageString: string) => {
    // sample ageString raw format: "2y 1m 0d "
    const yearRegex = /\d{1,3}(?=y)/;
    const monthRegex = /\d{1,2}(?=m)/;
    const dayRegex = /\d{1,2}(?=d)/;
    let years = 0,
        months = 0,
        days = 0;

    const hasYear = yearRegex.test(ageString);
    if (hasYear) {
        const foundYears = ageString.match(yearRegex) ?? [];
        years = Number(foundYears[0]) ?? 0;
    }
    const hasMonth = monthRegex.test(ageString);
    if (hasMonth) {
        const foundMonths = ageString.match(monthRegex) ?? [];
        months = Number(foundMonths[0]) ?? 0;
    }
    const hasDay = dayRegex.test(ageString);
    if (hasDay) {
        const foundDays = ageString.match(dayRegex) ?? [];
        days = Number(foundDays[0]) ?? 0;
    }
    return { years, months, days };
};

/** parse the date and return it as required here: https://github.com/opensrp/miecd/issues/13 */
export const formatAge = (ageString: string, t: TFunction) => {
    const age = getAndParseAge(ageString);
    if (age.years === 0 && age.months === 0) {
        return `${age.days} ${t('age.days')}`;
    }
    const sumMonthsAge = age.years * 12 + age.months;
    if (sumMonthsAge <= 24) {
        return `${sumMonthsAge} ${t('age.months')}`;
    }
    return `${age.years} ${t('age.years')}`;
};

/** abstracts code that actually makes the superset Call since it is quite similar
 * @param supersetSlice - slice string
 * @param actionCreator - redux action creator
 * @param supersetService - the supersetService
 * @param supersetOptions - adhoc filters for superset call
 */
export async function logFaceSupersetCall<TAction, TResponse>(
    module: LogFaceModules,
    supersetSlice: string,
    actionCreator: ActionCreator<TAction>,
    supersetService: typeof supersetFetch = supersetFetch,
    supersetOptions: SupersetFormData | null = null,
) {
    const asyncOperation = supersetOptions
        ? supersetService(supersetSlice, supersetOptions)
        : supersetService(supersetSlice);
    return asyncOperation
        .then((result: TResponse[] | undefined) => {
            if (result) {
                actionCreator(result, module);
            }
        })
        .catch((error) => {
            throw error;
        });
}

/** generate a RiskCategory object to be consumed by the getSmsByRiskCategory filter,
 * this depends on the configuration in settings, the module and the selected option in the ui
 * @param module - module in which logface view is rendered in
 * @param riskFilterValue - this is the option the user selected in the risk_level select filter
 */
export function getRiskCatFilter(module: string, riskFilterValue?: string) {
    if (!riskFilterValue) {
        return;
    }
    const mockTranslatorFunction = (t: string) => t;
    const pregnancyCats = pregnancyModuleRiskFilterLookup(mockTranslatorFunction);
    const nutritionCategories = nutritionModuleRiskFilterLookup(mockTranslatorFunction);
    let categoryToUse: Dictionary<Dictionary<string | string[]>> = pregnancyCats;
    if (module === NUTRITION_MODULE) {
        categoryToUse = nutritionCategories;
    }
    return {
        accessor: categoryToUse[riskFilterValue].accessor as string,
        filterValue: categoryToUse[riskFilterValue].filterValue as string[],
    };
}

/** returns common pagination props
 * @param t - the translator function
 */
export const getCommonPaginationProps = (t: TFunction) => {
    return {
        previousLabel: t('previous'),
        nextLabel: t('next'),
        breakLabel: <>&nbsp;&nbsp;...&nbsp;&nbsp;</>,
        breakClassName: 'page-item',
        marginPagesDisplayed: 2,
        pageRangeDisplayed: 3,
        containerClassName: 'pagination',
        activeClassName: 'active',
        pageClassName: 'page-item',
        previousClassName: 'page-item',
        nextClassName: 'page-item',
        pageLinkClassName: 'page-link',
        previousLinkClassName: 'page-link',
        nextLinkClassName: 'page-link',
    };
};

/** translate the module names themselves
 * @param t - the translator functions
 */
export const translatedModuleLabel = (t: TFunction) => {
    return {
        [PREGNANCY_MODULE]: t('Pregnancy'),
        [NUTRITION_MODULE]: t('Nutrition'),
        [NBC_AND_PNC_MODULE]: t('NBC & PNC'),
    };
};

/** filters events whose event_dates are within he last 24 months interval
 * @param records - the sms records
 * */
export const inThePast24Months = <T extends { event_date: string }>(records: T[]) => {
    const currentDate = new Date();
    const twoYearsBack = subYears(toDate(currentDate), 2);
    return records.filter((record) => {
        const thisDate = new Date(record.event_date);
        return isWithinInterval(thisDate, { start: twoYearsBack, end: currentDate });
    });
};
