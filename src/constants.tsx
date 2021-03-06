import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { TFunction } from 'i18next';

// openSRP api endpoints
export const OPENSRP_SECURITY_AUTHENTICATE = '/security/authenticate';

// internal urls
export const CHILD_PATIENT_DETAIL = 'child_patient_detail';
export const PATIENT_DETAIL = 'patient_detail';
export const NBC_AND_PNC_URL = '/nbc_and_pnc';
export const HIERARCHICAL_DATA_URL = '/hierarchicaldata';
export const PREGNANCY_URL = '/pregnancy';
export const LOGIN_URL = '/login';
export const LOGOUT_URL = '/logout';
export const HOME_URL = '/';
export const PREGNANCY_COMPARTMENTS_URL = '/pregnancy_compartments';
export const NBC_AND_PNC_COMPARTMENTS_URL = '/nbc_and_pnc_compartments';
export const CLIENT_URL = '/clients';
export const LOGFACE_URL = '/log-face';
export const PREGNANCY_LOGFACE_URL = '/pregnancy_log_face';
export const NBC_AND_PNC_LOGFACE_URL = '/nbc_and_pnc_logface_url';
export const NUTRITION_LOGFACE_URL = '/nutrition_logface_url';
export const NUTRITION_COMPARTMENTS_URL = '/nutrition_commpartments_url';
export const PREGNANCY_ANALYSIS_URL = '/pregnancy_analysis';
export const NBC_AND_PNC_ANALYSIS_URL = '/nbc_and_pnc_analysis';
export const NUTRITION_ANALYSIS_URL = '/nutrition_analysis';
export const NUTRITION_URL = '/nutrition';
export const NOT_FOUND_URL = '/404';
export const HOUSEHOLD_URL = '/404';
export const ANC_URL = '/404';
export const CHILD_URL = '/404';
export const USER_URL = '/404';
export const ROLE_URL = '/404';
export const TEAM_URL = '/404';
export const LOCATIONS_URL = '/404';
export const REPORTS_URL = '/';
export const PATIENT_DETAIL_URL = `/${PATIENT_DETAIL}/:patient_id`;
export const CHILD_PATIENT_DETAIL_URL = `/${CHILD_PATIENT_DETAIL}/:patient_id`;
export const VIETNAM_COUNTRY_LOCATION_ID = 'd1865325-11e6-4e39-817b-e676c1affecf';
export const BACKEND_CALLBACK_URL = '/fe/oauth/callback/opensrp';
export const BACKEND_CALLBACK_PATH = '/fe/oauth/callback/:id';
export const REACT_CALLBACK_PATH = '/oauth/callback/:id';
export const BACKEND_LOGIN_URL = '/fe/login';
export const EXPRESS_LOGIN_URL = '/login';
export const REACT_LOGIN_URL = '/login';
export const EXPRESS_TOKEN_REFRESH_URL = '/refresh/token';
// admin urls
export const URL_ADMIN = '/admin';

export const URL_USER = `${URL_ADMIN}/users`;
export const URL_USER_GROUPS = `${URL_USER}/groups`;
export const URL_USER_ROLES = `${URL_USER}/roles`;
export const URL_USER_EDIT = `${URL_USER}/edit`;
export const URL_TEAMS = `${URL_ADMIN}/teams`;
export const URL_TEAM_ASSIGNMENT = `${URL_TEAMS}/team-assignment`;
export const URL_TEAMS_EDIT = `${URL_TEAMS}/edit`;
export const URL_TEAMS_ADD = `${URL_TEAMS}/add`;
export const URL_LOCATION_UNIT = `${URL_ADMIN}/location/unit`;
export const URL_LOCATION_UNIT_ADD = `${URL_LOCATION_UNIT}/add`;
export const URL_LOCATION_UNIT_EDIT = `${URL_LOCATION_UNIT}/edit/:id`;
export const URL_LOCATION_UNIT_GROUP = `${URL_ADMIN}/location/group`;
export const URL_LOCATION_UNIT_GROUP_ADD = `${URL_LOCATION_UNIT_GROUP}/add`;
export const URL_LOCATION_UNIT_GROUP_EDIT = `${URL_LOCATION_UNIT_GROUP}/edit/:id`;

// string literals
export const HIGH = 'high';
export const LOW = 'low';
export const RED = 'red';
export const NO = 'no';
export const OVERWEIGHT = 'overweight';
export const STUNTED = 'stunted';
export const SEVERE_WASTING = 'severe wasting';
export const INAPPROPRIATELY_FED = 'inappropriately fed';
export const NOT_SET_LOWERCASE = 'not set';
export const PREGNANCY = 'Pregnancy';
export const NBC_AND_PNC = 'NBC & PNC';
export const NBC_AND_PNC_CHILD = 'NBC & PNC_CHILD';
export const NBC_AND_PNC_WOMAN = 'NBC & PNC_WOMAN';
export const NUTRITION = 'Nutrition';
export const NO_UNDERSCORE_RISK = 'no_risk';
export const RED_ALERT = 'red_alert';
export const NORMAL = 'normal';

// module string literals
export const PREGNANCY_MODULE = 'Pregnancy';
export const NUTRITION_MODULE = 'Nutrition';
export const NBC_AND_PNC_MODULE = 'NBC & PNC';

export const ALL = 'all';
export const UP = 'up';
export const NO_RISK_LOWERCASE = 'no risk';
export const NO_RISK = 'No Risk';
export const VIETNAM = 'Vietnam';
export const COUNTRY = 'Country';
export const PROVINCE = 'Province';
export const COMMUNE = 'Commune';
export const DISTRICT = 'District';
export const VILLAGE = 'Village';
export const RED_ALERT_CLASSNAME = 'red-alert';
export const EC_WOMAN = 'ec_woman';
export const EC_FAMILY_MEMBER = 'ec_family_member';
export const EC_CHILD = 'ec_child';

