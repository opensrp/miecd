import { IconProp } from '@fortawesome/fontawesome-svg-core';

// internal urls
export const CHILD_PATIENT_DETAIL = 'child_patient_detail';
export type CHILD_PATIENT_DETAIL = typeof CHILD_PATIENT_DETAIL;
export const PATIENT_DETAIL = 'patient_detail';
export type PATIENT_DETAIL = typeof PATIENT_DETAIL;
export const NBC_AND_PNC_URL = '/nbc_and_pnc';
export type NBC_AND_PNC_URL = typeof NBC_AND_PNC_URL;
export const HIERARCHICAL_DATA_URL = '/hierarchicaldata';
export type HIERARCHICAL_DATA_URL = typeof HIERARCHICAL_DATA_URL;
export const PREGNANCY_URL = '/pregnancy';
export type PREGNANCY_URL = typeof PREGNANCY_URL;
export const LOGIN_URL = '/login';
export type LOGIN_URL = typeof LOGIN_URL;
export const LOGOUT_URL = '/logout';
export type LOGOUT_URL = typeof LOGOUT_URL;
export const HOME_URL = '/';
export type HOME_URL = typeof HOME_URL;
export const PREGNANCY_COMPARTMENTS_URL = '/pregnancy_compartments';
export type PREGNANCY_COMPARTMENTS_URL = typeof PREGNANCY_COMPARTMENTS_URL;
export const NBC_AND_PNC_COMPARTMENTS_URL = '/nbc_and_pnc_compartments';
export type NBC_AND_PNC_COMPARTMENTS_URL = typeof NBC_AND_PNC_COMPARTMENTS_URL;
export const CLIENT_URL = '/clients';
export type CLIENT_URL = typeof CLIENT_URL;
export const LOGFACE_URL = '/log-face';
export type LOGFACE_URL = typeof LOGFACE_URL;
export const PREGNANCY_LOGFACE_URL = '/pregnancy_log_face';
export type PREGNANCY_LOGFACE_URL = typeof PREGNANCY_LOGFACE_URL;
export const NBC_AND_PNC_LOGFACE_URL = '/nbc_and_pnc_logface_url';
export type NBC_AND_PNC_LOGFACE_URL = typeof NBC_AND_PNC_LOGFACE_URL;
export const NUTRITION_LOGFACE_URL = '/nutrition_logface_url';
export type NUTRITION_LOGFACE_URL = typeof NUTRITION_LOGFACE_URL;
export const NUTRITION_COMPARTMENTS_URL = '/nutrition_commpartments_url';
export type NUTRITION_COMPARTMENTS_URL = typeof NUTRITION_COMPARTMENTS_URL;
export const PREGNANCY_ANALYSIS_URL = '/pregnancy_analysis';
export type PREGNANCY_ANALYSIS_URL = typeof PREGNANCY_ANALYSIS_URL;
export const NBC_AND_PNC_ANALYSIS_URL = '/nbc_and_pnc_analysis';
export type NBC_AND_PNC_ANALYSIS_URL = typeof NBC_AND_PNC_ANALYSIS_URL;
export const NUTRITION_ANALYSIS_URL = '/nutrition_analysis';
export type NUTRITION_ANALYSIS_URL = typeof NUTRITION_ANALYSIS_URL;
export const NUTRITION_URL = '/nutrition';
export type NUTRITION_URL = typeof NUTRITION_URL;
export const HOUSEHOLD_URL = '/404';
export type HOUSEHOLD_URL = typeof HOUSEHOLD_URL;
export const ANC_URL = '/404';
export type ANC_URL = typeof ANC_URL;
export const CHILD_URL = '/404';
export type CHILD_URL = typeof CHILD_URL;
export const USER_URL = '/404';
export type USER_URL = typeof USER_URL;
export const ROLE_URL = '/404';
export type ROLE_URL = typeof ROLE_URL;
export const TEAM_URL = '/404';
export type TEAM_URL = typeof TEAM_URL;
export const LOCATIONS_URL = '/404';
export type LOCATIONS_URL = typeof LOCATIONS_URL;
export const REPORTS_URL = '/';
export type REPORTS_URL = typeof REPORTS_URL;
export const PATIENT_DETAIL_URL = `/${PATIENT_DETAIL}/:patient_id`;
export type PATIENT_DETAIL_URL = typeof PATIENT_DETAIL_URL;
export const CHILD_PATIENT_DETAIL_URL = `/${CHILD_PATIENT_DETAIL}/:patient_id`;
export type CHILD_PATIENT_DETAIL_URL = typeof CHILD_PATIENT_DETAIL_URL;

export const VIETNAM_COUNTRY_LOCATION_ID = 'd1865325-11e6-4e39-817b-e676c1affecf';
export type VIETNAM_COUNTRY_LOCATION_ID = typeof VIETNAM_COUNTRY_LOCATION_ID;

