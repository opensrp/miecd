import ListView from '@onaio/list-view';
import NoRecord from 'components/NoRecord';
import { keyBy, uniqWith } from 'lodash';
import React, { useState } from 'react';
import { TFunction, Trans, useTranslation } from 'react-i18next';
import Select from 'react-select';
import { Row } from 'reactstrap';
import {
    ANC_REPORT,
    BIRTH_REPORT,
    GESTATION_PERIOD,
    getMonthNames,
    NUTRITION_REGISTRATION,
    NUTRITION_REPORT,
    PREGNANCY_REGISTRATION,
} from '../../constants';
import { sortByEventDate } from '../../helpers/utils';
import { SmsData } from '../../store/ducks/sms_events';
import { Chart } from '../WeightAndHeightChart';
import './index.css';

interface ReportTableProps {
    singlePatientEvents: SmsData[];
    isChild: boolean;
}

const defaultProps = {
    singlePatientEvents: [],
    isChild: false,
};

export type ReportTableTypes = ReportTableProps;

function ReportTable(props: ReportTableTypes) {
    const { singlePatientEvents, isChild } = props;
    const smsTypesOfInterest = filterEventsByType(singlePatientEvents, isChild);
    let smsChunks = [smsTypesOfInterest];
    if (!isChild) {
        smsChunks = chunkByGravida(smsTypesOfInterest);
    }
    const [currentSmsChunkIndex, setCurrentSmsChunkIndex] = useState(smsChunks.length - 1);
    const { t } = useTranslation();

    const listViewProps = {
        data:
            smsChunks[currentSmsChunkIndex]?.map((smsData) => [
                smsData.sms_type,
                smsData.EventDate,
                smsData.health_worker_name,
                smsData.message,
            ]) ?? [],
        headerItems: [t('Report'), t('Date'), t('Reporter'), t('Message')],
        tableClass: 'table-container',
        tbodyClass: 'body',
        thClass: 'report-table__td',
        tdClass: 'report-table__td',
    };

    const currentSmsDataChunk = smsChunks[currentSmsChunkIndex];
    const filterOptions = pregnancyOptionsFilter(smsChunks, t);
    const filterValue = keyBy(filterOptions, (x) => x.value)[currentSmsChunkIndex];

    return (
        <>
            <div id="filter-panel">
                {!isChild && (
                    <>
                        <p>
                            <Trans t={t}>Showing reports for:&emsp;</Trans>
                        </p>
                        <div className="filters">
                            <Select
                                placeholder={t('Select pregnancy')}
                                options={filterOptions}
                                value={filterValue}
                                onChange={(val) => {
                                    setCurrentSmsChunkIndex(val?.value ?? smsChunks.length - 1);
                                }}
                                classNamePrefix="patient-details-filters"
                                isClearable={true}
                                id="pregnancy-filter"
                            />
                        </div>
                    </>
                )}
            </div>
            <Row id="tableRow">
                <ListView {...listViewProps} />
            </Row>
            {currentSmsDataChunk.length > 0 ? (
                <div id="chart">
                    {isChild ? (
                        <Chart
                            dataArray={getWeightHeightDataSeries(currentSmsDataChunk, t)}
                            chartWrapperId="child-nutrition-chart-1"
                            title={t('Weight Height Monitoring')}
                            legendString={t('Weight Height')}
                            units={t('cm')}
                            yAxisLabel={t('weight and height')}
                        />
                    ) : (
                        <>
                            <Chart
                                dataArray={getWeightDataSeries(currentSmsDataChunk, t)}
                                chartWrapperId="weight-chart-1"
                                title={t('Wight Monitoring')}
                                legendString={t('Weight')}
                                units={t('kg')}
                                yAxisLabel={t('weight')}
                            />

                            <Chart
                                dataArray={getBloodPSeriesForChart(currentSmsDataChunk, t)}
                                chartWrapperId="blood-pressure"
                                title="Blood Pressure"
                                legendString={t('Blood pressure')}
                                units=""
                                yAxisLabel={t('Blood Pressure')}
                            />
                        </>
                    )}
                </div>
            ) : (
                <NoRecord message={t('No data found')} />
            )}
        </>
    );
}

ReportTable.defaultProps = defaultProps;

export default ReportTable;

/** filter out sms events that this component need not concern itself with */
export const filterEventsByType = (smsData: SmsData[], isChild: boolean) => {
    const lowerCase = (x: string) => x.toLowerCase();
    const pregnancySmsEventTypes = [BIRTH_REPORT, ANC_REPORT, PREGNANCY_REGISTRATION].map(lowerCase);
    const nutritionSmsEventTypes = [NUTRITION_REPORT, NUTRITION_REGISTRATION].map(lowerCase);
    const smsTypesToUse = isChild ? nutritionSmsEventTypes : pregnancySmsEventTypes;

    return smsData.filter((sms) => {
        return smsTypesToUse.includes(lowerCase(sms.sms_type));
    });
};

