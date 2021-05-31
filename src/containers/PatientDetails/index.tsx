/* eslint-disable @typescript-eslint/no-use-before-define */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { useLastLocation } from 'react-router-last-location';
import { Store } from 'redux';
import BasicInformation, { LabelValuePair } from '../../components/BasicInformation';
import ReportTable from '../../components/ReportTable';
import { BACKPAGE_ICON, COMMUNE, DISTRICT, PROVINCE, VILLAGE } from '../../constants';
import * as React from 'react';
import './index.css';
import { keyBy } from 'lodash';
import { fetchData, useHandleBrokenPage } from 'helpers/utils';
import supersetFetch from '../../services/superset';
import { ErrorPage } from 'components/ErrorPage';
import Ripple from 'components/page/Loading';
import { getLocationsOfLevel, Location } from '../../store/ducks/locations';
import locationsReducer, { reducerName as locationReducerName } from '../../store/ducks/locations';
import { selectSmsDataByPatientId } from '../../store/ducks/sms_events';
import smsReducer, { reducerName as smsReducerName, SmsData } from '../../store/ducks/sms_events';
import reducerRegistry from '@onaio/redux-reducer-registry';

reducerRegistry.register(smsReducerName, smsReducer);
reducerRegistry.register(locationReducerName, locationsReducer);

interface RouteParams {
    patient_id: string;
}

interface PatientDetailProps extends RouteComponentProps<RouteParams> {
    isChild: boolean;
    smsData: SmsData[];
    provinces: Location[];
    districts: Location[];
    communes: Location[];
    villages: Location[];
    supersetService: typeof supersetFetch;
}

const defaultProps = {
    smsData: [],
    isChild: false,
    provinces: [],
    districts: [],
    communes: [],
    villages: [],
    supersetService: supersetFetch,
};