// string literals
export const HIGH = 'high';
export type HIGH = typeof HIGH;
export const LOW = 'low';
export type LOW = typeof LOW;
export const RED = 'red';
export type RED = typeof RED;
export const NO = 'no';
export type NO = typeof NO;
export const OVERWEIGHT = 'overweight';
export type OVERWEIGHT = typeof OVERWEIGHT;
export const STUNTED = 'stunted';
export type STUNTED = typeof STUNTED;
export const SEVERE_WASTING = 'severe wasting';
export type SEVERE_WASTING = typeof SEVERE_WASTING;
export const INAPPROPRIATELY_FED = 'inappropriately fed';
export type INAPPROPRIATELY_FED = typeof INAPPROPRIATELY_FED;
export const NOT_SET_LOWERCASE = 'not set';
export type NOT_SET_LOWERCASE = typeof NOT_SET_LOWERCASE;
export const PREGNANCY = 'Pregnancy';
export type PREGNANCY = typeof PREGNANCY;
export const NBC_AND_PNC = 'NBC & PNC';
export type NBC_AND_PNC = typeof NBC_AND_PNC;
export const NBC_AND_PNC_CHILD = 'NBC & PNC_CHILD';
export type NBC_AND_PNC_CHILD = typeof NBC_AND_PNC_CHILD;
export const NBC_AND_PNC_WOMAN = 'NBC & PNC_WOMAN';
export type NBC_AND_PNC_WOMAN = typeof NBC_AND_PNC_WOMAN;
export const NUTRITION = 'Nutrition';
export type NUTRITION = typeof NUTRITION;

export const ALL = 'all';
export type ALL = typeof ALL;
export const UP = 'up';
export type UP = typeof UP;
export const NO_RISK_LOWERCASE = 'no risk';
export type NO_RISK_LOWERCASE = typeof NO_RISK_LOWERCASE;
export const NO_RISK = 'No Risk';
export type NO_RISK = typeof NO_RISK;
export const VIETNAM = 'Vietnam';
export type VIETNAM = typeof VIETNAM;
export const COUNTRY = 'Country';
export type COUNTRY = typeof COUNTRY;
export const PROVINCE = 'Province';
export type PROVINCE = typeof PROVINCE;
export const COMMUNE = 'Commune';
export const DISTRICT = 'District';
export type DISTRICT = typeof DISTRICT;
export type COMMUNE = typeof COMMUNE;
export const VILLAGE = 'Village';
export type VILLAGE = typeof VILLAGE;
export const RED_ALERT_CLASSNAME = 'red-alert';
export type RED_ALERT_CLASSNAME = typeof RED_ALERT_CLASSNAME;
export const NEWBORN_REPORT = 'Newborn Report';
export type NEWBORN_REPORT = typeof NEWBORN_REPORT;
export const EC_WOMAN = 'ec_woman';
export type EC_WOMAN = typeof EC_WOMAN;
export const EC_FAMILY_MEMBER = 'ec_family_member';
export type EC_FAMILY_MEMBER = typeof EC_FAMILY_MEMBER;
export const EC_CHILD = 'ec_child';
export type EC_CHILD = typeof EC_CHILD;

// // sms events fields
export const NUTRITION_STATUS = 'nutrition_status';
export type NUTRITION_STATUS = typeof NUTRITION_STATUS;
export const GROWTH_STATUS = 'growth_status';
export type GROWTH_STATUS = typeof GROWTH_STATUS;
export const FEEDING_CATEGORY = 'feeding_category';
export type FEEDING_CATEGORY = typeof FEEDING_CATEGORY;
export const EVENT_ID = 'event_id';
export type EVENT_ID = typeof EVENT_ID;
export const LOGFACE_RISK = 'logface_risk';
export type LOGFACE_RISK = typeof LOGFACE_RISK;
export const HEIGHT = 'height';
export type HEIGHT = typeof HEIGHT;
export const WEIGHT = 'weight';
export type WEIGHT = typeof WEIGHT;
export const RISK = 'risk';
export type RISK = typeof RISK;
export const PREGNANCY_REGISTRATION = 'Pregnancy Registration';
export type PREGNANCY_REGISTRATION = typeof PREGNANCY_REGISTRATION;
export const ANC_REPORT = 'ANC Report';
export type ANC_REPORT = typeof ANC_REPORT;
export const BIRTH_REPORT = 'Birth Report';
export type BIRTH_REPORT = typeof BIRTH_REPORT;
export const NUTRITION_REGISTRATION = 'Nutrition Registration';
export type NUTRITION_REGISTRATION = typeof NUTRITION_REGISTRATION;
export const NUTRITION_REPORT = 'Nutrition Report';
export type NUTRITION_REPORT = typeof NUTRITION_REPORT;

export const DEFAULT_NUMBER_OF_LOGFACE_ROWS = 3;
export type DEFAULT_NUMBER_OF_LOGFACE_ROWS = typeof DEFAULT_NUMBER_OF_LOGFACE_ROWS;

// TIME constants
export const MICROSECONDS_IN_A_WEEK = 604800000;
export type MICROSECONDS_IN_A_WEEK = typeof MICROSECONDS_IN_A_WEEK;
export const GESTATION_PERIOD = 24192000000;
export type GESTATION_PERIOD = typeof GESTATION_PERIOD;

// Back arrow constant
export const BACKPAGE_ICON: IconProp = ['fas', 'arrow-left'];

// Risk cartegories in the logface component
export const RISK_LEVELS = ['red', 'high', 'low', 'no risk', 'all'];
export type RISK_LEVELS = typeof RISK_LEVELS;

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
