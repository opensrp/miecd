import React, { useState, useEffect } from 'react';
import 'react-table/react-table.css';
import { Card, CardBody, CardTitle, Container, Row, Table } from 'reactstrap';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { useSelector } from 'react-redux';
import { Link, useParams, useHistory } from 'react-router-dom';
import NoRecord from '../../components/NoRecord';
import Loading from '../../components/page/Loading/index';
import VillageData from '../../components/VillageData';
import { ErrorPage } from '../../components/ErrorPage';
import { VILLAGE_SLICE, COMMUNE_SLICE, DISTRICT_SLICE, PROVINCE_SLICE } from '../../configs/env';
import {
    ALL,
    BACKPAGE_ICON,
    COMMUNE,
    DISTRICT,
    FEEDING_CATEGORY,
    GROWTH_STATUS,
    HIERARCHICAL_DATA_URL,
    HIGH,
    INAPPROPRIATELY_FED,
    LOW,
    NO,
    PREGNANCY,
    NBC_AND_PNC_CHILD,
    NBC_AND_PNC_WOMAN,
    NUTRITION,
    NUTRITION_STATUS,
    OVERWEIGHT,
    PROVINCE,
    RED,
    RED_ALERT_CLASSNAME,
    RISK,
    SEVERE_WASTING,
    STUNTED,
    NORMAL,
    UP,
    VILLAGE,
    FETCH_VILLAGES,
    FETCH_COMMUNES,
    FETCH_DISTRICTS,
    FETCH_PROVINCES,
    RED_ALERT,
    NO_UNDERSCORE_RISK,
    RISK_LEVEL,
} from '../../constants';
import { getModuleLink, fetchSupersetData, useHandleBrokenPage } from '../../helpers/utils';
import locationsReducer, { Location, reducerName } from '../../store/ducks/locations';
import smsReducer, {
    reducerName as smsReducerName,
    CompartmentSmsTypes,
    PregnancySmsData,
    NutritionSmsData,
    NbcPncSmsData,
    getFilterArgs,
} from '../../store/ducks/sms_events';
import { useTranslation, TFunction } from 'react-i18next';
import { useQuery } from 'react-query';
import { CompartmentsSmsFilterFunction } from '../../types';
import { queryKeyAndSmsSlice } from '../../configs/settings';

reducerRegistry.register(reducerName, locationsReducer);
reducerRegistry.register(smsReducerName, smsReducer);

interface LocationWithData extends Location {
    redAlert?: number;
    inappropriateFeeding?: number;
    risk?: number;
    no_risk?: number;
    overweight?: number;
    stunting?: number;
    total: number;
    wasting?: number;
    normal?: number;
}

type RiskHighlighterType =
    | typeof RED
    | typeof RISK
    | typeof NO
    | typeof STUNTED
    | typeof INAPPROPRIATELY_FED
    | typeof OVERWEIGHT
    | typeof SEVERE_WASTING
    | typeof ALL
    | typeof NORMAL;

interface NutritionTotals {
    inappropriateFeeding: number;
    overweight: number;
    stunting: number;
    wasting: number;
    normal: number;
    total: number;
}

interface PregnancyNpcPncTotals {
    no_risk: number;
    redAlert: number;
    risk: number;
    total: number;
}

type Totals = NutritionTotals | PregnancyNpcPncTotals;

type locationKeys = 'communes' | 'districts' | 'provinces' | 'villages';
type moduleType = typeof PREGNANCY | typeof NBC_AND_PNC_CHILD | typeof NBC_AND_PNC_WOMAN | typeof NUTRITION;

interface RouteParams {
    current_level: string;
    direction: 'down' | 'up';
    from_level?: string;
    module: moduleType;
    permission_level: string;
    node_id?: string;
    title: string;
    risk_highlighter?: RiskHighlighterType;
}

