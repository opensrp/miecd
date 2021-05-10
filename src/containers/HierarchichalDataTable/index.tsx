import { Component } from 'react';
import 'react-table/react-table.css';
import { Card, CardBody, CardTitle, Container, Row, Table } from 'reactstrap';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { connect } from 'react-redux';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Store } from 'redux';
import NoRecord from '../../components/NoRecord';
import Loading from '../../components/page/Loading/index';
import VillageData from '../../components/VillageData';
import { LOCATION_SLICES } from '../../configs/env';
import React from 'react';
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
    LOGFACE_RISK,
    LOW,
    NO,
    NO_RISK_LOWERCASE,
    NUTRITION,
    NUTRITION_STATUS,
    OVERWEIGHT,
    PROVINCE,
    RED,
    RED_ALERT_CLASSNAME,
    RISK,
    SEVERE_WASTING,
    STUNTED,
    UP,
    VILLAGE,
} from '../../constants';
import { locationDataIsAvailable, getModuleLink } from '../../helpers/utils';
import supersetFetch from '../../services/superset';
import locationsReducer, {
    fetchLocations,
    getLocationsOfLevel,
    Location,
    reducerName,
} from '../../store/ducks/locations';
import smsReducer, {
    getFilterArgs,
    getFilteredSmsData,
    reducerName as smsReducerName,
    getSmsData,
    SmsData,
} from '../../store/ducks/sms_events';
import { SmsFilterFunction } from '../../types';
import { withTranslation, WithTranslation } from 'react-i18next';
import { history } from '@onaio/connected-reducer-registry';

reducerRegistry.register(reducerName, locationsReducer);
reducerRegistry.register(smsReducerName, smsReducer);

export interface LocationWithData extends Location {
    redAlert?: number;
    inappropriateFeeding?: number;
    risk?: number;
    no_risk?: number;
    overweight?: number;
    stunting?: number;
    total: number;
    wasting?: number;
}

interface State {
    data: LocationWithData[];
    district: string;
    villageData: SmsData[];
    headerTitle: string[];
}

type RiskHighlighterType =
    | typeof RED
    | typeof RISK
    | typeof HIGH
    | typeof LOW
    | typeof NO
    | typeof STUNTED
    | typeof INAPPROPRIATELY_FED
    | typeof OVERWEIGHT
    | typeof SEVERE_WASTING
    | typeof ALL
    | '';

interface Props {
    current_level: number;
    node_id?: string;
    direction: 'down' | 'up';
    from_level?: string;
    risk_highligter?: RiskHighlighterType;
    title: string;
    fetchLocationsActionCreator: typeof fetchLocations;
    provinces: Location[];
    districts: Location[];
    communes: Location[];
    villages: Location[];
    smsData: SmsData[];
    compartMentUrl: string;
    module: string;
    permissionLevel: number;
    history: typeof history;
}

const defaultProps: Props = {
    communes: [],
    compartMentUrl: '#',
    current_level: 0,
    direction: 'down',
    districts: [],
    fetchLocationsActionCreator: fetchLocations,
    history: history,
    module: '',
    permissionLevel: 3,
    provinces: [],
    risk_highligter: '',
    smsData: [],
    title: '',
    villages: [],
};

interface NutritionTotals {
    inappropriateFeeding: number;
    overweight: number;
    stunting: number;
    wasting: number;
    total: number;
}

interface PregnancyNpcPncTotals {
    no_risk: number;
    redAlert: number;
    risk: number;
    total: number;
}

type Totals = NutritionTotals | PregnancyNpcPncTotals;

export interface RouteParams {
    current_level: string;
    direction: string;
    from_level: string;
    module: string;
    permission_level: string;
    node_id: string;
    title: string;
    risk_highlighter: string;
}

type RouterProps = RouteComponentProps<RouteParams>;

export type HierarchicalDataTableType = Props & WithTranslation & RouterProps;

