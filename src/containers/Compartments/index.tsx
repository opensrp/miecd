/* eslint-disable @typescript-eslint/no-use-before-define */
import { ReactNodeArray } from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { CardGroup, Row } from 'reactstrap';
import { Store } from 'redux';
import ConnectedDataCircleCard from '../../components/DataCircleCard';
import Ripple from '../../components/page/Loading';
import {
    EC_CHILD,
    EC_FAMILY_MEMBER,
    EC_WOMAN,
    HIGH,
    LOW,
    MICROSECONDS_IN_A_WEEK,
    NBC_AND_PNC,
    NBC_AND_PNC_CHILD,
    NBC_AND_PNC_WOMAN,
    NO_RISK_LOWERCASE,
    NUTRITION,
    PREGNANCY,
    RED,
    VIETNAM_COUNTRY_LOCATION_ID,
} from '../../constants';
import {
    buildHeaderBreadCrumb,
    convertMillisecondsToYear,
    fetchData,
    getFilterFunctionAndLocationLevel,
    getLocationId,
    HeaderBreadCrumb,
} from '../../helpers/utils';

import { getLocationsOfLevel, getUserId, getUserLocations, Location, UserLocation } from '../../store/ducks/locations';
import {
    addFilterArgs as addFilterArgsActionCreator,
    getFilterArgs,
    getFilteredSmsData,
    removeFilterArgs as removeFilterArgsActionCreator,
    SmsData,
    smsDataFetched,
} from '../../store/ducks/sms_events';
import { SmsFilterFunction } from '../../types';
import './index.css';

interface Props {
    filterArgsInStore: SmsFilterFunction[];
    smsData: SmsData[];
    userLocationData: UserLocation[];
    dataFetched: boolean;
    userUUID: string;
    addFilterArgs: typeof addFilterArgsActionCreator;
    removeFilterArgs: typeof removeFilterArgsActionCreator;
    module: typeof PREGNANCY | typeof NBC_AND_PNC | typeof NUTRITION | '';
    provinces: Location[];
    districts: Location[];
    communes: Location[];
    villages: Location[];
}

interface PregnancyAndNBCDataCircleCardProps {
    filterArgs?: SmsFilterFunction[];
    noRisk: number;
    permissionLevel: number;
    module: typeof PREGNANCY | typeof NBC_AND_PNC_CHILD | typeof NBC_AND_PNC_WOMAN | typeof NUTRITION | '';
    redAlert: number;
    risk: number;
    title: string;
    totalNumber: number;
}

interface NutritionDataCircleCardProps {
    filterArgs: SmsFilterFunction[];
    inappropriateFeeding: number;
    module: typeof PREGNANCY | typeof NBC_AND_PNC_CHILD | typeof NBC_AND_PNC_WOMAN | typeof NUTRITION | '';
    overweight: number;
    permissionLevel: number;
    stunting: number;
    title: string;
    wasting: number;
    totalNumber: number;
}

