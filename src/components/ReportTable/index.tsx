<<<<<<< HEAD
import ListView from '@onaio/list-view';
import { ConnectedChildChart } from 'components/PatientDetailsCharts/ChildChart';
import { ConnectedMotherChart } from 'components/PatientDetailsCharts/MotherChart';
import { keyBy, uniqWith } from 'lodash';
import React, { useState } from 'react';
import { TFunction, Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';
import Select from 'react-select';
import { Row } from 'reactstrap';
=======
import NoRecord from 'components/NoRecord';
import { uniqWith } from 'lodash';
import React, { useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
>>>>>>> Remove old patientDetailsReports table code in ReportTable
import {
    ANC_REPORT,
    BIRTH_REPORT,
    GESTATION_PERIOD,
    NUTRITION_REGISTRATION,
    NUTRITION_REPORT,
    PREGNANCY_REGISTRATION,
} from '../../constants';
import { SmsData } from '../../store/ducks/sms_events';
import './index.css';

interface ReportTableProps {
    singlePatientEvents: SmsData[];
    isChild: boolean;
}

const defaultProps = {
    singlePatientEvents: [],
    isChild: false,
};

export type ReportTableTypes = ReportTableProps & RouteComponentProps<{ patient_id: string }>;

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
            {isChild ? <ConnectedChildChart {...props} /> : <ConnectedMotherChart {...props} />}
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
    const finalChunks = uniqWith(smsChunks, (chunk1, chunk2) => {
        const pregnancyRegTypeSms1 = chunk1.filter((sms) => sms.sms_type === PREGNANCY_REGISTRATION);
        const pregnancyRegTypeSms2 = chunk2.filter((sms) => sms.sms_type === PREGNANCY_REGISTRATION);
        if (pregnancyRegTypeSms1.length && pregnancyRegTypeSms2.length) {
            return (
                GESTATION_PERIOD >
                Math.abs(Date.parse(pregnancyRegTypeSms1[0].EventDate) - Date.parse(pregnancyRegTypeSms2[0].EventDate))
            );
        }
        return false;
    });
    return finalChunks;
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