function getLocationRiskTotals(CompartmentSmsData: CompartmentSmsTypes[], module: moduleType): Totals {
    let reducer: (accumulator: Totals, dataItem: CompartmentSmsTypes) => Totals;

    if (module === NUTRITION) {
        reducer = (accumulator: Totals, dataItem: CompartmentSmsTypes) =>
            // conditional assignment of fields to totals
            // depending on NUTRITION_STATUS and GROWTH_STATUS fields
            ({
                ...accumulator,
                ...((dataItem as NutritionSmsData)[NUTRITION_STATUS] === SEVERE_WASTING && {
                    wasting: (accumulator as NutritionTotals).wasting + 1,
                    total: (accumulator as NutritionTotals).total + 1,
                }),
                ...((dataItem as NutritionSmsData)[NUTRITION_STATUS] === OVERWEIGHT && {
                    overweight: (accumulator as NutritionTotals).overweight + 1,
                    total: (accumulator as NutritionTotals).total + 1,
                }),
                ...((dataItem as NutritionSmsData)[NUTRITION_STATUS] === NORMAL && {
                    normal: (accumulator as NutritionTotals).normal + 1,
                    total: (accumulator as NutritionTotals).total + 1,
                }),
                ...((dataItem as NutritionSmsData)[GROWTH_STATUS] === STUNTED && {
                    stunting: (accumulator as NutritionTotals).stunting + 1,
                    total: (accumulator as NutritionTotals).total + 1,
                }),
                ...((dataItem as NutritionSmsData)[FEEDING_CATEGORY] === INAPPROPRIATELY_FED && {
                    inappropriateFeeding: (accumulator as NutritionTotals).inappropriateFeeding + 1,
                    total: (accumulator as NutritionTotals).total + 1,
                }),
            });
    } else {
        reducer = (accumulator: Totals, dataItem: CompartmentSmsTypes) => {
            switch ((dataItem as PregnancySmsData | NbcPncSmsData)[RISK_LEVEL]) {
                case RED_ALERT:
                    return {
                        ...accumulator,
                        redAlert: (accumulator as PregnancyNpcPncTotals).redAlert + 1,
                        total: accumulator.total + 1,
                    };
                case HIGH:
                case LOW:
                case RISK:
                    return {
                        ...accumulator,
                        risk: (accumulator as PregnancyNpcPncTotals).risk + 1,
                        total: accumulator.total + 1,
                    };
                case NO_UNDERSCORE_RISK:
                    return {
                        ...accumulator,
                        no_risk: (accumulator as PregnancyNpcPncTotals).no_risk + 1,
                        total: accumulator.total + 1,
                    };
                default:
                    return accumulator;
            }
        };
    }

    const totalsMap: Totals =
        module !== NUTRITION
            ? {
                  no_risk: 0,
                  redAlert: 0,
                  risk: 0,
                  total: 0,
              }
            : {
                  inappropriateFeeding: 0,
                  overweight: 0,
                  stunting: 0,
                  wasting: 0,
                  normal: 0,
                  total: 0,
              };

    return CompartmentSmsData.reduce(reducer, totalsMap);
}

function getFieldTotals(location: LocationWithData | Totals, module: moduleType): number {
    let total;
    if (module === NUTRITION) {
        total =
            (location as NutritionTotals).inappropriateFeeding +
            (location as NutritionTotals).overweight +
            (location as NutritionTotals).stunting +
            (location as NutritionTotals).wasting +
            (location as NutritionTotals).normal;
    } else {
        total =
            (location as PregnancyNpcPncTotals).no_risk +
            (location as PregnancyNpcPncTotals).redAlert +
            (location as PregnancyNpcPncTotals).risk;
    }
    return total;
}

function getRiskTotals(locations: LocationWithData[], module: moduleType): Totals {
    let reducer: (accumulator: Totals, location: LocationWithData) => Totals;

    if (module === NUTRITION) {
        reducer = (accumulator: Totals, location: LocationWithData) => {
            return {
                inappropriateFeeding:
                    (accumulator as NutritionTotals).inappropriateFeeding +
                    (location as NutritionTotals).inappropriateFeeding,
                overweight: (accumulator as NutritionTotals).overweight + (location as NutritionTotals).overweight,
                stunting: (accumulator as NutritionTotals).stunting + (location as NutritionTotals).stunting,
                wasting: (accumulator as NutritionTotals).wasting + (location as NutritionTotals).wasting,
                normal: (accumulator as NutritionTotals).normal + (location as NutritionTotals).normal,
                total: (accumulator as NutritionTotals).total + getFieldTotals(location, module),
            };
        };
    } else {
        reducer = (accumulator: Totals, location: LocationWithData) => {
            return {
                no_risk: (accumulator as PregnancyNpcPncTotals).no_risk + (location as PregnancyNpcPncTotals).no_risk,
                redAlert:
                    (accumulator as PregnancyNpcPncTotals).redAlert + (location as PregnancyNpcPncTotals).redAlert,
                risk: (accumulator as PregnancyNpcPncTotals).risk + (location as PregnancyNpcPncTotals).risk,
                total: (accumulator as PregnancyNpcPncTotals).total + getFieldTotals(location, module),
            };
        };
    }

    const totalsMap: Totals =
        module !== NUTRITION
            ? {
                  no_risk: 0,
                  redAlert: 0,
                  risk: 0,
                  total: 0,
              }
            : {
                  inappropriateFeeding: 0,
                  overweight: 0,
                  stunting: 0,
                  wasting: 0,
                  normal: 0,
                  total: 0,
              };

    return locations.reduce(reducer, totalsMap);
}

/**
 * Function to sum up two risk totals to one unified risk total
 * @param firstTotals first risk total
 * @param secondTotals second risk total
 * @param module current module
 * @returns a unified risk total
 */
