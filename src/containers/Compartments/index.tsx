import { ReactNodeArray } from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from 'react-query';
import { CardGroup, Row } from 'reactstrap';
import ConnectedDataCircleCard from '../../components/DataCircleCard';
import Ripple from '../../components/page/Loading';
import { ErrorPage } from '../../components/ErrorPage';
import {
    EC_CHILD,
    EC_FAMILY_MEMBER,
    EC_WOMAN,
    HIGH,
    LOW,
    RISK,
    NO_UNDERSCORE_RISK,
    RED_ALERT,
    RISK_LEVEL,
    FEEDING_CATEGORY,
    NUTRITION_STATUS,
    GROWTH_STATUS,
    INAPPROPRIATELY_FED,
    OVERWEIGHT,
    STUNTED,
    SEVERE_WASTING,
    NORMAL,
    MICROSECONDS_IN_A_WEEK,
    NBC_AND_PNC_CHILD,
    NBC_AND_PNC_WOMAN,
    PREGNANCY,
    NBC_AND_PNC,
    NUTRITION,
    VIETNAM_COUNTRY_LOCATION_ID,
    FETCH_VILLAGES,
    FETCH_COMMUNES,
    FETCH_DISTRICTS,
    FETCH_PROVINCES,
} from '../../constants';
import {
    buildHeaderBreadCrumb,
    convertMillisecondsToYear,
    getFilterFunctionAndLocationLevel,
    HeaderBreadCrumb,
    fetchSupersetData,
    useHandleBrokenPage,
} from '../../helpers/utils';

import { Location } from '../../store/ducks/locations';
import {
    getFilterArgs,
    removeFilterArgs,
    CompartmentSmsTypes,
    PregnancySmsData,
    NutritionSmsData,
    NbcPncSmsData,
    addFilterArgs,
} from '../../store/ducks/sms_events';
import './index.css';
import { VILLAGE_SLICE, COMMUNE_SLICE, DISTRICT_SLICE, PROVINCE_SLICE } from '../../configs/env';
import { CompartmentsSmsFilterFunction } from '../../types';
import { queryKeyAndSmsSlice } from '../../configs/settings';
import { format } from 'util';
import { useUserAssignment } from 'helpers/dataHooks';

interface Props {
    module: typeof PREGNANCY | typeof NBC_AND_PNC | typeof NUTRITION;
}

type moduleType = typeof PREGNANCY | typeof NBC_AND_PNC_CHILD | typeof NBC_AND_PNC_WOMAN;

interface PregnancyAndNBCDataCircleCardProps {
    filterArgs?: CompartmentsSmsFilterFunction[];
    noRisk: number;
    permissionLevel: number;
    module: moduleType;
    redAlert: number;
    risk: number;
    title: string;
}

interface NutritionDataCircleCardProps {
    filterArgs: CompartmentsSmsFilterFunction[];
    inappropriateFeeding: number;
    module: typeof NUTRITION;
    overweight: number;
    permissionLevel: number;
    stunting: number;
    normal: number;
    title: string;
    wasting: number;
}

