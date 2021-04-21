/* eslint-disable @typescript-eslint/no-use-before-define */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { useLastLocation } from 'react-router-last-location';
import { Row } from 'reactstrap';
import { Store } from 'redux';
import BasicInformation, { LabelValuePair } from '../../components/BasicInformation';
import ReportTable from '../../components/ReportTable';
import { BACKPAGE_ICON, FEEDING_CATEGORY, GROWTH_STATUS, NUTRITION_STATUS } from '../../constants';
import { filterByPatientId, sortByEventDate } from '../../helpers/utils';
import { getSmsData, SmsData } from '../../store/ducks/sms_events';
import './index.css';
import React from 'react';

interface Props extends RouteComponentProps {
    patientId: string;
    smsData: SmsData[];
    isChild: boolean;
}

export const PatientDetails = ({ isChild = false, patientId = 'none', smsData = [] }: Props) => {
    const [filteredData, setFilteredData] = useState<SmsData[]>([]);
    const { t } = useTranslation();

    const lastLocation = useLastLocation();
    useEffect(() => {
        setFilteredData(
            sortByEventDate(
                filterByPatientId({
                    patientId,
                    smsData,
                }),
            ),
        );
    }, [patientId, smsData]);
    return (
        <div className="patient-details">
            <Link to={lastLocation ? lastLocation.pathname : '#'} className="back-page">
                <FontAwesomeIcon icon={BACKPAGE_ICON} size="lg" />
                <span>{t('Back')}</span>
            </Link>
            <div id="titleDiv">
                <h2 id="patients_title">{t('Patient Details')}</h2>
            </div>
            <BasicInformation labelValuePairs={getBasicInformationProps(patientId, isChild, filteredData, t)} />

            <ReportTable isChild={isChild} singlePatientEvents={filteredData} />
        </div>
    );
};
function getBasicInformationProps(
    patientId: string,
    isChild: boolean,
    filteredData: SmsData[],
    t: TFunction,
): LabelValuePair[] {
    const basicInformationProps = !isChild
        ? ([
              { label: t('ID'), value: patientId },
              { label: t('Location'), value: getCurrentLocation(filteredData, t) },
              { label: t('Current Gravidity'), value: getCurrentGravidity(filteredData) },
              { label: t('Current EDD'), value: getCurrentEdd(filteredData, t) },
              { label: t('Current Parity'), value: getCurrenParity(filteredData) },
              { label: t('Previous Pregnancy Risk'), value: getPreviousPregnancyRisk(filteredData, t) },
          ] as LabelValuePair[])
        : ([
              { label: t('Age'), value: getAge(filteredData) },
              { label: t('ID'), value: patientId },
              { label: t('Could not find any risk categorization'), value: getNutritionStatus(filteredData, t) },
              { label: t('Location of residence'), value: getCurrentLocation(filteredData, t) },
          ] as LabelValuePair[]);
    return basicInformationProps;
}

function getCurrentEdd(filteredData: SmsData[], t: TFunction): string {
    const reversedFilteredData: SmsData[] = [...filteredData];
    reversedFilteredData.reverse();
    for (const data in reversedFilteredData) {
        if (reversedFilteredData[data].lmp_edd) {
            return `${reversedFilteredData[data].lmp_edd}`;
        }
    }
    return t('could not find any edd');
}

function getAge(filteredData: SmsData[]): string {
    const reversedFilteredData: SmsData[] = [...filteredData];
    reversedFilteredData.reverse();
    for (const data in reversedFilteredData) {
        if (reversedFilteredData[data].age) {
            return reversedFilteredData[data].age;
        }
    }
    return '0';
}

function getNutritionStatus(filteredData: SmsData[], t: TFunction): string {
    const reversedFilteredData: SmsData[] = [...filteredData];
    reversedFilteredData.reverse();
    const statusFields: string[] = [NUTRITION_STATUS, GROWTH_STATUS, FEEDING_CATEGORY];
    for (const data in reversedFilteredData) {
        if (reversedFilteredData[data]) {
            for (const field in statusFields) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((reversedFilteredData[data] as never)[statusFields[field]]) {
                    return (reversedFilteredData[data] as never)[statusFields[field]];
                }
            }
        }
    }
    return t('no risk category');
}

function getCurrentGravidity(filteredData: SmsData[]): number {
    const reversedFilteredData: SmsData[] = [...filteredData];
    reversedFilteredData.reverse();
    for (const data in reversedFilteredData) {
        if (reversedFilteredData[data].gravidity) {
            return reversedFilteredData[data].gravidity;
        }
    }
    return 0;
}

function getCurrenParity(filteredData: SmsData[]): number {
    const reversedFilteredData: SmsData[] = [...filteredData];
    reversedFilteredData.reverse();
    for (const data in reversedFilteredData) {
        if (reversedFilteredData[data].parity) {
            return reversedFilteredData[data].parity;
        }
    }
    return 0;
}

function getCurrentLocation(filteredData: SmsData[], t: TFunction): string {
    const reversedFilteredData: SmsData[] = [...filteredData];
    reversedFilteredData.reverse();
    for (const data in reversedFilteredData) {
        if (reversedFilteredData[data].health_worker_location_name) {
            return reversedFilteredData[data].health_worker_location_name;
        }
    }
    return t('could not find any location');
}

function getPreviousPregnancyRisk(filteredData: SmsData[], t: TFunction): string {
    const reversedFilteredData: SmsData[] = [...filteredData];
    reversedFilteredData.reverse();
    if (reversedFilteredData[1]) {
        return reversedFilteredData[1].logface_risk;
    }
    return t('no risk');
}

type RouterProps = RouteComponentProps<{
    patient_id: string;
}> & { isChild: boolean };

const mapStateToProps = (state: Partial<Store>, ownProps: RouterProps) => {
    return {
        isChild: ownProps.isChild,
        patientId: ownProps.match.params.patient_id,
        smsData: getSmsData(state),
    };
};

const ConnectedPatientDetails = connect(mapStateToProps, null)(PatientDetails);

export default ConnectedPatientDetails;