function sumTotals(firstTotals: Totals, secondTotals: Totals, module: moduleType) {
    let reducer: (accumulator: Totals, currentValue: Totals) => Totals;

    if (module === NUTRITION) {
        reducer = (accumulator: Totals, currentValue: Totals) => ({
            ...accumulator,
            inappropriateFeeding:
                (accumulator as NutritionTotals).inappropriateFeeding +
                (currentValue as NutritionTotals).inappropriateFeeding,
            overweight: (accumulator as NutritionTotals).overweight + (currentValue as NutritionTotals).overweight,
            stunting: (accumulator as NutritionTotals).stunting + (currentValue as NutritionTotals).stunting,
            wasting: (accumulator as NutritionTotals).wasting + (currentValue as NutritionTotals).wasting,
            normal: (accumulator as NutritionTotals).normal + (currentValue as NutritionTotals).normal,
            total: (accumulator as NutritionTotals).total + (currentValue as NutritionTotals).total,
        });
    } else {
        reducer = (accumulator: Totals, currentValue: Totals) => ({
            ...accumulator,
            no_risk: (accumulator as PregnancyNpcPncTotals).no_risk + (currentValue as PregnancyNpcPncTotals).no_risk,
            redAlert:
                (accumulator as PregnancyNpcPncTotals).redAlert + (currentValue as PregnancyNpcPncTotals).redAlert,
            risk: (accumulator as PregnancyNpcPncTotals).risk + (currentValue as PregnancyNpcPncTotals).risk,
            total: (accumulator as PregnancyNpcPncTotals).total + (currentValue as PregnancyNpcPncTotals).total,
        });
    }
    // take initial value to be one of the values then reduce the second into it
    const initialValue: Totals = firstTotals;
    return [secondTotals].reduce(reducer, initialValue);
}

/**
 * a function that populates locations with sms data that correspond to that location id
 * @param locations a locations object containing location arrays (villages, communes, districts, provinces)
 * @param CompartmentSmsData sms data slice corresponding to compartment/module (nutrition, pregnancy, nbc-pnc)
 * @param module compartment module displaying data for
 * @returns locations populated with sms data
 */
function addDataToLocations(
    locations: {
        [key in locationKeys]: Location[];
    },
    CompartmentSmsData: CompartmentSmsTypes[],
    module: moduleType,
): { [key in locationKeys]: LocationWithData[] } {
    // loop locations and recursively add sms data with location id matching location
    const villagesWithData: LocationWithData[] = [];
    for (const village of locations.villages) {
        // filter sms data for data with location id matching village
        const villageSmsData = CompartmentSmsData.filter(
            (dataItem: CompartmentSmsTypes) => dataItem.location_id === village.location_id,
        );

        // get risk totals for village sms
        const villageRiskTotals = getLocationRiskTotals(villageSmsData, module);

        const villageTotals = getFieldTotals(villageRiskTotals, module);

        // infer type PregnancyNpcPncTotals
        if ('no_risk' in villageRiskTotals) {
            villagesWithData.push({
                ...village,
                no_risk: villageRiskTotals.no_risk,
                redAlert: villageRiskTotals.redAlert,
                risk: villageRiskTotals.risk,
                total: villageTotals,
            });
        }
        // infer type NutritionTotals
        else {
            villagesWithData.push({
                ...village,
                inappropriateFeeding: villageRiskTotals.inappropriateFeeding,
                overweight: villageRiskTotals.overweight,
                stunting: villageRiskTotals.stunting,
                wasting: villageRiskTotals.wasting,
                normal: villageRiskTotals.normal,
                total: villageTotals,
            });
        }
    }

    const communesWithData: LocationWithData[] = [];
    for (const commune of locations.communes) {
        // filter sms data for data with location id matching commune
        const communeSmsData = CompartmentSmsData.filter(
            (dataItem: CompartmentSmsTypes) => dataItem.location_id === commune.location_id,
        );
        const communeRiskTotals = getLocationRiskTotals(communeSmsData, module);

        // get village data for villages that are children of this commune
        const villagesInThisCommune = villagesWithData.filter(
            (village: LocationWithData) => village.parent_id === commune.location_id,
        );
        const villagesInCommuneRiskTotals = getRiskTotals(villagesInThisCommune, module);

        // sum the two risk totals to one unified risk total
        const unifiedTotals = sumTotals(communeRiskTotals, villagesInCommuneRiskTotals, module);

        // infer type PregnancyNpcPncTotals
        if ('no_risk' in unifiedTotals) {
            communesWithData.push({
                ...commune,
                no_risk: unifiedTotals.no_risk,
                redAlert: unifiedTotals.redAlert,
                risk: unifiedTotals.risk,
                total: unifiedTotals.total,
            });
        }
        // infer type NutritionTotals
        else {
            communesWithData.push({
                ...commune,
                inappropriateFeeding: unifiedTotals.inappropriateFeeding,
                overweight: unifiedTotals.overweight,
                stunting: unifiedTotals.stunting,
                wasting: unifiedTotals.wasting,
                normal: unifiedTotals.normal,
                total: unifiedTotals.total,
            });
        }
    }

    const districtsWithData: LocationWithData[] = [];
    for (const district of locations.districts) {
        // filter sms data for data with location id matching district
        const districtSmsData = CompartmentSmsData.filter(
            (dataItem: CompartmentSmsTypes) => dataItem.location_id === district.location_id,
        );
        const districtRiskTotals = getLocationRiskTotals(districtSmsData, module);

        // get communes data for communes that are children of this district
        const communesInThisDistrict = communesWithData.filter(
            (commune: LocationWithData) => commune.parent_id === district.location_id,
        );
        const communesInDistrictRiskTotals = getRiskTotals(communesInThisDistrict, module);

        // sum the two risk totals to one unified risk total
        const unifiedTotals = sumTotals(districtRiskTotals, communesInDistrictRiskTotals, module);

        // infer type PregnancyNpcPncTotals
        if ('no_risk' in unifiedTotals) {
            districtsWithData.push({
                ...district,
                no_risk: unifiedTotals.no_risk,
                redAlert: unifiedTotals.redAlert,
                risk: unifiedTotals.risk,
                total: unifiedTotals.total,
            });
        }
        // infer type NutritionTotals
        else {
            districtsWithData.push({
                ...district,
                inappropriateFeeding: unifiedTotals.inappropriateFeeding,
                overweight: unifiedTotals.overweight,
                stunting: unifiedTotals.stunting,
                wasting: unifiedTotals.wasting,
                normal: unifiedTotals.normal,
                total: unifiedTotals.total,
            });
        }
    }

    const provincesWithData: LocationWithData[] = [];
    for (const province of locations.provinces) {
        // filter sms data for data with location id matching province
        const provinceSmsData = CompartmentSmsData.filter(
            (dataItem: CompartmentSmsTypes) => dataItem.location_id === province.location_id,
        );
        const provinceRiskTotals = getLocationRiskTotals(provinceSmsData, module);

        // get district data for district that are children of this province
        const districtsInThisProvince = districtsWithData.filter(
            (district: LocationWithData) => district.parent_id === province.location_id,
        );
        const districtsInRiskTotals = getRiskTotals(districtsInThisProvince, module);

        // sum the two risk totals to one unified risk total
        const unifiedTotals = sumTotals(provinceRiskTotals, districtsInRiskTotals, module);

        // infer type PregnancyNpcPncTotals
        if ('no_risk' in unifiedTotals) {
            provincesWithData.push({
                ...province,
                no_risk: unifiedTotals.no_risk,
                redAlert: unifiedTotals.redAlert,
                risk: unifiedTotals.risk,
                total: unifiedTotals.total,
            });
        }
        // infer type NutritionTotals
        else {
            provincesWithData.push({
                ...province,
                inappropriateFeeding: unifiedTotals.inappropriateFeeding,
                overweight: unifiedTotals.overweight,
                stunting: unifiedTotals.stunting,
                wasting: unifiedTotals.wasting,
                normal: unifiedTotals.normal,
                total: unifiedTotals.total,
            });
        }
    }

    return {
        communes: communesWithData,
        districts: districtsWithData,
        provinces: provincesWithData,
        villages: villagesWithData,
    };
}