export const Compartments = ({ module }: Props) => {
    const dispatch = useDispatch();
    const filterArgsInStore = useSelector((state) => getFilterArgs(state));
    const { error: brokenError, handleBrokenPage, broken } = useHandleBrokenPage();
    const { t } = useTranslation();

    // remove current filters when component mounts
    useEffect(() => {
        dispatch(removeFilterArgs());
    }, [dispatch]);

    // conditionally assign sms slice and queryKey to use depending on module
    const QueryKeyAndSmsSlice = queryKeyAndSmsSlice(module);

    // fetch and cache current module sms slice
    const { data: moduleSmsSlice, isLoading: moduleSmsSliceLoading } = useQuery(
        QueryKeyAndSmsSlice.queryKey,
        () => fetchSupersetData<CompartmentSmsTypes>(QueryKeyAndSmsSlice.smsSlice, t),
        {
            select: (res: CompartmentSmsTypes[]) => res,
            onError: (err: Error) => handleBrokenPage(err),
        },
    );

    // fetch all location slices
    // todo: switch to useQueries once select is supported
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

    // fetch user location details
    const { data: userData, isLoading: userDataLoading } = useUserAssignment(t);
    const userLocationId = userData?.location?.uuid;

    const [filteredData, setFilteredData] = useState<CompartmentSmsTypes[]>([]);
    const [locationAndPath, setLocationAndPath] = useState<HeaderBreadCrumb>({
        level: '',
        location: '',
        locationId: '',
        path: '',
    });
    const [userLocationLevel, setUserLocationLevel] = useState<number>(4);

    const [allPregnanciesProps, setallPregnanciesProps] = useState<PregnancyAndNBCDataCircleCardProps>({
        noRisk: 0,
        permissionLevel: 0,
        module: PREGNANCY,
        redAlert: 0,
        risk: 0,
        title: '',
    });
    const [pregnaciesDueIn2WeeksProps, setpregnaciesDueIn2WeeksProps] = useState<PregnancyAndNBCDataCircleCardProps>({
        noRisk: 0,
        permissionLevel: 0,
        module: PREGNANCY,
        redAlert: 0,
        risk: 0,
        title: '',
    });
    const [pregnanciesDueIn1WeekProps, setpregnanciesDueIn1WeekProps] = useState<PregnancyAndNBCDataCircleCardProps>({
        noRisk: 0,
        permissionLevel: 0,
        module: PREGNANCY,
        redAlert: 0,
        risk: 0,
        title: '',
    });

    useEffect(() => {
        if (provinces && districts && communes && villages && userLocationId) {
            const { locationLevel, locationFilterFunction } = getFilterFunctionAndLocationLevel(userLocationId, [
                provinces,
                districts,
                communes,
                villages,
            ]);

            // gotcha: locationLevel is a number so checking for truthy will fail for level 0
            if (locationLevel !== undefined) setUserLocationLevel(locationLevel);

            if (
                // if locationFilterFunction is not already in store
                !filterArgsInStore.find((element) => element.toString() === locationFilterFunction.toString())
            ) {
                dispatch(addFilterArgs([locationFilterFunction]));
            }
            const locationPath = buildHeaderBreadCrumb(
                userLocationId,
                provinces,
                districts,
                communes,
                villages,
                VIETNAM_COUNTRY_LOCATION_ID,
            );

            setLocationAndPath(locationPath);

            // initialize filtered data
            let filteredData = moduleSmsSlice ?? [];

            // filter sms data for user's location
            if (locationFilterFunction) {
                filteredData = filteredData.filter(locationFilterFunction);
            }
            setFilteredData(filteredData);
        }
    }, [userLocationId, provinces, districts, communes, villages, filterArgsInStore, moduleSmsSlice, dispatch]);

    useEffect(() => {
        if (module === PREGNANCY) {
            // filter functions
            const filterByDateInNext2Weeks = filterByDateInNextNWeeks(2);
            const filterByDateInNext1Week = filterByDateInNextNWeeks(1);

            // filtered data
            const birthsInTheFuture = (filteredData as PregnancySmsData[]).filter(filterByDateInTheFuture);
            const last2WeeksSmsData = (filteredData as PregnancySmsData[]).filter(filterByDateInNext2Weeks);
            const last1WeekSmsData = (filteredData as PregnancySmsData[]).filter(filterByDateInNext1Week);

            setallPregnanciesProps({
                filterArgs: [filterByDateInTheFuture] as CompartmentsSmsFilterFunction[],
                module: PREGNANCY,
                permissionLevel: userLocationLevel,
                noRisk: getNumberOfSmsWithRisk(NO_UNDERSCORE_RISK, birthsInTheFuture, RISK_LEVEL),
                redAlert: getNumberOfSmsWithRisk(RED_ALERT, birthsInTheFuture, RISK_LEVEL),
                risk:
                    getNumberOfSmsWithRisk(LOW, birthsInTheFuture, RISK_LEVEL) +
                    getNumberOfSmsWithRisk(HIGH, birthsInTheFuture, RISK_LEVEL) +
                    getNumberOfSmsWithRisk(RISK, birthsInTheFuture, RISK_LEVEL),
                title: format(t('%d Total pregnancies'), birthsInTheFuture.length),
            } as PregnancyAndNBCDataCircleCardProps);

            setpregnaciesDueIn2WeeksProps({
                filterArgs: [filterByDateInNext2Weeks] as CompartmentsSmsFilterFunction[],
                module: PREGNANCY,
                permissionLevel: userLocationLevel,
                noRisk: getNumberOfSmsWithRisk(NO_UNDERSCORE_RISK, last2WeeksSmsData, RISK_LEVEL),
                redAlert: getNumberOfSmsWithRisk(RED_ALERT, last2WeeksSmsData, RISK_LEVEL),
                risk:
                    getNumberOfSmsWithRisk(LOW, last2WeeksSmsData, RISK_LEVEL) +
                    getNumberOfSmsWithRisk(HIGH, last2WeeksSmsData, RISK_LEVEL) +
                    getNumberOfSmsWithRisk(RISK, last2WeeksSmsData, RISK_LEVEL),
                title: format(t('%d Total Pregnancies due in 2 weeks'), last2WeeksSmsData.length),
            });

            setpregnanciesDueIn1WeekProps({
                filterArgs: [filterByDateInNext1Week] as CompartmentsSmsFilterFunction[],
                module: PREGNANCY,
                permissionLevel: userLocationLevel,
                noRisk: getNumberOfSmsWithRisk(NO_UNDERSCORE_RISK, last1WeekSmsData, RISK_LEVEL),
                redAlert: getNumberOfSmsWithRisk(RED_ALERT, last1WeekSmsData, RISK_LEVEL),
                risk:
                    getNumberOfSmsWithRisk(LOW, last1WeekSmsData, RISK_LEVEL) +
                    getNumberOfSmsWithRisk(HIGH, last1WeekSmsData, RISK_LEVEL) +
                    getNumberOfSmsWithRisk(RISK, last1WeekSmsData, RISK_LEVEL),
                title: format(t('%d Total Pregnancies due in 1 week'), last1WeekSmsData.length),
            });
        }
    }, [filteredData, module, t, userLocationLevel]);

    const [dataCircleCardChildData, setDataCircleCardChildData] = useState<PregnancyAndNBCDataCircleCardProps>({
        noRisk: 0,
        permissionLevel: 0,
        module: NBC_AND_PNC_CHILD,
        redAlert: 0,
        risk: 0,
        title: '',
    });
    const [dataCircleCardWomanData, setDataCircleCardWomanData] = useState<PregnancyAndNBCDataCircleCardProps>({
        noRisk: 0,
        permissionLevel: 0,
        module: NBC_AND_PNC_CHILD,
        redAlert: 0,
        risk: 0,
        title: '',
    });

    // this should only run when the module is NBC & PNC
    useEffect(() => {
        if (module === NBC_AND_PNC) {
            const newBorn = (filteredData as NbcPncSmsData[]).filter(filterByEcChild);
            const woman = (filteredData as NbcPncSmsData[]).filter(filterByEcWomanOrFamilyMember);

            setDataCircleCardChildData({
                filterArgs: [filterByEcChild] as CompartmentsSmsFilterFunction[],
                module: NBC_AND_PNC_CHILD,
                permissionLevel: userLocationLevel,
                noRisk: getNumberOfSmsWithRisk(NO_UNDERSCORE_RISK, newBorn, RISK_LEVEL),
                redAlert: getNumberOfSmsWithRisk(RED_ALERT, newBorn, RISK_LEVEL),
                risk:
                    getNumberOfSmsWithRisk(LOW, newBorn, RISK_LEVEL) +
                    getNumberOfSmsWithRisk(HIGH, newBorn, RISK_LEVEL) +
                    getNumberOfSmsWithRisk(RISK, newBorn, RISK_LEVEL),
                title: format(t('total_newborn.%d %s'), newBorn.length, t('Total newborn', { count: newBorn.length })),
            });

            setDataCircleCardWomanData({
                filterArgs: [filterByEcWomanOrFamilyMember] as CompartmentsSmsFilterFunction[],
                module: NBC_AND_PNC_WOMAN,
                permissionLevel: userLocationLevel,
                noRisk: getNumberOfSmsWithRisk(NO_UNDERSCORE_RISK, woman, RISK_LEVEL),
                redAlert: getNumberOfSmsWithRisk(RED_ALERT, woman, RISK_LEVEL),
                risk:
                    getNumberOfSmsWithRisk(LOW, woman, RISK_LEVEL) +
                    getNumberOfSmsWithRisk(HIGH, woman, RISK_LEVEL) +
                    getNumberOfSmsWithRisk(RISK, woman, RISK_LEVEL),
                title: format(
                    t('total_mother_in_pnc.%d %s'),
                    woman.length,
                    t('Total mother in PNC', { count: woman.length }),
                ),
            });
        }
    }, [filteredData, module, t, userLocationLevel]);

    const [dataCircleCardNutrition1, setDataCircleCardNutrition1] = useState<NutritionDataCircleCardProps>({
        filterArgs: [],
        inappropriateFeeding: 0,
        module: NUTRITION,
        overweight: 0,
        permissionLevel: 0,
        stunting: 0,
        normal: 0,
        title: '',
        wasting: 0,
    });
    const [dataCircleCardNutrition2, setDataCircleCardNutrition2] = useState<NutritionDataCircleCardProps>({
        filterArgs: [],
        inappropriateFeeding: 0,
        module: NUTRITION,
        overweight: 0,
        permissionLevel: 0,
        stunting: 0,
        normal: 0,
        title: '',
        wasting: 0,
    });

    useEffect(() => {
        if (module === NUTRITION) {
            const childrenBetween0And2FilterFunction = childrenAgeRangeFilterFunction(0, 2);
            const childrenBetween0And5FilterFunction = childrenAgeRangeFilterFunction(0, 5);
            const childrenUnder2 = (filteredData as NutritionSmsData[]).filter(childrenBetween0And2FilterFunction);
            const childrenUnder5 = (filteredData as NutritionSmsData[]).filter(childrenBetween0And5FilterFunction);

            setDataCircleCardNutrition1({
                filterArgs: [childrenBetween0And5FilterFunction] as CompartmentsSmsFilterFunction[],
                module: NUTRITION,
                permissionLevel: userLocationLevel,
                inappropriateFeeding: getNumberOfSmsWithRisk(INAPPROPRIATELY_FED, childrenUnder5, FEEDING_CATEGORY),
                overweight: getNumberOfSmsWithRisk(OVERWEIGHT, childrenUnder5, NUTRITION_STATUS),
                stunting: getNumberOfSmsWithRisk(STUNTED, childrenUnder5, GROWTH_STATUS),
                wasting: getNumberOfSmsWithRisk(SEVERE_WASTING, childrenUnder5, NUTRITION_STATUS),
                normal: getNumberOfSmsWithRisk(NORMAL, childrenUnder5, NUTRITION_STATUS),
                title: format(t('%d Total children under 5'), childrenUnder5.length),
            });

            setDataCircleCardNutrition2({
                filterArgs: [childrenBetween0And2FilterFunction] as CompartmentsSmsFilterFunction[],
                module: NUTRITION,
                permissionLevel: userLocationLevel,
                inappropriateFeeding: getNumberOfSmsWithRisk(INAPPROPRIATELY_FED, childrenUnder2, FEEDING_CATEGORY),
                overweight: getNumberOfSmsWithRisk(OVERWEIGHT, childrenUnder2, NUTRITION_STATUS),
                stunting: getNumberOfSmsWithRisk(STUNTED, childrenUnder2, GROWTH_STATUS),
                wasting: getNumberOfSmsWithRisk(SEVERE_WASTING, childrenUnder2, NUTRITION_STATUS),
                normal: getNumberOfSmsWithRisk(NORMAL, childrenUnder2, NUTRITION_STATUS),
                title: format(t('%d Total children under 2'), childrenUnder2.length),
            });
        }
    }, [filteredData, module, t, userLocationLevel]);

    const [circleCardComponent, setCircleCardComponent] = useState<ReactNodeArray>([]);

    useEffect(() => {
        // corresponds to the type of module circle data (e.g pregnanciesDueIn1WeekProps or dataCircleCardNutrition2)
        type circleCardProps = PregnancyAndNBCDataCircleCardProps | NutritionDataCircleCardProps;

        type circleCards = {
            [key in typeof module]: circleCardProps[];
        };

        const circleCardData: circleCards = {
            [PREGNANCY]: [pregnanciesDueIn1WeekProps, pregnaciesDueIn2WeeksProps, allPregnanciesProps],
            [NBC_AND_PNC]: [dataCircleCardChildData, dataCircleCardWomanData],
            [NUTRITION]: [dataCircleCardNutrition1, dataCircleCardNutrition2],
        };

        const componentArray: ReactNodeArray = [];

        // push data for current module
        circleCardData[module].forEach((prop: circleCardProps, index: number) => {
            componentArray.push(<ConnectedDataCircleCard key={index} userLocationId={userLocationId} {...prop} />);
        });

        setCircleCardComponent(componentArray);
    }, [
        allPregnanciesProps,
        dataCircleCardChildData,
        dataCircleCardNutrition1,
        dataCircleCardNutrition2,
        dataCircleCardWomanData,
        module,
        pregnaciesDueIn2WeeksProps,
        pregnanciesDueIn1WeekProps,
        userLocationId,
    ]);

    if (broken) return <ErrorPage title={brokenError?.name} message={brokenError?.message} />;

    if (
        !circleCardComponent.length ||
        moduleSmsSliceLoading ||
        villagesLoading ||
        communesLoading ||
        districtsLoading ||
        provincesLoading ||
        userDataLoading
    ) {
        return <Ripple />;
    }

    return (
        <div className="compartment-wrapper compartments compartment-data-table">
            <Row>
                <h2 id="compartment_title">{t('Compartments')}</h2>
            </Row>
            <Row className="breadcrumb-row">
                <p id="breadcrumb">
                    {locationAndPath.path}
                    <span id="breadcrumb-span">{locationAndPath.location}</span>
                </p>
            </Row>
            <div className="cards-row">
                <CardGroup>
                    {circleCardComponent.map((item, index) => (
                        <React.Fragment key={index}>{item}</React.Fragment>
                    ))}
                </CardGroup>
            </div>
        </div>
    );
};

