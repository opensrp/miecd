import { IconProp } from '@fortawesome/fontawesome-svg-core';

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
export const NEWBORN_REPORT = 'Newborn Report';
export const EC_WOMAN = 'ec_woman';
export const EC_FAMILY_MEMBER = 'ec_family_member';
export const EC_CHILD = 'ec_child';

// // sms events fields
export const NUTRITION_STATUS = 'nutrition_status';
export const GROWTH_STATUS = 'growth_status';
export const FEEDING_CATEGORY = 'feeding_category';
export const EVENT_ID = 'event_id';
export const LOGFACE_RISK = 'logface_risk';
export const HEIGHT = 'height';
export const WEIGHT = 'weight';
export const RISK = 'risk';
export const PREGNANCY_REGISTRATION = 'Pregnancy Registration';
export const ANC_REPORT = 'ANC Report';
export const BIRTH_REPORT = 'Birth Report';
export const NUTRITION_REGISTRATION = 'Nutrition Registration';
export const NUTRITION_REPORT = 'Nutrition Report';

export const DEFAULT_NUMBER_OF_LOGFACE_ROWS = 3;

// TIME constants
export const MICROSECONDS_IN_A_WEEK = 604800000;
export const GESTATION_PERIOD = 24192000000;

// Back arrow constant
export const BACKPAGE_ICON: IconProp = ['fas', 'arrow-left'];

// Risk cartegories in the logface component
export const RISK_LEVELS = ['red', 'high', 'low', 'no risk', 'all'];

// monthNames
export const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

// operational
export const EN_LANGUAGE_CODE = 'en' as const;
export const VI_LANGUAGE_CODE = 'vi' as const;

// export const
export const ALL_LANGUAGE_OPTIONS = {
    [EN_LANGUAGE_CODE]: 'English',
    [VI_LANGUAGE_CODE]: 'Vietnamese',
};