const getTotals = (dataToShow: LocationWithData[], module: moduleType) => {
    let reducer: (accumulator: Totals, currentValue: LocationWithData) => Totals;

    if (module === NUTRITION) {
        reducer = (accumulator: Totals, currentValue: LocationWithData) => {
            return {
                inappropriateFeeding:
                    (accumulator as NutritionTotals).inappropriateFeeding +
                    (currentValue as NutritionTotals).inappropriateFeeding,
                overweight: (accumulator as NutritionTotals).overweight + (currentValue as NutritionTotals).overweight,
                stunting: (accumulator as NutritionTotals).stunting + (currentValue as NutritionTotals).stunting,
                wasting: (accumulator as NutritionTotals).wasting + (currentValue as NutritionTotals).wasting,
                normal: (accumulator as NutritionTotals).normal + (currentValue as NutritionTotals).normal,
                total: (accumulator as NutritionTotals).total + (currentValue as NutritionTotals).total,
            };
        };
    } else {
        reducer = (accumulator: Totals, currentValue: LocationWithData) => {
            return {
                no_risk:
                    (accumulator as PregnancyNpcPncTotals).no_risk + (currentValue as PregnancyNpcPncTotals).no_risk,
                redAlert:
                    (accumulator as PregnancyNpcPncTotals).redAlert + (currentValue as PregnancyNpcPncTotals).redAlert,
                risk: (accumulator as PregnancyNpcPncTotals).risk + (currentValue as PregnancyNpcPncTotals).risk,
                total: (accumulator as PregnancyNpcPncTotals).total + (currentValue as PregnancyNpcPncTotals).total,
            };
        };
    }
    const totalsMap =
        module !== NUTRITION
            ? {
                  no_risk: 0,
                  redAlert: 0,
                  risk: 0,
                  total: 0,
              }
            : {
                  inappropriateFeeding: 0,
                  overweight: 0,
                  stunting: 0,
                  wasting: 0,
                  normal: 0,
                  total: 0,
              };

    return dataToShow.reduce(reducer, totalsMap);
};

