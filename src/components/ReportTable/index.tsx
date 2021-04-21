import ListView from '@onaio/list-view';
import React, { Component } from 'react';
import { TFunction, Trans, WithTranslation, withTranslation } from 'react-i18next';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import {
    ANC_REPORT,
    BIRTH_REPORT,
    GESTATION_PERIOD,
    HEIGHT,
    NUTRITION_REGISTRATION,
    NUTRITION_REPORT,
    PREGNANCY_REGISTRATION,
    WEIGHT,
} from '../../constants';
import { getNumberSuffix } from '../../helpers/utils';
import { SmsData } from '../../store/ducks/sms_events';
import WeightAndHeightChart from '../WeightAndHeightChart';
import './index.css';

interface Props {
    singlePatientEvents: SmsData[];
    isChild: boolean;
}

/**
 * An object that represents the weight of a child
 * or mother for a given month and year.
 * @member {number} weight  the weight
 * @member {number} month a number between 0 and 11 representing the month
 * @member {number} year the year the month is in.
 */
export interface WeightMonthYear {
    weight: number;
    month: number;
    year: number;
}

/**
 * An object representing Pregnancy data contained in an SmsEvent
 * object but has been adapted specifically for the pregnancy module
 * @member {string} EventDate - the date the SmsEvent was created. this is
 * when the sms was sent.
 * @member {string | number} message - the string/number representation of the message
 * @member {string} health_worker_name - name of health worker who sent the message
 * @member {string}  sms_type - the sms type.
 */
interface PregnancySmsData {
    EventDate: string;
    message: string | number;
    health_worker_name: string;
    sms_type: string;
}
interface State {
    pregnancyEventsArray: PregnancySmsData[][];
    dropdownOpenPregnancy: boolean;
    currentPregnancy: number;
    pregnancyDropdownLabel: string;
    indicesToRemove: number[];
}

export const convertToStringArray = (smsData: PregnancySmsData): string[] => {
    const arr: string[] = [];
    arr.push(smsData.sms_type);
    arr.push(smsData.EventDate);
    arr.push(smsData.health_worker_name);
    arr.push(smsData.message as string);
    return arr;
};

export const getEventsPregnancyArray = (singlePatientEvents: SmsData[], isChild: boolean): PregnancySmsData[][] => {
    // remove event types that we are not interested in and retain
    // only pregnancy registration, ANC and birth reports
    singlePatientEvents = !isChild
        ? singlePatientEvents.filter((event: SmsData) => {
              return (
                  event.sms_type.toLowerCase() === BIRTH_REPORT.toLowerCase() ||
                  event.sms_type.toLowerCase() === ANC_REPORT.toLowerCase() ||
                  event.sms_type.toLowerCase() === PREGNANCY_REGISTRATION.toLowerCase()
              );
          })
        : singlePatientEvents.filter((event: SmsData) => {
              return (
                  event.sms_type.toLowerCase() === NUTRITION_REPORT.toLowerCase() ||
                  event.sms_type.toLowerCase() === NUTRITION_REGISTRATION.toLowerCase()
              );
          });
    const data: PregnancySmsData[][] = [];

    let pregnancyIndex = 0;
    for (const dataItem in singlePatientEvents) {
        if (singlePatientEvents) {
            if (data[pregnancyIndex]) {
                if (
                    singlePatientEvents[dataItem].sms_type === PREGNANCY_REGISTRATION ||
                    (data[pregnancyIndex][parseInt(dataItem, 10) - 1] &&
                        GESTATION_PERIOD <
                            Date.parse(singlePatientEvents[dataItem].EventDate) -
                                Date.parse(data[pregnancyIndex][parseInt(dataItem, 10) - 1].EventDate))
                ) {
                    pregnancyIndex += 1;
                    if (!data[pregnancyIndex]) {
                        data[pregnancyIndex] = [];
                    }
                    data[pregnancyIndex].push(singlePatientEvents[dataItem]);
                } else if (singlePatientEvents[dataItem].sms_type === BIRTH_REPORT) {
                    data[pregnancyIndex].push(singlePatientEvents[dataItem]);
                } else {
                    data[pregnancyIndex].push(singlePatientEvents[dataItem]);
                }
            } else {
                data[pregnancyIndex] = [];
                data[pregnancyIndex].push(singlePatientEvents[dataItem]);
            }
        }
    }

    return data;
};
export type ReportTableTypes = Props & WithTranslation;
class ReportTable extends Component<ReportTableTypes, State> {
    public static getDerivedStateFromProps(props: Props) {
        return {
            pregnancyEventsArray: getEventsPregnancyArray(props.singlePatientEvents, props.isChild),
        };
    }