export const Compartments = ({
    module = '',
    smsData = [],
    dataFetched = false,
    userLocationData = [],
    userUUID = '',
    provinces = [],
    districts = [],
    communes = [],
    villages = [],
    filterArgsInStore = [],
    removeFilterArgs = removeFilterArgsActionCreator,
    addFilterArgs = addFilterArgsActionCreator,
}: Props) => {
    const [filteredData, setFilteredData] = useState<SmsData[]>([]);
    const [locationAndPath, setLocationAndPath] = useState<HeaderBreadCrumb>({
        level: '',
        location: '',
        locationId: '',
        path: '',
    });
    const [userLocationId, setUserLocationId] = useState<string>('');
    const [userLocationLevel, setUserLocationLevel] = useState<number>(4);

    const [allPregnanciesProps, setallPregnanciesProps] = useState<PregnancyAndNBCDataCircleCardProps>({
        noRisk: 0,
        permissionLevel: 0,
        module: '',
        redAlert: 0,
        risk: 0,
        title: '',
        totalNumber: 0,
    });
    const [pregnaciesDueIn2WeeksProps, setpregnaciesDueIn2WeeksProps] = useState<PregnancyAndNBCDataCircleCardProps>({
        noRisk: 0,
        permissionLevel: 0,
        module: '',
        redAlert: 0,
        risk: 0,
        title: '',
        totalNumber: 0,
    });
    const [pregnanciesDueIn1WeekProps, setpregnanciesDueIn1WeekProps] = useState<PregnancyAndNBCDataCircleCardProps>({
        noRisk: 0,
        permissionLevel: 0,
        module: '',
        redAlert: 0,
        risk: 0,
        title: '',
        totalNumber: 0,
    });

    // fetch data and add to store when the component mounts
    useEffect(() => {
        removeFilterArgs();
        fetchData();
    }, [removeFilterArgs]);

    // update userLocationId if UUID of logged in user changes
    useEffect(() => {
        setUserLocationId(getLocationId(userLocationData, userUUID));
    }, [userUUID, userLocationData]);

    useEffect(() => {
        const { locationLevel, locationFilterFunction } = getFilterFunctionAndLocationLevel(userLocationId, [
            provinces,
            districts,
            communes,
            villages,
        ]);

        if (
            locationFilterFunction &&
            // if locationFilterFunction is not already in store
            !filterArgsInStore.find((element) => element.toString() === locationFilterFunction.toString())
        ) {
            removeFilterArgs();
            addFilterArgs([locationFilterFunction as SmsFilterFunction]);
        }
        const locationPath = buildHeaderBreadCrumb(
            userLocationId,
            provinces,
            districts,
            communes,
            villages,
            VIETNAM_COUNTRY_LOCATION_ID,
        );

        setFilteredData(smsData.filter(locationFilterFunction));
        setLocationAndPath(locationPath);
        setUserLocationLevel(locationLevel);
    }, [
        userLocationId,
        provinces,
        districts,
        communes,
        villages,
        filterArgsInStore,
        smsData,
        removeFilterArgs,
        addFilterArgs,
    ]);

    useEffect(() => {
        if (module === PREGNANCY) {
            // filter functions
            const filterByDateInNext2Weeks = filterByDateInNextNWeeks(2);
            const filterByDateInNext1Week = filterByDateInNextNWeeks(1);

            // filtered data
            const birthsInTheFuture = filteredData.filter(filterByDateInTheFuture);
            const last2WeeksSmsData = filteredData.filter(filterByDateInNext2Weeks);
            const last1WeekSmsData = filteredData.filter(filterByDateInNext1Week);

            setallPregnanciesProps({
                filterArgs: [filterByDateInTheFuture] as SmsFilterFunction[],
                module: PREGNANCY,
                noRisk: getNumberOfSmsWithRisk(NO_RISK_LOWERCASE, birthsInTheFuture, 'logface_risk'),
                permissionLevel: userLocationLevel,
                redAlert: getNumberOfSmsWithRisk(RED, birthsInTheFuture, 'logface_risk'),
                risk:
                    getNumberOfSmsWithRisk(LOW, birthsInTheFuture, 'logface_risk') +
                    getNumberOfSmsWithRisk(HIGH, birthsInTheFuture, 'logface_risk'),
                title: 'Total Pregnancies',
                totalNumber: birthsInTheFuture.length,
            } as PregnancyAndNBCDataCircleCardProps);

            setpregnaciesDueIn2WeeksProps({
                filterArgs: [filterByDateInNext2Weeks] as SmsFilterFunction[],
                module: PREGNANCY,
                noRisk: getNumberOfSmsWithRisk(NO_RISK_LOWERCASE, last2WeeksSmsData || [], 'logface_risk'),
                permissionLevel: userLocationLevel,
                redAlert: getNumberOfSmsWithRisk(RED, last2WeeksSmsData || [], 'logface_risk'),
                risk:
                    getNumberOfSmsWithRisk(LOW, last2WeeksSmsData || [], 'logface_risk') +
                    getNumberOfSmsWithRisk(HIGH, last2WeeksSmsData || [], 'logface_risk'),
                title: 'Total Pregnancies due in 2 weeks',
                totalNumber: last2WeeksSmsData.length,
            });

            setpregnanciesDueIn1WeekProps({
                filterArgs: [filterByDateInNext1Week] as SmsFilterFunction[],
                module: PREGNANCY,
                noRisk: getNumberOfSmsWithRisk(NO_RISK_LOWERCASE, last1WeekSmsData || [], 'logface_risk'),
                permissionLevel: userLocationLevel,
                redAlert: getNumberOfSmsWithRisk(HIGH, last1WeekSmsData || [], 'logface_risk'),
                risk: getNumberOfSmsWithRisk(LOW, last1WeekSmsData || [], 'logface_risk'),
                title: 'Total Pregnancies due in 1 week',
                totalNumber: last1WeekSmsData.length,
            });
        }
    }, [filteredData, module, userLocationLevel]);

    const [dataCircleCardChildData, setDataCircleCardChildData] = useState<PregnancyAndNBCDataCircleCardProps>({
        noRisk: 0,
        permissionLevel: 0,
        module: '',
        redAlert: 0,
        risk: 0,
        title: '',
        totalNumber: 0,
    });
    const [dataCircleCardWomanData, setDataCircleCardWomanData] = useState<PregnancyAndNBCDataCircleCardProps>({
        noRisk: 0,
        permissionLevel: 0,
        module: '',
        redAlert: 0,
        risk: 0,
        title: '',
        totalNumber: 0,
    });

    // this should only run when the module is NBC & PNC
    useEffect(() => {
        if (module === NBC_AND_PNC) {
            const newBorn: SmsData[] = filteredData.filter(filterByEcChild);
            const woman: SmsData[] = filteredData.filter(filterByEcWomanOrFamilyMember);

            setDataCircleCardChildData({
                filterArgs: [filterByEcChild] as SmsFilterFunction[],
                module: NBC_AND_PNC_CHILD,
                noRisk: getNumberOfSmsWithRisk(NO_RISK_LOWERCASE, newBorn, 'logface_risk'),
                permissionLevel: userLocationLevel,
                redAlert: getNumberOfSmsWithRisk(RED, newBorn, 'logface_risk'),
                risk:
                    getNumberOfSmsWithRisk(LOW, newBorn, 'logface_risk') +
                    getNumberOfSmsWithRisk(HIGH, newBorn, 'logface_risk'),
                title: `Total Newborn${newBorn.length > 1 ? 's' : ''}`,
                totalNumber: newBorn.length,
            });

            setDataCircleCardWomanData({
                filterArgs: [filterByEcWomanOrFamilyMember] as SmsFilterFunction[],
                module: NBC_AND_PNC_WOMAN,
                noRisk: getNumberOfSmsWithRisk(NO_RISK_LOWERCASE, woman, 'logface_risk'),
                permissionLevel: userLocationLevel,
                redAlert: getNumberOfSmsWithRisk(RED, woman, 'logface_risk'),
                risk:
                    getNumberOfSmsWithRisk(LOW, woman, 'logface_risk') +
                    getNumberOfSmsWithRisk(HIGH, woman, 'logface_risk'),
                title: `Total Mother${woman.length > 1 ? 's' : ''} in PNC`,
                totalNumber: woman.length,
            });
        }
    }, [filteredData, module, userLocationLevel]);

    const [dataCircleCardNutrition1, setDataCircleCardNutrition1] = useState<NutritionDataCircleCardProps>({
        filterArgs: [],
        inappropriateFeeding: 0,
        module: '',
        overweight: 0,
        permissionLevel: 0,
        stunting: 0,
        title: '',
        wasting: 0,
        totalNumber: 0,
    });
    const [dataCircleCardNutrition2, setDataCircleCardNutrition2] = useState<NutritionDataCircleCardProps>({
        filterArgs: [],
        inappropriateFeeding: 0,
        module: '',
        overweight: 0,
        permissionLevel: 0,
        stunting: 0,
        title: '',
        wasting: 0,
        totalNumber: 0,
    });

    useEffect(() => {
        if (module === NUTRITION) {
            const childrenBetween0And2FilterFunction = childrenAgeRangeFilterFunction(0, 2);
            const childrenBetween0And5FilterFunction = childrenAgeRangeFilterFunction(0, 5);
            const childrenUnder2 = filteredData.filter(childrenBetween0And2FilterFunction);
            const childrenUnder5 = filteredData.filter(childrenBetween0And5FilterFunction);

            setDataCircleCardNutrition1({
                filterArgs: [childrenBetween0And5FilterFunction],
                inappropriateFeeding: getNumberOfSmsWithRisk('inappropriately fed', childrenUnder5, 'feeding_category'),
                module: NUTRITION,
                overweight: getNumberOfSmsWithRisk('overweight', childrenUnder5, 'nutrition_status'),
                permissionLevel: userLocationLevel,
                stunting: getNumberOfSmsWithRisk('stunted', childrenUnder5, 'growth_status'),
                title: 'Total Children Under 5',
                totalNumber: childrenUnder5.length,
                wasting: getNumberOfSmsWithRisk('severe wasting', childrenUnder5, 'nutrition_status'),
            });

            setDataCircleCardNutrition2({
                filterArgs: [childrenBetween0And2FilterFunction],
                inappropriateFeeding: getNumberOfSmsWithRisk('inappropriately fed', childrenUnder2, 'feeding_category'),
                module: NUTRITION,
                overweight: getNumberOfSmsWithRisk('overweight', childrenUnder2, 'nutrition_status'),
                permissionLevel: userLocationLevel,
                stunting: getNumberOfSmsWithRisk('stunted', childrenUnder2, 'growth_status'),
                title: 'Total Children Under 2',
                totalNumber: childrenUnder2.length,
                wasting: getNumberOfSmsWithRisk('severe wasting', childrenUnder2, 'nutrition_status'),
            });
        }
    }, [filteredData, module, userLocationLevel]);

    const [circleCardComponent, setCircleCardComponent] = useState<ReactNodeArray>([]);

    useEffect(() => {
        // corresponds to the type of module circle data (e.g pregnanciesDueIn1WeekProps or dataCircleCardNutrition2)
        type circleCardProps = PregnancyAndNBCDataCircleCardProps | NutritionDataCircleCardProps;

        // Exclude the default blank module ('') from module type
        type circleModule = Exclude<typeof module, ''>;

        type circleCards = {
            [key in circleModule]: circleCardProps[];
        };

        const circleCardData: circleCards = {
            [PREGNANCY]: [pregnanciesDueIn1WeekProps, pregnaciesDueIn2WeeksProps, allPregnanciesProps],
            [NBC_AND_PNC]: [dataCircleCardChildData, dataCircleCardWomanData],
            [NUTRITION]: [dataCircleCardNutrition1, dataCircleCardNutrition2],
        };

        const componentArray: ReactNodeArray = [];

        // push data for current module
        circleCardData[module as circleModule].forEach((prop: circleCardProps, index: number) => {
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

    const { t } = useTranslation();

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
            {dataFetched && filteredData.length ? (
                <>
                    <div className="cards-row">
                        <CardGroup>
                            {circleCardComponent.map((item, index) => (
                                <React.Fragment key={index}>{item}</React.Fragment>
                            ))}
                        </CardGroup>
                    </div>
                </>
            ) : (
                <Ripple />
            )}
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
    return (dataItem: SmsData) => {
        const ageInYears = convertMillisecondsToYear(new Date().getTime() - new Date(dataItem.date_of_birth).getTime());
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
 * @param {string} risk - value of logface_risk to look for
 * @param {SmsData[]} smsData - an array of SmsData objects
 * @param {string | any} field - sms event field for which we want to
 * check the value passed in risk
 */
const getNumberOfSmsWithRisk = (risk: string, smsData: SmsData[], field: string) => {
    function reducer(accumulator: number, currentValue: SmsData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((currentValue as any)[field].toLowerCase().includes(risk)) {
            return accumulator + 1;
        }
        return accumulator;
    }
    return smsData.reduce(reducer, 0);
};

/**
 * @param {number} n number of weeks future
 */
export const filterByDateInNextNWeeks = (n: number) => {
    return (dataItem: SmsData) => {
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
const filterByDateInTheFuture = (dataItem: SmsData): boolean => {
    return Date.parse(dataItem.lmp_edd.toString()) - Date.now() > 0;
};

/**
 * @param {SmsData} dataItem an SmsData item to be filtered in/out.
 * @return {boolean} should the dataItem be filtered in/out.
 */
const filterByEcChild: SmsFilterFunction = (dataItem: SmsData): boolean => {
    return dataItem.client_type === EC_CHILD;
};

/**
 *
 * @param {SmsData} dataItem an SmsData item to be filtered in/out.
 * @return {boolean} should the dataItem be filtered in/out.
 */
const filterByEcWomanOrFamilyMember: SmsFilterFunction = (dataItem: SmsData): boolean => {
    return dataItem.client_type === EC_WOMAN || dataItem.client_type === EC_FAMILY_MEMBER;
};

const mapStateToprops = (state: Partial<Store>) => {
    return {
        communes: getLocationsOfLevel(state, 'Commune'),
        dataFetched: smsDataFetched(state),
        districts: getLocationsOfLevel(state, 'District'),
        filterArgsInStore: getFilterArgs(state),
        provinces: getLocationsOfLevel(state, 'Province'),
        smsData: getFilteredSmsData(state, getFilterArgs(state) as SmsFilterFunction[]),
        userLocationData: getUserLocations(state),
        userUUID: getUserId(state),
        villages: getLocationsOfLevel(state, 'Village'),
    };
};

const mapDispatchToProps = {
    addFilterArgs: addFilterArgsActionCreator,
    removeFilterArgs: removeFilterArgsActionCreator,
};

const ConnectedCompartments = connect(mapStateToprops, mapDispatchToProps)(Compartments);

export default ConnectedCompartments;