/**
 * filter function for smsData based on date_of_birth field
 * @param {SmsData} dataItem - SmsData item
 * @param {number} startAge - the beginning of age range we are filtering for.
 * @returns filterFunction  - the ending of age range we are filtering for.
 */
export const childrenAgeRangeFilterFunction = (startAge: number, endAge: number) => {
    return (dataItem: NutritionSmsData) => {
        const ageInYears = convertMillisecondsToYear(new Date().getTime() - new Date(dataItem.dob).getTime());
        // when startAge = 0 and endAge > 0, the age range is: startAge ≤ ageInYears ≤ endAge (i.e startAge and endAge are both inclusive)
        // when startAge > 0 and endAge > 0, the range is startAge < ageInYears ≤ endAge (startAge exclusive)
        return startAge === 0
            ? ageInYears >= startAge && ageInYears <= endAge
            : ageInYears > startAge && ageInYears <= endAge;
    };
};

/**
 * get the number of sms_reports with a certain value in one of its fields
 * specified by field.
 * @param {string} risk - value of risk_level to look for
 * @param {SmsData[]} smsData - an array of SmsData objects
 * @param {string | any} field - sms event field for which we want to
 * check the value passed in risk
 */
export const getNumberOfSmsWithRisk = (risk: string, CompartmentSmsData: CompartmentSmsTypes[], field: string) => {
    function reducer(accumulator: number, currentValue: CompartmentSmsTypes) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((currentValue as any)[field]?.toLowerCase() === risk) {
            return accumulator + 1;
        }
        return accumulator;
    }
    return CompartmentSmsData.reduce(reducer, 0);
};