    constructor(props: Readonly<ReportTableTypes>) {
        super(props);

        this.state = {
            currentPregnancy: 0,
            dropdownOpenPregnancy: false,
            indicesToRemove: [],
            pregnancyDropdownLabel: '',
            pregnancyEventsArray: [],
        };
    }

    public getPregnancyStringArray = (pregnancySmsData: PregnancySmsData[][]): string[][][] => {
        let pregnancySmsStrings: string[][][] = [];

        const gestation: number = GESTATION_PERIOD;
        for (const element in pregnancySmsData) {
            if (pregnancySmsData[element]) {
                pregnancySmsStrings[element] = pregnancySmsData[element].map((sms: PregnancySmsData): string[] => {
                    return convertToStringArray(sms);
                });
            }
        }

        // filter out duplicate pregnancy registrations
        if (pregnancySmsStrings.length > 1) {
            for (const pregnancy in pregnancySmsStrings) {
                if (
                    pregnancySmsStrings.length - 1 !== parseInt(pregnancy, 10) &&
                    pregnancySmsStrings[parseInt(pregnancy, 10)].length === 1 &&
                    gestation >
                        Date.parse(pregnancySmsStrings[parseInt(pregnancy, 10)][0][1]) -
                            Date.parse(pregnancySmsStrings[parseInt(pregnancy, 10) + 1][0][1]) &&
                    pregnancySmsStrings[parseInt(pregnancy, 10)][0][0] === PREGNANCY_REGISTRATION &&
                    pregnancySmsStrings[parseInt(pregnancy, 10) + 1][0][0] === PREGNANCY_REGISTRATION
                ) {
                    this.state.indicesToRemove.push(parseInt(pregnancy, 10));
                }
            }
        }

        pregnancySmsStrings = pregnancySmsStrings.filter(
            (pregnancy, index) => !this.state.indicesToRemove.includes(index),
        );
        return pregnancySmsStrings;
    };

    public getWeightsArray = (pregnancySmsData: PregnancySmsData[][], field: string): WeightMonthYear[][] => {
        let weights: WeightMonthYear[][] = [];
        for (const element in pregnancySmsData) {
            if (pregnancySmsData[element]) {
                weights[element] = pregnancySmsData[element].map(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (sms: any): WeightMonthYear => {
                        return {
                            month: new Date(sms.EventDate).getMonth(),
                            weight: sms[field],
                            year: new Date(sms.EventDate).getFullYear(),
                        };
                    },
                );
            }
        }

        weights = weights.filter((pregnancy, index) => !this.state.indicesToRemove.includes(index));
        return weights;
    };