// smsTypes
// t('Pregnancy Detection')
export const PREGNANCY_DETECTION = 'Pregnancy Detection';
// t('Update Pregnancy Detection')
export const UPDATE_PREGNANCY_DETECTION = 'Update Pregnancy Detection';
export const PREGNANCY_IDENTIFICATION = 'Pregnancy Identification';
// t('Pregnancy Registration')
export const PREGNANCY_REGISTRATION = 'Pregnancy Registration';
export const ANC_REPORT = 'ANC Report';
export const HOME_VISIT_REPORT = 'Home Visit Report';
// t('Social Determinants')
export const SOCIAL_DETERMINANTS = 'Social Determinants';
// t('Delivery Planning')
export const DELIVERY_PLANNING = 'Delivery Planning';
// t('Birth Report')
export const BIRTH_REPORT = 'Birth Report';
// t('Death Report')
export const DEATH_REPORT = 'Death Report';
export const UPDATE_DEATH_REPORT = 'Update Death Report';
// t('Red Alert Report')
export const RED_ALERT_REPORT = 'Red Alert Report';
// t('Response Report')
export const RESPONSE_REPORT = 'Response Report';
// t('Refusal Report')
export const REFUSAL_REPORT = 'Refusal Report';
// t('Departure Code')
export const DEPARTURE_CODE = 'Departure Code';
// t('Postnatal and Newborn Care')
export const POSTNATAL_AND_NEWBORN_CARE = 'Postnatal and Newborn Care';
// t('Nutrition Registration')
export const NUTRITION_REGISTRATION = 'Nutrition Registration';
// t('Update Nutrition Registration')
export const UPDATE_NUTRITION_REGISTRATION = 'Update Nutrition Registration';
export const MONTHLY_NUTRITION_REPORT = 'Monthly Nutrition Report';
export const ACCOUNT_CHECK = 'Account Check';
// t('ANC Visit')
export const ANC_VISIT = 'ANC Visit';
// t('Home ANC Visit')
export const HOME_ANC_VISIT = 'Home ANC Visit';
// t('Departure Report')
export const DEPARTURE_REPORT = 'Departure Report';
// t('PNC Report')
export const PNC_REPORT = 'PNC Report';
// t('Newborn Report')
export const NEWBORN_REPORT = 'Newborn Report';

// // sms events fields
export const NUTRITION_STATUS = 'nutrition_status';
export const GROWTH_STATUS = 'growth_status';
export const FEEDING_CATEGORY = 'feeding_category';
export const EVENT_ID = 'event_id';
export const LOGFACE_RISK = 'logface_risk';
export const HEIGHT = 'height';
export const WEIGHT = 'weight';
export const RISK = 'risk';
export const NUTRITION_REPORT = 'Nutrition Report';
export const RISK_LEVEL = 'risk_level';

// TIME constants
export const MICROSECONDS_IN_A_WEEK = 604800000;
export const GESTATION_PERIOD = 24192000000;

// Back arrow constant
export const BACKPAGE_ICON: IconProp = ['fas', 'arrow-left'];

// monthNames
export const getMonthNames = (t: TFunction) => [
    t('January'),
    t('February'),
    t('March'),
    t('April'),
    t('May'),
    t('June'),
    t('July'),
    t('August'),
    t('September'),
    t('October'),
    t('November'),
    t('December'),
];

// operational constants
export const DEFAULT_PAGINATION_SIZE = 5;
export const EN_LANGUAGE_CODE = 'en_core' as const;
export const VI_LANGUAGE_CODE = 'vi_core' as const;
export type LANGUAGE_CODES = typeof EN_LANGUAGE_CODE | typeof VI_LANGUAGE_CODE;

export const ALL_LANGUAGE_OPTIONS = {
    [EN_LANGUAGE_CODE]: 'English',
    [VI_LANGUAGE_CODE]: 'Vietnamese',
};

export const DATE_FORMAT = 'dd/MM/yyyy';
export const EVENT_DATE_DATE_FORMAT = 'yyyy-MM-dd';
export const SMS_MESSAGE_DATE_DATE_FORMAT = 'dd-MM-yyyy';
export const LOCATION_FILTER_PARAM = 'locationSearch';
export const RISK_CATEGORY_FILTER_PARAM = 'riskCategory';
export const MODULE_SEARCH_PARAM_KEY = 'module';
export const SMS_TYPE_FILTER_PARAM = 'smsType';
export const SEARCH_FILTER_PARAM = 'search';

// react-query queryKey's
// compartment slices
export const FETCH_COMPARTMENTS_PREGNANCY_SLICE = 'FETCH_COMPARTMENTS_PREGNANCY_SLICE';
export const FETCH_COMPARTMENTS_NBC_AND_PNC_SLICE = 'FETCH_COMPARTMENTS_NBC_AND_PNC_SLICE';
export const FETCH_COMPARTMENTS_NUTRITION_SLICE = 'FETCH_COMPARTMENTS_NUTRITION_SLICE';
// location slices
export const FETCH_VILLAGES = 'FETCH_VILLAGES';
export const FETCH_COMMUNES = 'FETCH_COMMUNES';
export const FETCH_DISTRICTS = 'FETCH_DISTRICTS';
export const FETCH_PROVINCES = 'FETCH_PROVINCES';
// user location slice
export const FETCH_USER_LOCATION = 'FETCH_USER_LOCATION';
// user id
export const FETCH_USER_ID = 'FETCH_USER_ID';