const PatientDetails = (props: PatientDetailProps) => {
    const { isChild, smsData, communes, villages, districts, provinces, supersetService } = props;
    const [loading, setLoading] = React.useState(true);
    const { error, handleBrokenPage, broken } = useHandleBrokenPage();
    const { t } = useTranslation();
    const lastLocation = useLastLocation();

    const { patient_id: patientId } = props.match.params;

    React.useEffect(() => {
        fetchData(supersetService)
            .catch((err) => {
                handleBrokenPage(err);
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return <Ripple />;
    }

    if (broken) {
        return <ErrorPage title={error?.name} message={error?.message} />;
    }

    const basicInformationValuePairs = getBasicInformationProps(
        patientId,
        isChild,
        smsData,
        t,
        communes,
        districts,
        villages,
        provinces,
    );

    return (
        <div className="patient-details">
            <Link to={lastLocation ? lastLocation.pathname : '#'} className="back-page">
                <FontAwesomeIcon icon={BACKPAGE_ICON} size="lg" />
                <span>{t('Back')}</span>
            </Link>
            <div id="titleDiv">
                <h2 id="patients_title">{t('Patient Details')}</h2>
            </div>
            <BasicInformation labelValuePairs={basicInformationValuePairs} />

            <ReportTable {...props} isChild={isChild} singlePatientEvents={smsData} />
        </div>
    );
};

function getBasicInformationProps(
    patientId: string,
    isChild: boolean,
    sortedSmsData: SmsData[],
    t: TFunction,
    communes: Location[],
    districts: Location[],
    villages: Location[],
    provinces: Location[],
): LabelValuePair[] {
    let edd,
        age,
        height,
        weight,
        firstName,
        secondName,
        lastName,
        gravidity,
        parity,
        childRisk,
        motherRisk,
        healthInsuranceNum,
        handWashing,
        household,
        toilet,
        ethnicity,
        gender,
        bloodPressure,
        muac;
    const defaultNA = t('N/A');
    const defaultEdd = t('could not find any edd');
    const defaultAge = defaultNA;
    const mostRecentReport = sortedSmsData[0];

    if (mostRecentReport.lmp_edd && !edd) {
        edd = `${mostRecentReport.lmp_edd}`;
    }
    if (mostRecentReport.age && !age) {
        edd = `${mostRecentReport.age}`;
    }
    if (mostRecentReport.gravidity && !gravidity) {
        gravidity = mostRecentReport.gravidity;
    }
    if (mostRecentReport.parity && !parity) {
        parity = mostRecentReport.parity;
    }
    if (mostRecentReport.nutrition_status && !childRisk) {
        childRisk = mostRecentReport.nutrition_status;
    }
    if (mostRecentReport.risk_level && !motherRisk) {
        motherRisk = mostRecentReport.risk_level;
    }
    if (mostRecentReport.first_name && !firstName) {
        firstName = mostRecentReport.first_name;
    }
    if (mostRecentReport.second_name && !secondName) {
        secondName = ` ${mostRecentReport.second_name}`;
    }
    if (mostRecentReport.last_name && !lastName) {
        lastName = ` ${mostRecentReport.last_name}`;
    }
    if (mostRecentReport.health_insurance_id && !healthInsuranceNum) {
        healthInsuranceNum = ` ${mostRecentReport.health_insurance_id}`;
    }
    if (mostRecentReport.height && !height) {
        height = ` ${mostRecentReport.height}`;
    }
    if (mostRecentReport.weight && !weight) {
        weight = ` ${mostRecentReport.weight}`;
    }
    if (mostRecentReport.handwashing && !handWashing) {
        handWashing = ` ${mostRecentReport.handwashing}`;
    }
    if (mostRecentReport.household && !household) {
        household = ` ${mostRecentReport.household}`;
    }
    if (mostRecentReport.toilet && !toilet) {
        toilet = ` ${mostRecentReport.toilet}`;
    }
    if (mostRecentReport.ethnicity && !ethnicity) {
        ethnicity = ` ${mostRecentReport.ethnicity}`;
    }
    if (mostRecentReport.gender && !gender) {
        gender = ` ${mostRecentReport.gender}`;
    }
    if (mostRecentReport.muac && !muac) {
        muac = ` ${mostRecentReport.muac}`;
    }
    if (mostRecentReport.bp && !bloodPressure) {
        bloodPressure = ` ${mostRecentReport.bp}`;
    }

    const locationPath = getPathFromSupersetLocs(
        provinces,
        districts,
        communes,
        villages,
        mostRecentReport.location_id,
    );
    const location = locationPath.map((location) => location.location_name).join(', ');
    const commonLabels = [
        { label: t('Name'), value: `${firstName ?? ''}${secondName ?? ''}${lastName ?? ''}` },
        { label: t('Patient ID'), value: patientId },
        { label: t('Age'), value: age ?? defaultAge },
        { label: t('Location'), value: location ?? defaultNA },
        { label: t('Current Weight'), value: weight ?? defaultNA },
        { label: t('Current Height'), value: height ?? defaultNA },
        { label: t('Health Insurance number'), value: healthInsuranceNum ?? defaultNA },
        { label: t('Household Type'), value: household ?? defaultNA },
        { label: t('Ethnicity'), value: ethnicity ?? defaultNA },
        { label: t('HandWashing'), value: handWashing ?? defaultNA },
        { label: t('Toilet'), value: toilet ?? defaultNA },
    ];
    const basicInformationProps = !isChild
        ? ([
              ...commonLabels,
              { label: t('Current Blood Pressure'), value: bloodPressure ?? defaultNA },
              { label: t('Current Gravidity'), value: gravidity ?? defaultNA },
              { label: t('Current EDD'), value: edd ?? defaultEdd },
              { label: t('Current Parity'), value: parity ?? defaultNA },
              { label: t('Previous Pregnancy Risk'), value: motherRisk ?? defaultNA },
          ] as LabelValuePair[])
        : ([
              ...commonLabels,
              { label: t('Current MUAC'), value: muac ?? defaultNA },
              { label: t('Gender'), value: gender ?? defaultNA },
              { label: t('risk categorization'), value: childRisk ?? defaultNA },
          ] as LabelValuePair[]);
    return basicInformationProps;
}

/** returns location path starting with the smallest level i.e village to province */
export const getPathFromSupersetLocs = (
    provinces: Location[],
    district: Location[],
    commune: Location[],
    village: Location[],
    location_id: string,
) => {
    // TODO this locations do not need be different locations arrays
    const provincesById = keyBy(provinces, (location) => location.location_id);
    const districtById = keyBy(district, (location) => location.location_id);
    const communeByID = keyBy(commune, (location) => location.location_id);
    const villageById = keyBy(village, (location) => location.location_id);

    const path = [];
    const thisVillage = villageById[location_id];
    path.push(thisVillage);
    const thisCommune = communeByID[thisVillage?.parent_id];
    path.push(thisCommune);
    const thisDistrict = districtById[thisCommune?.parent_id];
    path.push(thisDistrict);
    const thisProvince = provincesById[thisDistrict?.parent_id];
    path.push(thisProvince);
    return path.filter((location) => !!location);
};

PatientDetails.defaultProps = defaultProps;
export { PatientDetails };

type MapStateToProps = Pick<PatientDetailProps, 'smsData' | 'communes' | 'districts' | 'provinces' | 'villages'>;
const mapStateToProps = (state: Partial<Store>, ownProps: PatientDetailProps): MapStateToProps => {
    const patientId = ownProps.match.params.patient_id;

    const smsData = selectSmsDataByPatientId(state, patientId);

    return {
        smsData,
        communes: getLocationsOfLevel(state, COMMUNE),
        districts: getLocationsOfLevel(state, DISTRICT),
        provinces: getLocationsOfLevel(state, PROVINCE),
        villages: getLocationsOfLevel(state, VILLAGE),
    };
};

const ConnectedPatientDetails = connect(mapStateToProps, null)(PatientDetails);

export default ConnectedPatientDetails;
