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
import { toastConfig } from '../configs/settings';
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
    NBC_AND_PNC_CHILD,
    NBC_AND_PNC_COMPARTMENTS_URL,
    NBC_AND_PNC_WOMAN,
    NUTRITION,
    NUTRITION_COMPARTMENTS_URL,
    OPENSRP_SECURITY_AUTHENTICATE,
    PATIENT_DETAIL,
    PREGNANCY,
    PREGNANCY_COMPARTMENTS_URL,
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
import { fetchSms, SmsData, smsDataFetched } from '../store/ducks/sms_events';
import { Dictionary } from '@onaio/utils';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { format, parse } from 'date-fns';
import { fetchTree } from '../store/ducks/locationHierarchy';
import { split, trim, replace } from 'lodash';
import * as React from 'react';
import { TFunction } from 'i18next';
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
 * Group objects in a list by some field as their key.
 * @param list a list of objects to be grouped into a single object with keys for each.
 * @param field a field to as the key by which the objects in the list will be attached.
 * @return returns an object that contains all the objects in the list passed to it with
 * keys as values of the field passed as the second argument.
 */
export function groupBy(list: Dictionary[], field: string): Dictionary {
    const dataMap: Dictionary = {};
    list.forEach((listElement: Dictionary) => {
        if (listElement[field]) {
            if (!dataMap[listElement[field]]) {
                dataMap[listElement[field]] = {
                    ...listElement,
                };
            }
        }
    });
    return dataMap;
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
 * Sort function for a list of SmsData
 * @param firstE1
 * @param secondE1
 */
export const sortFunction = (firstE1: SmsData, secondE1: SmsData): number => {
    if (firstE1.event_id < secondE1.event_id) {
        return 1;
    }
    if (firstE1.event_id > secondE1.event_id) {
        return -1;
    }
    return 0;
};

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
        return userDetailObj.location_id;
    }
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
    locationFilterFunction: (smsData: SmsData) => boolean;
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
    let locationFilterFunction: (smsData: SmsData) => boolean = () => {
        return false;
    };

    let userLocationLevel = 4;

    if (userLocationId === VIETNAM_COUNTRY_LOCATION_ID) {
        userLocationLevel = 0;
        locationFilterFunction = () => true;
    }

    if (locationIdIn(userLocationId, provinces)) {
        userLocationLevel = 1;
        locationFilterFunction = (smsData: SmsData): boolean => {
            // tslint:disable-next-line: no-shadowed-variable
            const village = villages.find((location: Location) => {
                return location.location_id === smsData.location_id;
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
        locationFilterFunction = (smsData: SmsData): boolean => {
            // tslint:disable-next-line: no-shadowed-variable
            const village = villages.find((location: Location) => {
                return location.location_id === smsData.location_id;
            });
            if (village) {
                return userLocationId === getDistrict(village as Location & { level: typeof VILLAGE }, communes);
            }
            return false;
        };
    }

    if (locationIdIn(userLocationId, communes)) {
        userLocationLevel = 3;
        locationFilterFunction = (smsData: SmsData): boolean => {
            // tslint:disable-next-line: no-shadowed-variable
            const village = villages.find((location: Location) => {
                return location.location_id === smsData.location_id;
            });
            if (village) {
                return userLocationId === getCommune(village as Location & { level: typeof VILLAGE });
            }
            return false;
        };
    }

    if (locationIdIn(userLocationId, villages)) {
        userLocationLevel = 4;
        locationFilterFunction = (smsData: SmsData): boolean => {
            return userLocationId === smsData.location_id;
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
 * @member {string} patientId the patient id
 * @member {SmsData[]} smsData an array of SmsData objects.
 */
interface PatientIDAndSmsData {
    patientId: string;
    smsData: SmsData[];
}
/**
 * Filter smsData by patientID.
 * @param {PatientIDAndSmsData} patientIdAndSmsData an object with the patient id and smsData
 * @return {SmsData[]} filtered smsData
 */
export const filterByPatientId = (patientIdAndSmsData: PatientIDAndSmsData): SmsData[] => {
    return [...patientIdAndSmsData.smsData].filter((dataItem: SmsData): boolean => {
        return dataItem.anc_id.toLocaleLowerCase().includes(patientIdAndSmsData.patientId.toLocaleLowerCase());
    });
};

/**
 * sort SmsData[] by EventDate in descending order(i.e. the most recent events come first)
 * @param {SmsData[]} smsData an array of smsData objects to sort by event date
 */
export const sortByEventDate = <T extends { event_date: string }>(smsData: T[]) => {
    return smsData.sort((event1, event2) => {
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

/**
 * The typical use of this util function is by a props that would like to check if its
 * location props(districts, villages, communes and provinces that are attached to the store)
 * all have Location data.
 *
 * returns true if villages, districts, communes and provinces all have a length greater than 0.
 * @param {Location[]} villages an array of village locations
 * @param {Location[]} communes an array of communes locations
 * @param {Location[]} districts an array of district locations
 * @param {Location[]} provinces an array of province locations
 */
export function locationDataIsAvailable(
    villages: Location[],
    communes: Location[],
    districts: Location[],
    provinces: Location[],
) {
    return villages.length && districts.length && communes.length && provinces.length;
}

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
export function getLinkToPatientDetail(smsData: SmsData, prependWith: string) {
    if (smsData.client_type === EC_CHILD) {
        return `${prependWith}/${CHILD_PATIENT_DETAIL}/${smsData.anc_id}`;
    }
    if (smsData.client_type === EC_WOMAN || smsData.client_type === EC_FAMILY_MEMBER) {
        return `${prependWith}/${PATIENT_DETAIL}/${smsData.anc_id}`;
    }
    return `#`;
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
            const userId = (response as any).user.attributes._PERSON_UUID;
            store.dispatch(fetchUserId(userId));
            store.dispatch(fetchTree(response.locations, userId));
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