/**
 * compose message to show unavailability of drill down children
 * @param headerTitle array of header strings
 * @param currentLevel a number between 0-3 representing the current drill down level
 * @param t the react-i18next translation function
 * @returns a string in the form of 'The Ayun commune doesn't seem to have villages'
 */
const unavailableChildren = (headerTitle: string[], currentLevel: 0 | 1 | 2 | 3, t: TFunction) => {
    // translate level number to level name
    const levelToName = (levelNo: 0 | 1 | 2 | 3, t: TFunction, plural?: boolean) => {
        let levelName: 'provinces' | 'province' | 'districts' | 'district' | 'communes' | 'commune' | 'villages';

        if (levelNo === 0) levelName = plural ? 'provinces' : 'province';
        else if (levelNo === 1) levelName = plural ? 'districts' : 'district';
        else if (levelNo === 2) levelName = plural ? 'communes' : 'commune';
        else levelName = 'villages';

        return t(levelName);
    };

    // compose message from last item in header, current and previous drill down level
    const unavailableMessage = `The ${headerTitle[headerTitle.length - 1]} ${levelToName(
        (currentLevel - 1) as 0 | 1 | 2 | 3,
        t,
    )} doesn't seem to have ${levelToName(currentLevel, t, true)}`;

    return `${t(unavailableMessage)}`;
};

