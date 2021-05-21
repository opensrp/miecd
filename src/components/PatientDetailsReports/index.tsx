import ListView from '@onaio/list-view';
import { keyBy } from 'lodash';
import { useEffect, useState } from 'react';
import { TFunction, Trans, useTranslation } from 'react-i18next';
import Select from 'react-select';
import { Row } from 'reactstrap';
import { Dictionary, sortByEventDate } from '../../helpers/utils';
import { LogFaceSmsType, NutritionLogFaceSms, PregnancyLogFaceSms } from '../../store/ducks/sms_events';
import React from 'react';

interface ReportTableProps {
    patientsReports: (PregnancyLogFaceSms | NutritionLogFaceSms)[];
    isChild: boolean;
}

const defaultProps = {
    patientsReports: [],
    isChild: false,
};

export type ReportTableTypes = ReportTableProps;

/** renders a table that shows reports received for a certain patient:
 * in case of Mother, there is an added filter by the pregnancy(gravida count)
 */
function PatientDetailsReport(props: ReportTableTypes) {
    const { patientsReports, isChild } = props;
    const [currentPregnancyEventId, setCurrentPregnancyEventId] = useState<string>('');
    const [reportsToShow, setReportsToShow] = useState<LogFaceSmsType[]>([]);
    const [pregnancyGroups, setPregnancyGroups] = useState<Dictionary<PregnancyLogFaceSms[]>>({});
    const { t } = useTranslation();

    useEffect(() => {
        if (!isChild) {
            const thisPregnancyGroups = chunkByGravida(patientsReports as PregnancyLogFaceSms[]);
            const currentPregnancy = Object.keys(thisPregnancyGroups)[0];
            setCurrentPregnancyEventId(currentPregnancy);
            setPregnancyGroups(thisPregnancyGroups);
        }
    }, [isChild, patientsReports]);

    useEffect(() => {
        if (isChild) {
            setReportsToShow(patientsReports as LogFaceSmsType[]);
        } else {
            const pregnancyReportsToShow = pregnancyGroups[currentPregnancyEventId] ?? [];
            setReportsToShow(pregnancyReportsToShow);
        }
    }, [currentPregnancyEventId, isChild, patientsReports, pregnancyGroups]);

    const listViewProps = {
        data:
            reportsToShow?.map((smsData) => [
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

    const filterOptions = pregnancyOptionsFilter(pregnancyGroups, t);
    const filterValue = keyBy(filterOptions, (x) => x.value)[currentPregnancyEventId];

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
                                    setCurrentPregnancyEventId(val?.value ?? '');
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
        </>
    );
}

PatientDetailsReport.defaultProps = defaultProps;

export { PatientDetailsReport };

/** helps chunk and group smsEvents by the pregnancies that they belong to */
export const chunkByGravida = (smsEvents: PregnancyLogFaceSms[]) => {
    const sortedSms = sortByEventDate(smsEvents);

    const smsByPregnancyId: Dictionary<PregnancyLogFaceSms[]> = {};
    for (const sms of sortedSms) {
        if (!smsByPregnancyId[sms.pregnancy_id]) {
            smsByPregnancyId[sms.pregnancy_id] = [];
        }
        smsByPregnancyId[sms.pregnancy_id].push(sms);
    }
    return smsByPregnancyId;
};

/** generate filter option filters from chunked smsEvents */
export const pregnancyOptionsFilter = (chunkedSms: Dictionary<PregnancyLogFaceSms[]>, t: TFunction) => {
    const options: Dictionary[] = [];
    const listOfProps = Object.keys(chunkedSms);
    const keySegmentsLength = listOfProps.length;

    listOfProps.map((key, index) => {
        const label = index === 0 ? t('Current pregnancy') : t(`pregnancy ${keySegmentsLength - index}`);
        const thisOption = {
            value: key,
            label,
        };
        options.push(thisOption);
    });

    return options;
};
