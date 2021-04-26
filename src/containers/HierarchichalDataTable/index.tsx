/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { Component } from 'react';
import 'react-table/react-table.css';
import { Card, CardBody, CardTitle, Container, Row, Table } from 'reactstrap';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
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
    | RED
    | RISK
    | HIGH
    | LOW
    | NO
    | STUNTED
    | INAPPROPRIATELY_FED
    | OVERWEIGHT
    | SEVERE_WASTING
    | ALL
    | '';

interface Props {
    current_level: number;
    node_id?: string;
    direction: string; // this can be down or up
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
    history: any;
}

const defaultProps: Props = {
    communes: [],
    compartMentUrl: '#',
    current_level: 0,
    direction: 'down',
    districts: [],
    fetchLocationsActionCreator: fetchLocations,
    history: null,
    module: '',
    permissionLevel: 3,
    provinces: [],
    risk_highligter: '',
    smsData: [],
    title: '',
    villages: [],
};

interface Totals {
    redAlert?: number;
    risk?: number;
    no_risk?: number;
    inappropriateFeeding?: number;
    overweight?: number;
    stunting?: number;
    wasting?: number;
}

function getVillageRiskTotals(location: Location, smsData: SmsData[], module: string, riskHighlighter: any): Totals {
    const nutritionStatusConstants = [SEVERE_WASTING, OVERWEIGHT];
    const growthStatusConstants = [STUNTED];
    const feedingCategoryConstants = [INAPPROPRIATELY_FED];
    let field: string;
    if (nutritionStatusConstants.includes(riskHighlighter)) {
        field = NUTRITION_STATUS;
    } else if (growthStatusConstants.includes(riskHighlighter)) {
        field = GROWTH_STATUS;
    } else if (feedingCategoryConstants.includes(riskHighlighter)) {
        field = FEEDING_CATEGORY;
    } else {
        field = LOGFACE_RISK;
    }
    let reducer = null;
    if (module === NUTRITION) {
        reducer = (accumulator: Totals, dataItem: SmsData) => {
            if (dataItem[NUTRITION_STATUS] === SEVERE_WASTING) {
                return {
                    ...accumulator,
                    wasting: (accumulator as any).wasting + 1,
                };
            }
            if (dataItem[NUTRITION_STATUS] === OVERWEIGHT) {
                return {
                    ...accumulator,
                    overweight: (accumulator as any).overweight + 1,
                };
            }
            if (dataItem[GROWTH_STATUS] === STUNTED) {
                return {
                    ...accumulator,
                    stunting: (accumulator as any).stunting + 1,
                };
            }
            if (dataItem[FEEDING_CATEGORY] === INAPPROPRIATELY_FED) {
                return {
                    ...accumulator,
                    inappropriateFeeding: (accumulator as any).inappropriateFeeding + 1,
                };
            }
            return accumulator;
        };
    } else {
        reducer = (accumulator: Totals, dataItem: SmsData) => {
            switch ((dataItem as any)[field]) {
                case RED:
                    return {
                        ...accumulator,
                        redAlert: (accumulator as any).redAlert + 1,
                    };
                case HIGH:
                    return {
                        ...accumulator,
                        risk: (accumulator as any).risk + 1,
                    };
                case LOW:
                    return {
                        ...accumulator,
                        risk: (accumulator as any).risk + 1,
                    };
                case NO_RISK_LOWERCASE:
                    return {
                        ...accumulator,
                        no_risk: (accumulator as any).no_risk + 1,
                    };
                default:
                    return accumulator as any;
            }
        };
    }
    let totalsMap: Totals;
    if (module !== NUTRITION) {
        totalsMap = {
            no_risk: 0,
            redAlert: 0,
            risk: 0,
        };
    } else {
        totalsMap = {
            inappropriateFeeding: 0,
            overweight: 0,
            stunting: 0,
            wasting: 0,
        };
    }
    return smsData
        .filter((dataItem: SmsData) => dataItem.location_id === location.location_id)
        .reduce(reducer, totalsMap);
}
function getRiskTotals(locations: LocationWithData[], module: string) {
    const reducer = (accumulator: Totals, location: LocationWithData): Totals => {
        if (module !== NUTRITION) {
            return {
                no_risk: (accumulator as any).no_risk + location.no_risk,
                redAlert: (accumulator as any).redAlert + location.redAlert,
                risk: (accumulator as any).risk + location.risk,
            };
        }
        return {
            inappropriateFeeding: (accumulator as any).inappropriateFeeding + location.inappropriateFeeding,
            overweight: (accumulator as any).overweight + location.overweight,
            stunting: (accumulator as any).stunting + location.stunting,
            wasting: (accumulator as any).wasting + location.wasting,
        };
    };
    let totalsMap: Totals;
    if (module !== NUTRITION) {
        totalsMap = {
            no_risk: 0,
            redAlert: 0,
            risk: 0,
        };
    } else {
        totalsMap = {
            inappropriateFeeding: 0,
            overweight: 0,
            stunting: 0,
            wasting: 0,
        };
    }
    return locations.reduce(reducer, totalsMap);
}
function getTotal(riskTotals: Totals, module: string) {
    if (module !== NUTRITION) {
        return (riskTotals as any).redAlert + riskTotals.risk + riskTotals.no_risk;
    }
    return (
        (riskTotals as any).overweight +
        (riskTotals as any).stunting +
        (riskTotals as any).inappropriateFeeding +
        (riskTotals as any).wasting
    );
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
        const villageRiskTotals: Totals = getVillageRiskTotals(village, smsData, module, riskHighlighter);
        const totalRisk = getTotal(villageRiskTotals, module);
        if (module !== NUTRITION) {
            villagesWithData.push({
                ...village,
                no_risk: villageRiskTotals.no_risk,
                redAlert: villageRiskTotals.redAlert,
                risk: villageRiskTotals.risk,
                total: totalRisk,
            });
        } else {
            villagesWithData.push({
                inappropriateFeeding: villageRiskTotals.inappropriateFeeding,
                ...village,
                overweight: villageRiskTotals.overweight,
                stunting: villageRiskTotals.stunting,
                total: totalRisk,
                wasting: villageRiskTotals.wasting,
            });
        }
    }

    const communesWithData: LocationWithData[] = [];
    for (const commune of locations.communes) {
        const villagesInThisCommune = villagesWithData.filter(
            (village: LocationWithData) => village.parent_id === commune.location_id,
        );
        const communeRisktotals = getRiskTotals(villagesInThisCommune, module);
        const totalRisk = getTotal(communeRisktotals, module);
        if (module !== NUTRITION) {
            communesWithData.push({
                ...commune,
                no_risk: communeRisktotals.no_risk,
                redAlert: communeRisktotals.redAlert,
                risk: communeRisktotals.risk,
                total: totalRisk,
            });
        } else {
            communesWithData.push({
                ...commune,
                inappropriateFeeding: communeRisktotals.inappropriateFeeding,
                overweight: communeRisktotals.overweight,
                stunting: communeRisktotals.stunting,
                total: totalRisk,
                wasting: communeRisktotals.wasting,
            });
        }
    }

    const districtsWithData: LocationWithData[] = [];
    for (const district of locations.districts) {
        const communesInThisDistrict = communesWithData.filter(
            (commune: LocationWithData) => commune.parent_id === district.location_id,
        );
        const districtRisktotals = getRiskTotals(communesInThisDistrict, module);
        const totalRisk = getTotal(districtRisktotals, module);
        if (module !== NUTRITION) {
            districtsWithData.push({
                ...district,
                no_risk: districtRisktotals.no_risk,
                redAlert: districtRisktotals.redAlert,
                risk: districtRisktotals.risk,
                total: totalRisk,
            });
        } else {
            districtsWithData.push({
                ...district,
                inappropriateFeeding: districtRisktotals.inappropriateFeeding,
                overweight: districtRisktotals.overweight,
                stunting: districtRisktotals.stunting,
                total: totalRisk,
                wasting: districtRisktotals.wasting,
            });
        }
    }

    const provincesWithData: LocationWithData[] = [];
    for (const province of locations.provinces) {
        const districtsInThisProvince = districtsWithData.filter(
            (district: LocationWithData) => district.parent_id === province.location_id,
        );
        const provinceRisktotals = getRiskTotals(districtsInThisProvince, module);
        const totalRisk = getTotal(provinceRisktotals, module);
        if (module !== NUTRITION) {
            provincesWithData.push({
                ...province,
                no_risk: provinceRisktotals.no_risk,
                redAlert: provinceRisktotals.redAlert,
                risk: provinceRisktotals.risk,
                total: totalRisk,
            });
        } else {
            provincesWithData.push({
                ...province,
                inappropriateFeeding: provinceRisktotals.inappropriateFeeding,
                overweight: provinceRisktotals.overweight,
                stunting: provinceRisktotals.stunting,
                total: totalRisk,
                wasting: provinceRisktotals.wasting,
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

export type HierarchicalDataTableType = Props & WithTranslation;

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
        let field: string;
        if (nutritionStatusConstants.includes((nextProps as any).risk_highligter)) {
            field = NUTRITION_STATUS;
        } else if (growthStatusConstants.includes((nextProps as any).risk_highligter)) {
            field = GROWTH_STATUS;
        } else if (feedingCategoryConstants.includes((nextProps as any).risk_highligter)) {
            field = FEEDING_CATEGORY;
        } else {
            field = LOGFACE_RISK;
        }
        const villageData = nextProps.smsData.filter((dataItem: SmsData) => {
            if (nextProps.risk_highligter === RISK) {
                return (
                    (locationIds.includes(dataItem.location_id) && (dataItem as any)[field].includes(HIGH)) ||
                    (dataItem as any)[field].includes(LOW)
                );
            }
            return (
                locationIds.includes(dataItem.location_id) &&
                (nextProps.risk_highligter === ALL
                    ? true
                    : nextProps.risk_highligter
                    ? (dataItem as any)[field].includes(nextProps.risk_highligter ? nextProps.risk_highligter : '')
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
                                                <th className="default-width">{t('Total')}</th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th className="default-width" />
                                                <th className="default-width">{t('Stunted')}</th>
                                                <th className="default-width">{t('Severe Wasting')}</th>
                                                <th className="default-width">{t('Overweight')}</th>
                                                <th className="default-width">{t('Inappropriately Fed')}</th>
                                                <th className="default-width">{t('Total')}</th>
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
                                                                <td className="default-width">{element.total}</td>
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
                                                                <td className="default-width">{element.total}</td>
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
                                            return this.props.module !== NUTRITION ? (
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
    const reducer = (accumulator: Partial<LocationWithData>, currentValue: any) => {
        if (module !== NUTRITION) {
            return {
                no_risk: accumulator.no_risk + currentValue.no_risk,
                redAlert: accumulator.redAlert + currentValue.redAlert,
                risk: accumulator.risk + currentValue.risk,
                total: accumulator.total + currentValue.total,
            };
        }
        return {
            inappropriateFeeding: accumulator.inappropriateFeeding + currentValue.inappropriateFeeding,
            overweight: accumulator.overweight + currentValue.overweight,
            stunting: accumulator.stunting + currentValue.stunting,
            total: accumulator.total + currentValue.total,
            wasting: accumulator.wasting + currentValue.wasting,
        };
    };
    let totalsMap: { [key: string]: number };
    if (module !== NUTRITION) {
        totalsMap = {
            no_risk: 0,
            redAlert: 0,
            risk: 0,
            total: 0,
        };
    } else {
        totalsMap = {
            inappropriateFeeding: 0,
            overweight: 0,
            stunting: 0,
            total: 0,
            wasting: 0,
        };
    }
    return dataToShow.reduce(reducer, totalsMap);
};

const mapStateToProps = (state: Partial<Store>, ownProps: any): any => {
    return {
        communes: getLocationsOfLevel(state, 'Commune'),
        current_level: parseInt(ownProps.match.params.current_level, 10),
        direction: ownProps.match.params.direction,
        districts: getLocationsOfLevel(state, 'District'),
        from_level: ownProps.match.params.from_level,
        module: ownProps.match.params.module,
        node_id: ownProps.match.params.node_id,
        permissionLevel: ownProps.match.params.permission_level,
        provinces: getLocationsOfLevel(state, 'Province'),
        risk_highligter: ownProps.match.params.risk_highlighter,
        smsData: getFilterArgs(state)
            ? getFilteredSmsData(state, getFilterArgs(state) as SmsFilterFunction[])
            : getSmsData(state),
        title: ownProps.match.params.title,
        villages: getLocationsOfLevel(state, 'Village'),
    };
};

const mapDispatchToProps = { fetchLocationsActionCreator: fetchLocations };

const ConnectedHierarchicalDataTable = withTranslation()(
    withRouter(connect(mapStateToProps, mapDispatchToProps)(HierarchichalDataTable)),
);

export default ConnectedHierarchicalDataTable;