export default function HierarchicalDataTable() {
    const [populatedLocationData, setPopulatedLocationData] = useState<LocationWithData[] | undefined>(undefined);
    const [villageData, setVillageData] = useState<CompartmentSmsTypes[] | undefined>(undefined);
    // initialization data here is the header's title at province level, change with caution
    const [headerTitle, setHeaderTitle] = useState<string[]>(['Provinces']);
    const [moduleSmsSlice, setModuleSmsSlice] = useState<CompartmentSmsTypes[] | undefined>(undefined);

    // get filter arguments in store
    const filterArgsInStore = useSelector((state) => getFilterArgs(state));

    const { error: brokenError, handleBrokenPage, broken } = useHandleBrokenPage();

    // get translation function
    const { t } = useTranslation();

    // navigate
    const history = useHistory();

    // get url params
    const {
        current_level: string_current_level,
        direction,
        from_level,
        module,
        node_id,
        permission_level: string_permission_level,
        risk_highlighter,
        title,
    } = useParams<RouteParams>();

    // parse string param to int

    // default 3 is lowest permission level
    const permissionLevel = string_permission_level ? parseInt(string_permission_level) : 3;
    // default 0 is level country
    const current_level = string_current_level ? parseInt(string_current_level) : 0;

    // conditionally assign sms slice and queryKey to use depending on module
    const QueryKeyAndSmsSlice = queryKeyAndSmsSlice(module);

    // fetch and cache current module sms slice
    const { data: moduleSms, isLoading: moduleSmsSliceLoading } = useQuery(
        QueryKeyAndSmsSlice.queryKey,
        () => fetchSupersetData<CompartmentSmsTypes>(QueryKeyAndSmsSlice.smsSlice, t),
        {
            select: (res: CompartmentSmsTypes[]) => res,
            onError: (err: Error) => handleBrokenPage(err),
        },
    );

    // filter sms data according to stored filters (passed in from components)
    useEffect(() => {
        if (moduleSms) {
            // function to recursively filter sms data
            const getFilteredSmsData = (
                moduleSms: CompartmentSmsTypes[],
                filterArgsInStore: CompartmentsSmsFilterFunction[],
            ): CompartmentSmsTypes[] => {
                let results = moduleSms;

                // recursively filter results
                for (const filterArgs of filterArgsInStore) {
                    results = results.filter(filterArgs);
                }
                return results;
            };

            let filteredSmsData = moduleSms;
            if (filterArgsInStore.length) filteredSmsData = getFilteredSmsData(moduleSms, filterArgsInStore);

            setModuleSmsSlice(filteredSmsData);
        }
    }, [moduleSms, filterArgsInStore]);

    // fetch all location slices
    // todo: switch to useQueries once select is supported (because of type inference)
    const { data: villages, isLoading: villagesLoading } = useQuery(
        FETCH_VILLAGES,
        () => fetchSupersetData<Location>(VILLAGE_SLICE, t),
        {
            select: (res: Location[]) => res,
            onError: (err: Error) => handleBrokenPage(err),
        },
    );
    const { data: communes, isLoading: communesLoading } = useQuery(
        FETCH_COMMUNES,
        () => fetchSupersetData<Location>(COMMUNE_SLICE, t),
        {
            select: (res: Location[]) => res,
            onError: (err: Error) => handleBrokenPage(err),
        },
    );
    const { data: districts, isLoading: districtsLoading } = useQuery(
        FETCH_DISTRICTS,
        () => fetchSupersetData<Location>(DISTRICT_SLICE, t),
        {
            select: (res: Location[]) => res,
            onError: (err: Error) => handleBrokenPage(err),
        },
    );
    const { data: provinces, isLoading: provincesLoading } = useQuery(
        FETCH_PROVINCES,
        () => fetchSupersetData<Location>(PROVINCE_SLICE, t),
        {
            select: (res: Location[]) => res,
            onError: (err: Error) => handleBrokenPage(err),
        },
    );

    useEffect(() => {
        if (communes && districts && provinces && villages && moduleSmsSlice) {
            const locationsWithData = addDataToLocations(
                {
                    communes: communes,
                    districts: districts,
                    provinces: provinces,
                    villages: villages,
                },
                moduleSmsSlice,
                module,
            );

            let dataToShow: LocationWithData[] = [];

            if ((direction === UP && current_level === 0) || !node_id) {
                dataToShow = locationsWithData.provinces;
            } else if (direction === UP && current_level === 1) {
                dataToShow = locationsWithData.districts;
                let parentId: string;
                const node = dataToShow.find((dataItem: LocationWithData) => dataItem.location_id === node_id);
                if (from_level === '2' && node) {
                    parentId = node.parent_id;
                } else {
                    const commune = locationsWithData.communes.find(
                        (dataItem: LocationWithData) => dataItem.location_id === node_id,
                    );
                    if (commune) {
                        parentId = commune.parent_id;
                    } else {
                        dataToShow = [];
                    }
                    parentId = dataToShow.find((dataItem: LocationWithData) => dataItem.location_id === parentId)
                        ?.parent_id as string;
                }
                dataToShow = dataToShow.filter((dataItem: LocationWithData) => dataItem.parent_id === parentId);
            } else if (direction === UP && current_level === 2) {
                dataToShow = locationsWithData.communes;
                const node = dataToShow.find((dataItem: LocationWithData) => dataItem.location_id === node_id);
                let parentId: null | string = null;
                if (node) {
                    parentId = node.parent_id;
                } else {
                    dataToShow = [];
                }
                dataToShow = dataToShow.filter((dataItem: LocationWithData) => dataItem.parent_id === parentId);
            } else {
                dataToShow =
                    current_level === 0
                        ? locationsWithData.provinces
                        : current_level === 1
                        ? locationsWithData.districts
                        : current_level === 2
                        ? locationsWithData.communes
                        : locationsWithData.villages;

                dataToShow = node_id
                    ? dataToShow.filter((dataItem: LocationWithData) => dataItem.parent_id === node_id)
                    : dataToShow;
            }

            setPopulatedLocationData(dataToShow);
        }
    }, [
        communes,
        villages,
        districts,
        provinces,
        current_level,
        direction,
        from_level,
        module,
        node_id,
        moduleSmsSlice,
    ]);

    useEffect(() => {
        if (moduleSmsSlice && populatedLocationData) {
            const nutritionStatusConstants = [SEVERE_WASTING, OVERWEIGHT];
            const growthStatusConstants = [STUNTED];
            const feedingCategoryConstants = [INAPPROPRIATELY_FED];

            let field: typeof NUTRITION_STATUS | typeof GROWTH_STATUS | typeof FEEDING_CATEGORY | typeof RISK_LEVEL =
                RISK_LEVEL;

            if (risk_highlighter) {
                if (nutritionStatusConstants.includes(risk_highlighter)) {
                    field = NUTRITION_STATUS;
                } else if (growthStatusConstants.includes(risk_highlighter)) {
                    field = GROWTH_STATUS;
                } else if (feedingCategoryConstants.includes(risk_highlighter)) {
                    field = FEEDING_CATEGORY;
                }
            }

            // get an array of current location ID's
            const locationIds = populatedLocationData.map((location: LocationWithData) => location.location_id);

            // filter for data matching these locations
            const dataForCurrentLocation = moduleSmsSlice.filter((dataItem: CompartmentSmsTypes) =>
                locationIds.includes(dataItem.location_id),
            );

            // default to all data (unfiltered) for undefined and 'all' risk_highlighter types
            let villageData: CompartmentSmsTypes[] = dataForCurrentLocation;

            // filter for current risk_highlighter
            if (risk_highlighter && risk_highlighter !== ALL) {
                if (field === RISK_LEVEL) {
                    villageData = dataForCurrentLocation.filter((dataItem: CompartmentSmsTypes) => {
                        // these risk_highlighter types are as generated by DataCircleCard component
                        if (risk_highlighter === RED) {
                            return (dataItem as PregnancySmsData | NbcPncSmsData)[RISK_LEVEL] === RED_ALERT;
                        }
                        if (risk_highlighter === RISK) {
                            return (
                                (dataItem as PregnancySmsData | NbcPncSmsData)[RISK_LEVEL] === HIGH ||
                                (dataItem as PregnancySmsData | NbcPncSmsData)[RISK_LEVEL] === LOW ||
                                (dataItem as PregnancySmsData | NbcPncSmsData)[RISK_LEVEL] === RISK
                            );
                        }
                        if (risk_highlighter === NO) {
                            return (dataItem as PregnancySmsData | NbcPncSmsData)[RISK_LEVEL] === NO_UNDERSCORE_RISK;
                        }
                        // if risk highlighter does not match (e.g arbitrary value) return empty array
                        return false;
                    });
                } else {
                    villageData = dataForCurrentLocation.filter(
                        (dataItem: CompartmentSmsTypes) =>
                            (dataItem as NutritionSmsData)[field as Exclude<typeof field, typeof RISK_LEVEL>] ===
                            risk_highlighter,
                    );
                }
            }

            setVillageData(villageData);
        }
    }, [populatedLocationData, risk_highlighter, moduleSmsSlice]);

    const getLevelString = () => {
        if (current_level === 0) {
            return PROVINCE;
        }
        if (current_level === 1) {
            return DISTRICT;
        }
        if (current_level === 2) {
            return COMMUNE;
        }
        if (current_level === 3) {
            return VILLAGE;
        }
        return PROVINCE;
    };

    const dontDisplayProvince = () => permissionLevel > 0;

    const dontDisplayDistrict = () => permissionLevel > 1;

    const dontDisplayCommune = () => permissionLevel > 2;

    const header = () => {
        const aLink = headerTitle.map((item, index, arr) => {
            // index 0 reserved for default headerTitle value (i.e All Provinces)
            if (
                (index === 1 && dontDisplayProvince()) ||
                (index === 2 && dontDisplayDistrict()) ||
                (index === 3 && dontDisplayCommune())
            ) {
                return <span key={index}>{null}</span>;
            }
            return (
                <Link
                    to={`${getModuleLink(
                        module,
                    )}${HIERARCHICAL_DATA_URL}/${module}/${risk_highlighter}/${title}/${index}/${UP}/${node_id}/${permissionLevel}/${current_level}`}
                    key={index}
                    onClick={() => {
                        // slice of state.headerTitle array containing
                        // items between index 0(inclusive) and index+1(exclusive) of clicked item
                        const newTitle = arr.slice(0, index + 1);
                        setHeaderTitle(newTitle);
                    }}
                >
                    {index !== 0 && <span className="divider">&nbsp; / &nbsp;</span>}
                    {t(`${item}`)}
                </Link>
            );
        });
        return aLink;
    };

    if (broken) return <ErrorPage title={brokenError?.name} message={brokenError?.message} />;

    if (
        moduleSmsSliceLoading ||
        villagesLoading ||
        communesLoading ||
        districtsLoading ||
        provincesLoading ||
        !provinces ||
        !districts ||
        !communes ||
        !villages
    ) {
        return <Loading />;
    }

    const tableRowLink = `${getModuleLink(module)}${HIERARCHICAL_DATA_URL}/${module}/${risk_highlighter}/${title}/${
        current_level ? current_level + 1 : 1
    }/down/`;

    return (
        <Container fluid className="compartment-data-table">
            <span
                onClick={() => {
                    history.goBack();
                }}
                className="back-page"
            >
                <FontAwesomeIcon icon={BACKPAGE_ICON} size="lg" />
                <span>{t('Back')}</span>
            </span>
            <h1>{t(title)}</h1>
            <Row className="villageDataRow">
                <Card className="table-card">
                    <CardTitle>{header()}</CardTitle>
                    <CardBody>
                        <Table striped borderless>
                            <thead id="header">
                                {module !== NUTRITION ? (
                                    <tr>
                                        <th className="default-width" />
                                        <th className="default-width">{t('Red alert')}</th>
                                        <th className="default-width">{t('Risk')}</th>
                                        <th className="default-width">{t('No risk')}</th>
                                        <th className="default-width totals">{t('Total')}</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="default-width" />
                                        <th className="default-width">{t('Stunted')}</th>
                                        <th className="default-width">{t('Severe wasting')}</th>
                                        <th className="default-width">{t('Overweight')}</th>
                                        <th className="default-width">{t('Inappropriate Feeding')}</th>
                                        <th className="default-width">{t('Normal')}</th>
                                        <th className="default-width totals">{t('Total')}</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody id="body">
                                {populatedLocationData?.length ? (
                                    populatedLocationData.map((element: LocationWithData) => {
                                        return (
                                            <tr
                                                key={element.location_id}
                                                className={current_level !== 3 ? 'cursor-pointer color-blue' : ''}
                                                onClick={() => {
                                                    // drill down only up to level 3 (village)
                                                    if (current_level !== 3) {
                                                        history.push(
                                                            `${tableRowLink}${element.location_id}/${permissionLevel}`,
                                                        );
                                                        // add drill down location name to header
                                                        setHeaderTitle((prevState) => [
                                                            ...prevState,
                                                            element.location_name,
                                                        ]);
                                                    }
                                                }}
                                            >
                                                {module !== NUTRITION ? (
                                                    <>
                                                        <td className="default-width">{element.location_name}</td>
                                                        <td
                                                            className={`default-width ${
                                                                risk_highlighter === RED ? RED_ALERT_CLASSNAME : ''
                                                            }`}
                                                        >
                                                            {element.redAlert}
                                                        </td>
                                                        <td
                                                            className={`default-width ${
                                                                risk_highlighter === RISK ? risk_highlighter : ''
                                                            }`}
                                                        >
                                                            {element.risk}
                                                        </td>
                                                        <td
                                                            className={`default-width ${
                                                                risk_highlighter === NO ? risk_highlighter : ''
                                                            }`}
                                                        >
                                                            {element.no_risk}
                                                        </td>
                                                        <td className="default-width totals">{element.total}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="default-width">{element.location_name}</td>
                                                        <td
                                                            className={`default-width ${
                                                                risk_highlighter === STUNTED
                                                                    ? risk_highlighter.split(' ').join('-')
                                                                    : ''
                                                            }`}
                                                        >
                                                            {element.stunting}
                                                        </td>
                                                        <td
                                                            className={`default-width ${
                                                                risk_highlighter === SEVERE_WASTING
                                                                    ? risk_highlighter.split(' ').join('-')
                                                                    : ''
                                                            }`}
                                                        >
                                                            {element.wasting}
                                                        </td>
                                                        <td
                                                            className={`default-width ${
                                                                risk_highlighter === OVERWEIGHT
                                                                    ? risk_highlighter.split(' ').join('-')
                                                                    : ''
                                                            }`}
                                                        >
                                                            {element.overweight}
                                                        </td>
                                                        <td
                                                            className={`default-width ${
                                                                risk_highlighter === INAPPROPRIATELY_FED
                                                                    ? risk_highlighter.split(' ').join('-')
                                                                    : ''
                                                            }`}
                                                        >
                                                            {element.inappropriateFeeding}
                                                        </td>
                                                        <td
                                                            className={`default-width ${
                                                                risk_highlighter === NORMAL ? risk_highlighter : ''
                                                            }`}
                                                        >
                                                            {element.normal}
                                                        </td>
                                                        <td className="default-width totals">{element.total}</td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr id="no-rows">
                                        {/* compose message to show unavailability of drill down children */}
                                        <td>{unavailableChildren(headerTitle, current_level as 0 | 1 | 2 | 3, t)}</td>
                                    </tr>
                                )}
                                {(() => {
                                    const totals = getTotals(populatedLocationData ?? [], module);
                                    // inferred type PregnancyNpcPncTotals
                                    return 'no_risk' in totals ? (
                                        <tr key="total" className="totals-row">
                                            <td className="default-width" id="total">
                                                {t(`Total (${getLevelString()})`)}
                                            </td>
                                            <td
                                                className={`default-width ${
                                                    risk_highlighter === RED ? RED_ALERT_CLASSNAME : ''
                                                }`}
                                            >
                                                {totals.redAlert}
                                            </td>
                                            <td
                                                className={`default-width ${
                                                    risk_highlighter === RISK ? risk_highlighter : ''
                                                }`}
                                            >
                                                {totals.risk}
                                            </td>
                                            <td
                                                className={`default-width ${
                                                    risk_highlighter === NO ? risk_highlighter : ''
                                                }`}
                                            >
                                                {totals.no_risk}
                                            </td>
                                            <td className="default-width">{totals.total}</td>
                                        </tr>
                                    ) : (
                                        <tr key="total" className="totals-row">
                                            <td className="default-width" id="total">
                                                {t(`Total (${getLevelString()})`)}
                                            </td>
                                            <td
                                                className={`default-width ${
                                                    risk_highlighter === STUNTED
                                                        ? risk_highlighter.split(' ').join('-')
                                                        : ''
                                                }`}
                                            >
                                                {totals.stunting}
                                            </td>
                                            <td
                                                className={`default-width ${
                                                    risk_highlighter === SEVERE_WASTING
                                                        ? risk_highlighter.split(' ').join('-')
                                                        : ''
                                                }`}
                                            >
                                                {totals.wasting}
                                            </td>
                                            <td
                                                className={`default-width ${
                                                    risk_highlighter === OVERWEIGHT
                                                        ? risk_highlighter.split(' ').join('-')
                                                        : ''
                                                }`}
                                            >
                                                {totals.overweight}
                                            </td>
                                            <td
                                                className={`default-width ${
                                                    risk_highlighter === INAPPROPRIATELY_FED
                                                        ? risk_highlighter.split(' ').join('-')
                                                        : ''
                                                }`}
                                            >
                                                {totals.inappropriateFeeding}
                                            </td>
                                            <td
                                                className={`default-width ${
                                                    risk_highlighter === NORMAL ? risk_highlighter : ''
                                                }`}
                                            >
                                                {totals.normal}
                                            </td>
                                            <td className="default-width">{totals.total}</td>
                                        </tr>
                                    );
                                })()}
                            </tbody>
                        </Table>
                    </CardBody>
                </Card>
            </Row>
            {villageData?.length ? (
                <VillageData
                    {...{
                        current_level: current_level,
                        module: module,
                        smsData: villageData,
                        // commune name is last item in headerTitle array
                        communeName: headerTitle[headerTitle.length - 1],
                    }}
                />
            ) : current_level === 3 ? (
                <NoRecord message={t('No Patient Level data to show for this commune')} />
            ) : null}
        </Container>
    );
}