/**
 * @param {number} n number of weeks future
 */
export const filterByDateInNextNWeeks = (n: number) => {
    return (dataItem: PregnancySmsData) => {
        return (
            Date.parse(dataItem.lmp_edd.toString()) - Date.now() > 0 &&
            Date.parse(dataItem.lmp_edd.toString()) - Date.now() <= n * MICROSECONDS_IN_A_WEEK
        );
    };
};

/**
 *
 * @param dataItem
 * @param {SmsData} dataItem sms data item
 */
export const filterByDateInTheFuture = (dataItem: PregnancySmsData): boolean => {
    return Date.parse(dataItem.lmp_edd.toString()) - Date.now() > 0;
};

/**
 * @param {SmsData} dataItem an SmsData item to be filtered in/out.
 * @return {boolean} should the dataItem be filtered in/out.
 */
export const filterByEcChild = (dataItem: NbcPncSmsData): boolean => {
    return dataItem.client_type === EC_CHILD;
};

/**
 *
 * @param {SmsData} dataItem an SmsData item to be filtered in/out.
 * @return {boolean} should the dataItem be filtered in/out.
 */
export const filterByEcWomanOrFamilyMember = (dataItem: NbcPncSmsData): boolean => {
    return dataItem.client_type === EC_WOMAN || dataItem.client_type === EC_FAMILY_MEMBER;
};

export default Compartments;