/** helps chunk and group smsEvents by the pregnancies that they belong to */
export const chunkByGravida = (smsEvents: SmsData[]) => {
    const smsChunks: SmsData[][] = [];
    let chunkIndex = 0;
    if (!smsEvents.length) {
        return [[]];
    }

    smsEvents.forEach((event, idx) => {
        if (smsChunks[chunkIndex]) {
            if (
                event.sms_type === PREGNANCY_REGISTRATION ||
                (smsChunks[chunkIndex][idx - 1] && // check if same pregnancy based on the gestation period difference.
                    GESTATION_PERIOD <
                        Math.abs(Date.parse(event.EventDate) - Date.parse(smsChunks[chunkIndex][idx - 1].EventDate)))
            ) {
                chunkIndex += 1;
                if (!smsChunks[chunkIndex]) {
                    smsChunks[chunkIndex] = [];
                }
                smsChunks[chunkIndex].push(event);
            } else {
                smsChunks[chunkIndex].push(event);
            }
        } else {
            smsChunks[chunkIndex] = [];
            smsChunks[chunkIndex].push(event);
        }
    });

    // remove duplicate pregnancy registration chunks with respect to the gestation period
    return uniqWith(smsChunks, (chunk1, chunk2) => {
        const pregnancyRegTypeSms1 = chunk1.filter((sms) => sms.sms_type === PREGNANCY_REGISTRATION);
        const pregnancyRegTypeSms2 = chunk2.filter((sms) => sms.sms_type === PREGNANCY_REGISTRATION);
        if (pregnancyRegTypeSms1.length && pregnancyRegTypeSms2.length) {
            return (
                GESTATION_PERIOD >
                Math.abs(Date.parse(pregnancyRegTypeSms1[0].EventDate) - Date.parse(pregnancyRegTypeSms1[0].EventDate))
            );
        }
        return false;
    });
};

/** create a chart data series containing the weight and height data series from smsEvents */
export const getWeightHeightDataSeries = (smsEvents: SmsData[], t: TFunction) => {
    const categories: string[] = [];
    const dataSeries: { data: (number | undefined)[]; name: string }[] = [
        { data: [], name: 'weight' },
        { data: [], name: 'height' },
    ];
    // make sure events are sorted from oldest to latest
    const sortedSmsEvents = sortByEventDate(smsEvents).reverse();

    for (const data of sortedSmsEvents) {
        const calendarCategoryObj = {
            month: new Date(data.event_date).getMonth(),
            year: new Date(data.event_date).getFullYear(),
        };
        if (data.weight && data.height) {
            categories.push(`${getMonthNames(t)[calendarCategoryObj.month]}/${calendarCategoryObj.year}`);
            dataSeries[0].data.push(data.weight);
            dataSeries[1].data.push(data.height);
        }
    }
    return {
        categories,
        dataSeries,
    };
};

/** create a chart data series containing the weight data series from smsEvents */
export const getWeightDataSeries = (smsEvents: SmsData[], t: TFunction) => {
    const dataSeries = getWeightHeightDataSeries(smsEvents, t);
    const weightDataSeries = {
        categories: dataSeries.categories,
        dataSeries: [dataSeries.dataSeries[0]],
    };

    return weightDataSeries;
};

/** create a data series containing the diastolic and systolic data series from smsEvents */
export const getBloodPSeriesForChart = (smsEvents: SmsData[], t: TFunction) => {
    const categories: string[] = [];
    const dataSeries: { data: (number | undefined)[]; name: string }[] = [
        { data: [], name: 'systolic' },
        { data: [], name: 'diastolic' },
    ];
    // make sure events are sorted from oldest to latest
    const sortedSmsEvents = sortByEventDate(smsEvents).reverse();

    const regex = /\d{2,3}\S{0,3}\d{2,3}/;
    const singleBpValueRegex = /\d{2,3}/g;

    for (const data of sortedSmsEvents) {
        const calendarCategoryObj = {
            month: new Date(data.EventDate).getMonth(),
            year: new Date(data.EventDate).getFullYear(),
        };
        const hasValidBp = regex.test(data.bp);
        if (!hasValidBp) {
            continue;
        }
        categories.push(`${getMonthNames(t)[calendarCategoryObj.month]}/${calendarCategoryObj.year}`);
        const matchedValues = [...Array.from(data.bp.matchAll(singleBpValueRegex))];

        dataSeries[0].data.push(Number(matchedValues[0]));
        dataSeries[1].data.push(Number(matchedValues[1]));
    }
    return {
        categories,
        dataSeries,
    };
};

/** generate filter option filters from chunked smsEvents */
export const pregnancyOptionsFilter = (chunkedSms: SmsData[][], t: TFunction) => {
    return chunkedSms.map((_, index) => {
        const thisOption = {
            value: index,
            label: t(`pregnancy ${index + 1}`),
        };
        if (index === chunkedSms.length - 1) {
            thisOption.label = t(`Current Pregnancy`);
        }
        return thisOption;
    });
};