    public render() {
        const { t } = this.props;

        const listViewProps = {
            data: this.getPregnancyStringArray(this.state.pregnancyEventsArray)[this.state.currentPregnancy]
                ? this.getPregnancyStringArray(this.state.pregnancyEventsArray)[this.state.currentPregnancy]
                : [],
            headerItems: [t('Report'), t('Date'), t('Reporter'), t('Message')],
            tableClass: 'table-container',
            tbodyClass: 'body',
            tdClass: 'default-width',
        };

        return (
            <>
                <div id="filter-panel">
                    <p>
                        <Trans t={t}>Showing reports for:&emsp;</Trans>
                    </p>
                    <div className="filters">
                        {this.props.isChild ? (
                            <Dropdown
                                isOpen={false}
                                // tslint:disable-next-line: jsx-no-lambda no-empty
                                toggle={() => {
                                    // we don't want to do any thing here for now
                                }}
                            >
                                <DropdownToggle variant="success" id="dropdown-basic" caret>
                                    {t('current nutrition')}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem>{t('current nutrition')}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        ) : (
                            <Dropdown
                                className="filters"
                                isOpen={this.state.dropdownOpenPregnancy}
                                toggle={this.togglePregnancyDropDown}
                            >
                                <DropdownToggle variant="success" id="dropdown-basic" caret>
                                    <span>
                                        {this.state.pregnancyDropdownLabel.length
                                            ? this.state.pregnancyDropdownLabel
                                            : t('select pregnancy')}
                                    </span>
                                </DropdownToggle>
                                <DropdownMenu>
                                    {this.getPregnancyStringArray(this.state.pregnancyEventsArray).map(
                                        (pregnancy, i) => {
                                            return (
                                                <DropdownItem
                                                    onClick={(e) => this.handlePregnancyDropDownClick(e, t)}
                                                    key={i}
                                                >
                                                    {(() => {
                                                        if (i === 0) {
                                                            return t('current pregnancy');
                                                        }
                                                        const pregnancyIndex =
                                                            this.getPregnancyStringArray(
                                                                this.state.pregnancyEventsArray,
                                                            ).length - i;
                                                        return t(
                                                            `${
                                                                pregnancyIndex + getNumberSuffix(pregnancyIndex)
                                                            } pregnancy`,
                                                        );
                                                    })()}
                                                </DropdownItem>
                                            );
                                        },
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                </div>
                <Row id="tableRow">
                    <ListView {...listViewProps} />
                </Row>
                <div id="chart">
                    <WeightAndHeightChart
                        weights={
                            this.getWeightsArray(this.state.pregnancyEventsArray, WEIGHT)[this.state.currentPregnancy]
                        }
                        chartWrapperId={this.props.isChild ? t('nutrition-chart') : t('pregnancy-chart')}
                        title={this.props.isChild ? t('Child Weight Monitoring') : t("Mother's Weight Tracking")}
                        legendString={this.props.isChild ? t('Child Weight') : t("Mother's Weight")}
                        units={t('kg')}
                        xAxisLabel={t('weight')}
                    />
                    {this.props.isChild ? (
                        <WeightAndHeightChart
                            weights={
                                this.getWeightsArray(this.state.pregnancyEventsArray, HEIGHT)[
                                    this.state.currentPregnancy
                                ]
                            }
                            chartWrapperId="nutrition-chart-1"
                            title={t('Child Height Monitoring')}
                            legendString={t('Child Height')}
                            units={t('cm')}
                            xAxisLabel={t('height')}
                        />
                    ) : null}
                </div>
            </>
        );
    }

    private togglePregnancyDropDown = () => {
        this.setState({
            dropdownOpenPregnancy: !this.state.dropdownOpenPregnancy,
        });
    };

    private handlePregnancyDropDownClick = (e: React.MouseEvent, t: TFunction) => {
        // here we will take the new index and change the state using that index
        if ((e.target as HTMLInputElement).innerText === t('current pregnancy')) {
            this.setState({
                currentPregnancy: 0,
                pregnancyDropdownLabel: t('current pregnancy'),
            });
        } else {
            this.setState({
                currentPregnancy: parseInt((e.target as HTMLInputElement).innerText, 10),
                pregnancyDropdownLabel: (e.target as HTMLInputElement).innerText,
            });
        }
    };
}

export default withTranslation()(ReportTable);