function getLocationRiskTotals(smsData: SmsData[], module: string, riskHighlighter: RiskHighlighterType): Totals {
    const nutritionStatusConstants = [SEVERE_WASTING, OVERWEIGHT];
    const growthStatusConstants = [STUNTED];
    const feedingCategoryConstants = [INAPPROPRIATELY_FED];

    let field:
        | typeof NUTRITION_STATUS
        | typeof GROWTH_STATUS
        | typeof FEEDING_CATEGORY
        | typeof LOGFACE_RISK = LOGFACE_RISK;

    if (nutritionStatusConstants.includes(riskHighlighter)) {
        field = NUTRITION_STATUS;
    } else if (growthStatusConstants.includes(riskHighlighter)) {
        field = GROWTH_STATUS;
    } else if (feedingCategoryConstants.includes(riskHighlighter)) {
        field = FEEDING_CATEGORY;
    }

    let reducer: (accumulator: Totals, dataItem: SmsData) => Totals;

    if (module === NUTRITION) {
        reducer = (accumulator: Totals, dataItem: SmsData) => {
            if (dataItem[NUTRITION_STATUS] === SEVERE_WASTING) {
                return {
                    ...accumulator,
                    wasting: (accumulator as NutritionTotals).wasting + 1,
                    total: accumulator.total + 1,
                };
            }
            if (dataItem[NUTRITION_STATUS] === OVERWEIGHT) {
                return {
                    ...accumulator,
                    overweight: (accumulator as NutritionTotals).overweight + 1,
                    total: accumulator.total + 1,
                };
            }
            if (dataItem[GROWTH_STATUS] === STUNTED) {
                return {
                    ...accumulator,
                    stunting: (accumulator as NutritionTotals).stunting + 1,
                    total: accumulator.total + 1,
                };
            }
            if (dataItem[FEEDING_CATEGORY] === INAPPROPRIATELY_FED) {
                return {
                    ...accumulator,
                    inappropriateFeeding: (accumulator as NutritionTotals).inappropriateFeeding + 1,
                    total: accumulator.total + 1,
                };
            }
            return accumulator;
        };
    } else {
        reducer = (accumulator: Totals, dataItem: SmsData) => {
            switch (dataItem[field]) {
                case RED:
                    return {
                        ...accumulator,
                        redAlert: (accumulator as PregnancyNpcPncTotals).redAlert + 1,
                        total: accumulator.total + 1,
                    };
                case HIGH:
                    return {
                        ...accumulator,
                        risk: (accumulator as PregnancyNpcPncTotals).risk + 1,
                        total: accumulator.total + 1,
                    };
                case LOW:
                    return {
                        ...accumulator,
                        risk: (accumulator as PregnancyNpcPncTotals).risk + 1,
                        total: accumulator.total + 1,
                    };
                case NO_RISK_LOWERCASE:
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
                  total: 0,
              };

    return smsData.reduce(reducer, totalsMap);
}

function getRiskTotals(locations: LocationWithData[], module: string): Totals {
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
                total: accumulator.total + location.total,
            };
        };
    } else {
        reducer = (accumulator: Totals, location: LocationWithData) => {
            return {
                no_risk: (accumulator as PregnancyNpcPncTotals).no_risk + (location as PregnancyNpcPncTotals).no_risk,
                redAlert:
                    (accumulator as PregnancyNpcPncTotals).redAlert + (location as PregnancyNpcPncTotals).redAlert,
                risk: (accumulator as PregnancyNpcPncTotals).risk + (location as PregnancyNpcPncTotals).risk,
                total: (accumulator as PregnancyNpcPncTotals).total + (location as PregnancyNpcPncTotals).total,
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
                  total: 0,
              };

    return locations.reduce(reducer, totalsMap);
}

type locationKeys = 'communes' | 'districts' | 'provinces' | 'villages';

function addDataToLocations(
    locations: {
        [key in locationKeys]: Location[];
    },
    smsData: SmsData[],
    module: string,
    riskHighlighter: RiskHighlighterType,
): { [key in locationKeys]: LocationWithData[] } {
    const villagesWithData: LocationWithData[] = [];
    for (const village of locations.villages) {
        // filter sms data for data matching village
        const villageSmsData = smsData.filter((dataItem: SmsData) => dataItem.location_id === village.location_id);
        // get risk totals for that village
        const villageRiskTotals = getLocationRiskTotals(villageSmsData, module, riskHighlighter);

        // infer type PregnancyNpcPncTotals
        if ('no_risk' in villageRiskTotals) {
            villagesWithData.push({
                ...village,
                no_risk: villageRiskTotals.no_risk,
                redAlert: villageRiskTotals.redAlert,
                risk: villageRiskTotals.risk,
                total: villageRiskTotals.total,
            });
        }
        // infer type NutritionTotals
        if ('inappropriateFeeding' in villageRiskTotals) {
            villagesWithData.push({
                ...village,
                inappropriateFeeding: villageRiskTotals.inappropriateFeeding,
                overweight: villageRiskTotals.overweight,
                stunting: villageRiskTotals.stunting,
                total: villageRiskTotals.total,
                wasting: villageRiskTotals.wasting,
            });
        }
    }

    const communesWithData: LocationWithData[] = [];
    for (const commune of locations.communes) {
        // filter sms data for data matching commune
        const communeSmsData = smsData.filter((dataItem: SmsData) => dataItem.location_id === commune.location_id);
        const communeRiskTotals = getLocationRiskTotals(communeSmsData, module, riskHighlighter);

        // get villages that are children of this commune
        const villagesInThisCommune = villagesWithData.filter(
            (village: LocationWithData) => village.parent_id === commune.location_id,
        );
        const villagesInCommuneRiskTotals = getRiskTotals(villagesInThisCommune, module);

        if ('no_risk' in communeRiskTotals && 'no_risk' in villagesInCommuneRiskTotals) {
            communesWithData.push({
                ...commune,
                no_risk: communeRiskTotals.no_risk + villagesInCommuneRiskTotals.no_risk,
                redAlert: communeRiskTotals.redAlert + villagesInCommuneRiskTotals.redAlert,
                risk: communeRiskTotals.risk + villagesInCommuneRiskTotals.risk,
                total: communeRiskTotals.total + villagesInCommuneRiskTotals.total,
            });
        }

        if ('inappropriateFeeding' in communeRiskTotals && 'inappropriateFeeding' in villagesInCommuneRiskTotals) {
            communesWithData.push({
                ...commune,
                inappropriateFeeding:
                    communeRiskTotals.inappropriateFeeding + villagesInCommuneRiskTotals.inappropriateFeeding,
                overweight: communeRiskTotals.overweight + villagesInCommuneRiskTotals.overweight,
                stunting: communeRiskTotals.stunting + villagesInCommuneRiskTotals.stunting,
                total: communeRiskTotals.total + villagesInCommuneRiskTotals.total,
                wasting: communeRiskTotals.wasting + villagesInCommuneRiskTotals.wasting,
            });
        }
    }

    const districtsWithData: LocationWithData[] = [];
    for (const district of locations.districts) {
        // filter sms data for data matching district
        const districtSmsData = smsData.filter((dataItem: SmsData) => dataItem.location_id === district.location_id);
        const districtRiskTotals = getLocationRiskTotals(districtSmsData, module, riskHighlighter);

        // get communes that are children of this district
        const communesInThisDistrict = communesWithData.filter(
            (commune: LocationWithData) => commune.parent_id === district.location_id,
        );
        const communesInDistrictRiskTotals = getRiskTotals(communesInThisDistrict, module);

        if ('no_risk' in districtRiskTotals && 'no_risk' in communesInDistrictRiskTotals) {
            districtsWithData.push({
                ...district,
                no_risk: districtRiskTotals.no_risk + communesInDistrictRiskTotals.no_risk,
                redAlert: districtRiskTotals.redAlert + communesInDistrictRiskTotals.redAlert,
                risk: districtRiskTotals.risk + communesInDistrictRiskTotals.risk,
                total: districtRiskTotals.total + communesInDistrictRiskTotals.total,
            });
        }

        if ('inappropriateFeeding' in districtRiskTotals && 'inappropriateFeeding' in communesInDistrictRiskTotals) {
            districtsWithData.push({
                ...district,
                inappropriateFeeding:
                    districtRiskTotals.inappropriateFeeding + communesInDistrictRiskTotals.inappropriateFeeding,
                overweight: districtRiskTotals.overweight + communesInDistrictRiskTotals.overweight,
                stunting: districtRiskTotals.stunting + communesInDistrictRiskTotals.stunting,
                total: districtRiskTotals.total + communesInDistrictRiskTotals.total,
                wasting: districtRiskTotals.wasting + communesInDistrictRiskTotals.wasting,
            });
        }
    }

    const provincesWithData: LocationWithData[] = [];
    for (const province of locations.provinces) {
        // filter sms data for data matching province
        const provinceSmsData = smsData.filter((dataItem: SmsData) => dataItem.location_id === province.location_id);
        const provinceRiskTotals = getLocationRiskTotals(provinceSmsData, module, riskHighlighter);

        // get district that are children of this province
        const districtsInThisProvince = districtsWithData.filter(
            (district: LocationWithData) => district.parent_id === province.location_id,
        );
        const districtsInRiskTotals = getRiskTotals(districtsInThisProvince, module);

        if ('no_risk' in provinceRiskTotals && 'no_risk' in districtsInRiskTotals) {
            provincesWithData.push({
                ...province,
                no_risk: provinceRiskTotals.no_risk + districtsInRiskTotals.no_risk,
                redAlert: provinceRiskTotals.redAlert + districtsInRiskTotals.redAlert,
                risk: provinceRiskTotals.risk + districtsInRiskTotals.risk,
                total: provinceRiskTotals.total + districtsInRiskTotals.total,
            });
        }

        if ('inappropriateFeeding' in provinceRiskTotals && 'inappropriateFeeding' in districtsInRiskTotals) {
            provincesWithData.push({
                ...province,
                inappropriateFeeding:
                    provinceRiskTotals.inappropriateFeeding + districtsInRiskTotals.inappropriateFeeding,
                overweight: provinceRiskTotals.overweight + districtsInRiskTotals.overweight,
                stunting: provinceRiskTotals.stunting + districtsInRiskTotals.stunting,
                total: provinceRiskTotals.total + districtsInRiskTotals.total,
                wasting: provinceRiskTotals.wasting + districtsInRiskTotals.wasting,
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

class HierarchichalDataTable extends Component<HierarchicalDataTableType, State> {
    public static defaultProps = defaultProps;

    public static getDerivedStateFromProps(nextProps: HierarchicalDataTableType) {
        const locationsWithData = addDataToLocations(
            {
                communes: nextProps.communes,
                districts: nextProps.districts,
                provinces: nextProps.provinces,
                villages: nextProps.villages,
            },
            nextProps.smsData,
            nextProps.module,
            nextProps.risk_highligter || '',
        );

        let dataToShow: LocationWithData[] = [];

        if ((nextProps.direction === UP && nextProps.current_level === 0) || !nextProps.node_id) {
            dataToShow = locationsWithData.provinces;
        } else if (nextProps.direction === UP && nextProps.current_level === 1) {
            dataToShow = locationsWithData.districts;
            let parentId: string;
            const node = dataToShow.find((dataItem: LocationWithData) => dataItem.location_id === nextProps.node_id);
            if (nextProps.from_level === '2' && node) {
                parentId = node.parent_id;
            } else {
                const commune = locationsWithData.communes.find(
                    (dataItem: LocationWithData) => dataItem.location_id === nextProps.node_id,
                );
                if (commune) {
                    parentId = commune.parent_id;
                } else {
                    return [];
                }
                parentId = dataToShow.find((dataItem: LocationWithData) => dataItem.location_id === parentId)
                    ?.parent_id as string;
            }
            dataToShow = dataToShow.filter((dataItem: LocationWithData) => dataItem.parent_id === parentId);
        } else if (nextProps.direction === UP && nextProps.current_level === 2) {
            dataToShow = locationsWithData.communes;
            const node = dataToShow.find((dataItem: LocationWithData) => dataItem.location_id === nextProps.node_id);
            let parentId: null | string = null;
            if (node) {
                parentId = node.parent_id;
            } else {
                return [];
            }
            dataToShow = dataToShow.filter((dataItem: LocationWithData) => dataItem.parent_id === parentId);
        } else {
            dataToShow =
                nextProps.current_level === 0
                    ? locationsWithData.provinces
                    : nextProps.current_level === 1
                    ? locationsWithData.districts
                    : nextProps.current_level === 2
                    ? locationsWithData.communes
                    : locationsWithData.villages;

            dataToShow = nextProps.node_id
                ? dataToShow.filter((dataItem: LocationWithData) => dataItem.parent_id === nextProps.node_id)
                : dataToShow;
        }

        // get data to show on the VillageData component.
        const locationIds = dataToShow.map((location: LocationWithData) => location.location_id);
        const nutritionStatusConstants = [SEVERE_WASTING, OVERWEIGHT];
        const growthStatusConstants = [STUNTED];
        const feedingCategoryConstants = [INAPPROPRIATELY_FED];

        let field:
            | typeof NUTRITION_STATUS
            | typeof GROWTH_STATUS
            | typeof FEEDING_CATEGORY
            | typeof LOGFACE_RISK = LOGFACE_RISK;

        if (nextProps.risk_highligter) {
            if (nutritionStatusConstants.includes(nextProps.risk_highligter)) {
                field = NUTRITION_STATUS;
            } else if (growthStatusConstants.includes(nextProps.risk_highligter)) {
                field = GROWTH_STATUS;
            } else if (feedingCategoryConstants.includes(nextProps.risk_highligter)) {
                field = FEEDING_CATEGORY;
            }
        }

        const villageData = nextProps.smsData.filter((dataItem: SmsData) => {
            if (nextProps.risk_highligter === RISK) {
                return (
                    (locationIds.includes(dataItem.location_id) && dataItem[field].includes(HIGH)) ||
                    dataItem[field].includes(LOW)
                );
            }
            return (
                locationIds.includes(dataItem.location_id) &&
                (nextProps.risk_highligter === ALL
                    ? true
                    : nextProps.risk_highligter
                    ? dataItem[field].includes(nextProps.risk_highligter ? nextProps.risk_highligter : '')
                    : true)
            );
        });

        return {
            data: dataToShow,
            villageData,
        };
    }

    constructor(props: HierarchicalDataTableType) {
        super(props);
        this.state = {
            data: [],
            district: '',
            villageData: [],
            headerTitle: ['Provinces'],
        };
    }

    public componentDidMount() {
        const { fetchLocationsActionCreator } = this.props;
        if (
            locationDataIsAvailable(
                this.props.villages,
                this.props.communes,
                this.props.districts,
                this.props.provinces,
            )
        ) {
            for (const slice of LOCATION_SLICES) {
                if (slice) {
                    supersetFetch(slice).then((result: Location[]) => {
                        fetchLocationsActionCreator(result);
                    });
                }
            }
        }
    }

    public render() {
        const { t } = this.props;
        if (
            locationDataIsAvailable(
                this.props.villages,
                this.props.communes,
                this.props.districts,
                this.props.provinces,
            )
        ) {
            const tableRowLink = `${getModuleLink(this.props.module)}${HIERARCHICAL_DATA_URL}/${this.props.module}/${
                this.props.risk_highligter
            }/${this.props.title}/${this.props.current_level ? this.props.current_level + 1 : 1}/down/`;

            const element = getTotals(this.state.data, this.props.module);

            return (
                <Container fluid className="compartment-data-table">
                    <span
                        // tslint:disable-next-line: jsx-no-lambda
                        onClick={() => {
                            window.history.go(-1);
                        }}
                        className="back-page"
                    >
                        <FontAwesomeIcon icon={BACKPAGE_ICON} size="lg" />
                        <span>{t('Back')}</span>
                    </span>
                    <h1>{t(`${element.total} ${this.props.title}`)}</h1>
                    <Row className="villageDataRow">
                        <Card className="table-card">
                            <CardTitle>{this.header()}</CardTitle>
                            <CardBody>
                                <Table striped borderless>
                                    <thead id="header">
                                        {this.props.module !== NUTRITION ? (
                                            <tr>
                                                <th className="default-width" />
                                                <th className="default-width">{t('Red Alert')}</th>
                                                <th className="default-width">{t('risk')}</th>
                                                <th className="default-width">{t('No Risk')}</th>
                                                <th className="default-width totals">{t('Total')}</th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th className="default-width" />
                                                <th className="default-width">{t('Stunted')}</th>
                                                <th className="default-width">{t('Severe Wasting')}</th>
                                                <th className="default-width">{t('Overweight')}</th>
                                                <th className="default-width">{t('Inappropriately Fed')}</th>
                                                <th className="default-width totals">{t('Total')}</th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody id="body">
                                        {this.state.data.length ? (
                                            this.state.data.map((element: LocationWithData) => {
                                                return (
                                                    <tr
                                                        key={element.location_id}
                                                        className={
                                                            this.props.current_level !== 3
                                                                ? 'cursor-pointer color-blue'
                                                                : ''
                                                        }
                                                        onClick={() => {
                                                            // drill down only up to level 3 (village)
                                                            if (this.props.current_level !== 3) {
                                                                this.props.history.push(
                                                                    `${tableRowLink}${element.location_id}/${this.props.permissionLevel}`,
                                                                );
                                                                // add drill down location name to header
                                                                this.setState({
                                                                    headerTitle: [
                                                                        ...this.state.headerTitle,
                                                                        element.location_name,
                                                                    ],
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        {this.props.module !== NUTRITION ? (
                                                            <>
                                                                <td className="default-width">
                                                                    {element.location_name}
                                                                </td>
                                                                <td
                                                                    className={`default-width ${
                                                                        this.props.risk_highligter === RED
                                                                            ? this.props.risk_highligter
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {element.redAlert}
                                                                </td>
                                                                <td
                                                                    className={`default-width ${
                                                                        this.props.risk_highligter === RISK
                                                                            ? this.props.risk_highligter
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {element.risk}
                                                                </td>
                                                                <td
                                                                    className={`default-width ${
                                                                        this.props.risk_highligter === NO
                                                                            ? this.props.risk_highligter
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {element.no_risk}
                                                                </td>
                                                                <td className="default-width totals">
                                                                    {element.total}
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="default-width">
                                                                    {element.location_name}
                                                                </td>
                                                                <td
                                                                    className={`default-width ${
                                                                        this.props.risk_highligter === STUNTED
                                                                            ? this.props.risk_highligter
                                                                                  .split(' ')
                                                                                  .join('-')
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {element.stunting}
                                                                </td>
                                                                <td
                                                                    className={`default-width ${
                                                                        this.props.risk_highligter === SEVERE_WASTING
                                                                            ? this.props.risk_highligter
                                                                                  .split(' ')
                                                                                  .join('-')
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {element.wasting}
                                                                </td>
                                                                <td
                                                                    className={`default-width ${
                                                                        this.props.risk_highligter === OVERWEIGHT
                                                                            ? this.props.risk_highligter
                                                                                  .split(' ')
                                                                                  .join('-')
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {element.overweight}
                                                                </td>
                                                                <td
                                                                    className={`default-width ${
                                                                        this.props.risk_highligter ===
                                                                        INAPPROPRIATELY_FED
                                                                            ? this.props.risk_highligter
                                                                                  .split(' ')
                                                                                  .join('-')
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {element.inappropriateFeeding}
                                                                </td>
                                                                <td className="default-width totals">
                                                                    {element.total}
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr id="no-rows">
                                                <td>{t('There seems to be no rows here :-(')}</td>
                                            </tr>
                                        )}
                                        {(() => {
                                            // inferred type PregnancyNpcPncTotals
                                            return 'no_risk' in element ? (
                                                <tr key="total" className="totals-row">
                                                    <td className="default-width" id="total">
                                                        {t(`Total (${this.getLevelString()})`)}
                                                    </td>
                                                    <td
                                                        className={`default-width ${
                                                            this.props.risk_highligter === RED
                                                                ? RED_ALERT_CLASSNAME
                                                                : ''
                                                        }`}
                                                    >
                                                        {element.redAlert}
                                                    </td>
                                                    <td
                                                        className={`default-width ${
                                                            this.props.risk_highligter === RISK
                                                                ? this.props.risk_highligter
                                                                : ''
                                                        }`}
                                                    >
                                                        {element.risk}
                                                    </td>
                                                    <td
                                                        className={`default-width ${
                                                            this.props.risk_highligter === NO
                                                                ? this.props.risk_highligter
                                                                : ''
                                                        }`}
                                                    >
                                                        {element.no_risk}
                                                    </td>
                                                    <td className="default-width">{element.total}</td>
                                                </tr>
                                            ) : (
                                                <tr key="total" className="totals-row">
                                                    <td className="default-width" id="total">
                                                        {t(`Total (${this.getLevelString()})`)}
                                                    </td>
                                                    <td
                                                        className={`default-width ${
                                                            this.props.risk_highligter === STUNTED
                                                                ? this.props.risk_highligter.split(' ').join('-')
                                                                : ''
                                                        }`}
                                                    >
                                                        {element.stunting}
                                                    </td>
                                                    <td
                                                        className={`default-width ${
                                                            this.props.risk_highligter === SEVERE_WASTING
                                                                ? this.props.risk_highligter.split(' ').join('-')
                                                                : ''
                                                        }`}
                                                    >
                                                        {element.wasting}
                                                    </td>
                                                    <td
                                                        className={`default-width ${
                                                            this.props.risk_highligter === OVERWEIGHT
                                                                ? this.props.risk_highligter.split(' ').join('-')
                                                                : ''
                                                        }`}
                                                    >
                                                        {element.overweight}
                                                    </td>
                                                    <td
                                                        className={`default-width ${
                                                            this.props.risk_highligter === INAPPROPRIATELY_FED
                                                                ? this.props.risk_highligter.split(' ').join('-')
                                                                : ''
                                                        }`}
                                                    >
                                                        {element.inappropriateFeeding}
                                                    </td>
                                                    <td className="default-width">{element.total}</td>
                                                </tr>
                                            );
                                        })()}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Row>
                    {this.state.villageData.length ? (
                        <VillageData
                            {...{
                                current_level: this.props.current_level,
                                module: this.props.module,
                                smsData: this.state.villageData,
                                // commune name is the last item in the headerTitle array
                                communeName: this.state.headerTitle[this.state.headerTitle.length - 1],
                            }}
                        />
                    ) : this.props.current_level === 3 ? (
                        <NoRecord message={t('No Patient Level data to show for this commune')} />
                    ) : null}
                </Container>
            );
        }
        return <Loading />;
    }

    private getLevelString = () => {
        if (this.props.current_level === 0) {
            return PROVINCE;
        }
        if (this.props.current_level === 1) {
            return DISTRICT;
        }
        if (this.props.current_level === 2) {
            return COMMUNE;
        }
        if (this.props.current_level === 3) {
            return VILLAGE;
        }
        return PROVINCE;
    };

    private dontDisplayProvince() {
        return this.props.permissionLevel > 0;
    }

    private dontDisplayDistrict() {
        return this.props.permissionLevel > 1;
    }

    private dontDisplayCommune() {
        return this.props.permissionLevel > 2;
    }

    private header = () => {
        const aLink = this.state.headerTitle.map((item, index, arr) => {
            // index 0 reserved for default headerTitle value (i.e All Provinces)
            if (
                (index === 1 && this.dontDisplayProvince()) ||
                (index === 2 && this.dontDisplayDistrict()) ||
                (index === 3 && this.dontDisplayCommune())
            ) {
                return <span key={index}>{null}</span>;
            }
            return (
                <Link
                    to={`${getModuleLink(this.props.module)}${HIERARCHICAL_DATA_URL}/${this.props.module}/${
                        this.props.risk_highligter
                    }/${this.props.title}/${index}/${UP}/${this.props.node_id}/${this.props.permissionLevel}/${
                        this.props.current_level
                    }`}
                    key={index}
                    onClick={() => {
                        // slice of state.headerTitle array containing
                        // items between index 0(inclusive) and index+1(exclusive) of the clicked item
                        const newTitle = arr.slice(0, index + 1);
                        this.setState({
                            headerTitle: newTitle,
                        });
                    }}
                >
                    {index !== 0 && <span className="divider">&nbsp; / &nbsp;</span>}
                    {this.props.t(`${item}`)}
                </Link>
            );
        });
        return aLink;
    };
}

const getTotals = (dataToShow: LocationWithData[], module: string) => {
    let reducer: (accumulator: Totals, currentValue: LocationWithData) => Totals;

    if (module === NUTRITION) {
        reducer = (accumulator: Totals, currentValue: LocationWithData) => {
            return {
                inappropriateFeeding:
                    (accumulator as NutritionTotals).inappropriateFeeding +
                    (currentValue as NutritionTotals).inappropriateFeeding,
                overweight: (accumulator as NutritionTotals).overweight + (currentValue as NutritionTotals).overweight,
                stunting: (accumulator as NutritionTotals).stunting + (currentValue as NutritionTotals).stunting,
                total: accumulator.total + currentValue.total,
                wasting: (accumulator as NutritionTotals).wasting + (currentValue as NutritionTotals).wasting,
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
                total: accumulator.total + currentValue.total,
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
                  total: 0,
                  wasting: 0,
              };

    return dataToShow.reduce(reducer, totalsMap);
};

const mapStateToProps = (state: Partial<Store>, ownProps: HierarchicalDataTableType) => {
    return {
        communes: getLocationsOfLevel(state, 'Commune'),
        current_level: parseInt(ownProps.match.params.current_level, 10),
        direction: ownProps.match.params.direction as Props['direction'],
        districts: getLocationsOfLevel(state, 'District'),
        from_level: ownProps.match.params.from_level,
        module: ownProps.match.params.module,
        node_id: ownProps.match.params.node_id,
        permissionLevel: parseInt(ownProps.match.params.permission_level),
        provinces: getLocationsOfLevel(state, 'Province'),
        risk_highligter: ownProps.match.params.risk_highlighter as RiskHighlighterType,
        smsData: getFilterArgs(state).length
            ? getFilteredSmsData(state, getFilterArgs(state) as SmsFilterFunction[])
            : getSmsData(state),
        title: ownProps.match.params.title,
        villages: getLocationsOfLevel(state, 'Village'),
    };
};

const mapDispatchToProps = { fetchLocationsActionCreator: fetchLocations };

const ConnectedHierarchicalDataTable = connect(mapStateToProps, mapDispatchToProps)(withRouter(HierarchichalDataTable));

export default withTranslation()(ConnectedHierarchicalDataTable);
