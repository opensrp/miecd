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
import { BACKPAGE_ICON, COMMUNE, DISTRICT, MODULE_SEARCH_PARAM_KEY, PROVINCE, VILLAGE } from '../../constants';
import * as React from 'react';
import './index.css';
import { flatten, keyBy } from 'lodash';
import { fetchData, fetchSupersetData, sortByEventDate, useHandleBrokenPage } from 'helpers/utils';
import supersetFetch from '../../services/superset';
import { ErrorPage } from 'components/ErrorPage';
import Ripple from 'components/page/Loading';
import { getLocationsOfLevel, Location } from '../../store/ducks/locations';
import locationsReducer, { reducerName as locationReducerName } from '../../store/ducks/locations';
import {
    CompartmentSmsTypes,
    getSmsDataByFilters,
    LogFaceSmsType,
    NbcPncSmsData,
    NutritionSmsData,
    PregnancySmsData,
} from '../../store/ducks/sms_events';
import smsReducer, { reducerName as smsReducerName } from '../../store/ducks/sms_events';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { PatientDetailsReport } from 'components/PatientDetailsReports';
import { parse } from 'query-string';
import { LogFaceModules } from 'configs/settings';
import { ConnectedChildChart } from 'components/PatientDetailsCharts/ChildChart';
import { ConnectedMotherChart } from 'components/PatientDetailsCharts/MotherChart';
import { useQueries } from 'react-query';
import {
    COMPARTMENTS_NBC_AND_PNC_SLICE,
    COMPARTMENTS_NUTRITION_SLICE,
    COMPARTMENTS_PREGNANCY_SLICE,
} from 'configs/env';
import superset from '@onaio/superset-connector';

reducerRegistry.register(smsReducerName, smsReducer);
reducerRegistry.register(locationReducerName, locationsReducer);

interface RouteParams {
    patient_id: string;
}

interface PatientDetailProps extends RouteComponentProps<RouteParams> {
    isChild: boolean;
    provinces: Location[];
    districts: Location[];
    communes: Location[];
    villages: Location[];
    supersetService: typeof supersetFetch;
    logFaceReports: LogFaceSmsType[];
}

const defaultProps = {
    isChild: false,
    provinces: [],
    districts: [],
    communes: [],
    villages: [],
    supersetService: supersetFetch,
    logFaceReports: [],
};

const PatientDetails = (props: PatientDetailProps) => {
    const { isChild, communes, villages, districts, provinces, supersetService, logFaceReports } = props;
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

    const supersetFilterOptions = superset.getFormData(
        1,
        [
            {
                comparator: patientId,
                operator: '==',
                subject: 'anc_id',
            },
        ],
        { event_date: false },
    );

    const basicInfoQueries = useQueries(
        [COMPARTMENTS_NBC_AND_PNC_SLICE, COMPARTMENTS_NUTRITION_SLICE, COMPARTMENTS_PREGNANCY_SLICE].map((slice) => {
            return {
                queryKey: [slice, patientId],
                queryFn: () => fetchSupersetData<CompartmentSmsTypes>(slice, t, supersetFilterOptions, supersetService),
            };
        }),
    );

    const mostRecentReports = flatten(basicInfoQueries.map((query) => query.data)) as CompartmentSmsTypes[];

    if (loading) {
        return <Ripple />;
    }

    if (broken) {
        return <ErrorPage title={error?.name} message={error?.message} />;
    }

    const basicInformationValuePairs = getBasicInformationProps(
        patientId,
        isChild,
        mostRecentReports,
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

            <PatientDetailsReport patientsReports={logFaceReports} isChild={isChild}></PatientDetailsReport>

            {isChild ? <ConnectedChildChart {...props} /> : <ConnectedMotherChart {...props} />}
        </div>
    );
};

function getBasicInformationProps(
    patientId: string,
    isChild: boolean,
    recentSmsData: CompartmentSmsTypes[],
    t: TFunction,
    communes: Location[],
    districts: Location[],
    villages: Location[],
    provinces: Location[],
): LabelValuePair[] {
    const defaultNA = t('N/A');
    const defaultAge = defaultNA;
    const mostRecentReport = sortByEventDate(recentSmsData)[0] ?? {};

    const {
        lmp_edd: edd,
        event_id: smsId,
        age,
        gravidity,
        parity,
        risk_level: motherRiskCat,
        health_insurance: healthInsuranceNum,
        height,
        weight,
        handwashing: handWashing,
        household,
        toilet,
        ethnicity,
        planned_delivery_location: deliveryLocation,
        previous_risks: previousRisks,
        mother_symptoms: motherSymptoms,
        child_symptoms: childSymptoms,
    } = mostRecentReport as NutritionSmsData & PregnancySmsData & NbcPncSmsData;

    const locationPath = getPathFromSupersetLocs(
        provinces,
        districts,
        communes,
        villages,
        mostRecentReport.location_id,
    );
    const location = locationPath.map((location) => location.location_name).join(', ');
    const commonLabels = [
        { label: t('SMS ID'), value: smsId },
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
              { label: t('Current Parity'), value: parity ?? defaultNA },
              { label: t('Current Gravidity'), value: gravidity ?? defaultNA },
              { label: t('Current EDD'), value: edd ?? defaultNA },
              { label: t('Current Risk categorization'), value: motherRiskCat ?? defaultNA },
              { label: t('Delivery plan/ Location of delivery'), value: deliveryLocation ?? defaultNA },
              { label: t('Previous risks and Existing conditions'), value: previousRisks ?? defaultNA },
              { label: t('Current risks'), value: motherSymptoms ?? defaultNA },
          ] as LabelValuePair[])
        : ([...commonLabels, { label: t('Current risks'), value: childSymptoms ?? defaultNA }] as LabelValuePair[]);
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

const smsByFilters = getSmsDataByFilters();

type MapStateToProps = Pick<PatientDetailProps, 'communes' | 'districts' | 'provinces' | 'villages' | 'logFaceReports'>;
const mapStateToProps = (state: Partial<Store>, ownProps: PatientDetailProps): MapStateToProps => {
    const patientId = ownProps.match.params.patient_id;

    const module = parse(ownProps.location.search)[MODULE_SEARCH_PARAM_KEY] as LogFaceModules | undefined;

    const logFaceReports = smsByFilters(state, {
        patientId: patientId,
        module,
    });

    return {
        communes: getLocationsOfLevel(state, COMMUNE),
        districts: getLocationsOfLevel(state, DISTRICT),
        provinces: getLocationsOfLevel(state, PROVINCE),
        villages: getLocationsOfLevel(state, VILLAGE),
        logFaceReports,
    };
};

const ConnectedPatientDetails = connect(mapStateToProps, null)(PatientDetails);

export default ConnectedPatientDetails;
