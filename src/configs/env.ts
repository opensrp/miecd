/** This module handles settings taken from environment variables */

/** The website name */
export const WEBSITE_NAME = process.env.REACT_APP_WEBSITE_NAME || 'unicef';

/** The domain name */
export const DOMAIN_NAME = process.env.REACT_APP_DOMAIN_NAME || 'http://localhost:3000';

export const ENABLE_PREGNANCY_MODULE = process.env.REACT_APP_ENABLE_PREGNANCY_MODULE === 'true' || false;

export const SUPERSET_FETCH_TIMEOUT_INTERVAL = Number(process.env.REACT_APP_SUPERSET_FETCH_TIMEOUT_INTERVAL) || 15000;

export const ENABLE_NUTRITION_MODULE = process.env.REACT_APP_ENABLE_NUTRITION_MODULE === 'true' || false;

export const ENABLE_NEWBORN_AND_POSTNATAL_MODULE =
    process.env.REACT_APP_ENABLE_NEWBORN_AND_POSTNATAL_MODULE === 'true' || false;

/** Do you want to enable the Client Page of Client Records Module? */
export const ENABLE_CLIENT_PAGE = process.env.REACT_APP_ENABLE_CLIENT_PAGE === 'true' || false;

/** Do you want to enable the Household Page of Client Records Module? */
export const ENABLE_HOUSEHOLD_PAGE = process.env.REACT_APP_ENABLE_HOUSEHOLD_PAGE === 'true' || false;

/** Do you want to enable the ANC Page of Client Records Module? */
export const ENABLE_ANC_PAGE = process.env.REACT_APP_ENABLE_ANC_PAGE === 'true' || false;

/** Do you want to enable the Child Page of Client Records Module? */
export const ENABLE_CHILD_PAGE = process.env.REACT_APP_ENABLE_CHILD_PAGE === 'true' || false;

/** Do you want to enable the Reports Module? */
export const ENABLE_REPORT_MODULE = process.env.REACT_APP_ENABLE_REPORT_MODULE === 'true' || false;

/** Do you want to enable the nbc and pnc Module? */
export const ENABLE_NBC_AND_PNC_MODULE = process.env.REACT_APP_ENABLE_NBC_AND_PNC_MODULE === 'true' || false;

/** Do you want to enable the  home navigation? */
export const ENABLE_HOME_NAVIGATION = process.env.REACT_APP_ENABLE_HOME_NAVIGATION === 'true' || false;

/** Do you want to enable User page of Admin Module? */
export const ENABLE_USER_PAGE = process.env.REACT_APP_ENABLE_USER_PAGE === 'true' || false;

/** Do you want to enable Role page of Admin Module? */
export const ENABLE_ROLE_PAGE = process.env.REACT_APP_ENABLE_ROLE_PAGE === 'true' || false;

/** Do you want to enable Team page of Admin Module? */
export const ENABLE_TEAM_PAGE = process.env.REACT_APP_ENABLE_TEAM_PAGE === 'true' || false;

/** Do you want to enable Location page of Admin Module? */
export const ENABLE_LOCATION_PAGE = process.env.REACT_APP_ENABLE_LOCATION_PAGE === 'true' || false;

/** Do you want to enable the clients page? */
export const ENABLE_CLIENTS = process.env.REACT_APP_ENABLE_CLIENTS === 'true';

/** Do you want to disable login protection? */
export const DISABLE_LOGIN_PROTECTION = process.env.REACT_APP_DISABLE_LOGIN_PROTECTION === 'true';

/** The Superset API base */
export const SUPERSET_API_BASE = process.env.REACT_APP_SUPERSET_API_BASE || 'http://localhost';

/** The Superset API endpoint */
export const SUPERSET_API_ENDPOINT = process.env.REACT_APP_SUPERSET_API_ENDPOINT || 'slice';

/** OpenSRP oAuth2 settings */
export const ENABLE_OPENSRP_OAUTH = process.env.REACT_APP_ENABLE_OPENSRP_OAUTH === 'true';
export const OPENSRP_CLIENT_ID = process.env.REACT_APP_OPENSRP_CLIENT_ID || '';

// notice the ending is NOT / here
export const OPENSRP_ACCESS_TOKEN_URL =
    process.env.REACT_APP_OPENSRP_ACCESS_TOKEN_URL || 'https://reveal-stage.smartregister.org/opensrp/oauth/token';

// notice the ending is NOT / here
export const OPENSRP_AUTHORIZATION_URL =
    process.env.REACT_APP_OPENSRP_AUTHORIZATION_URL || 'https://reveal-stage.smartregister.org/opensrp/oauth/authorize';

export const OPENSRP_USER_URL =
    process.env.REACT_APP_OPENSRP_USER_URL || 'https://reveal-stage.smartregister.org/opensrp/user-details';

export const OPENSRP_LOGOUT_URL =
    process.env.REACT_APP_OPENSRP_LOGOUT_URL || 'https://opensrp-miecd-stage.smartregister.org/opensrp/logout.do';

export const OPENSRP_OAUTH_STATE = process.env.REACT_APP_OPENSRP_OAUTH_STATE || 'opensrp';

/** Onadata oAuth2 settings */
export const ENABLE_ONADATA_OAUTH = process.env.REACT_APP_ENABLE_ONADATA_OAUTH === 'true';
export const ONADATA_CLIENT_ID = process.env.REACT_APP_ONADATA_CLIENT_ID || '';

// notice the ending / here
export const ONADATA_ACCESS_TOKEN_URL =
    process.env.REACT_APP_ONADATA_ACCESS_TOKEN_URL || 'https://stage-api.ona.io/o/token/';

// notice the ending / here
export const ONADATA_AUTHORIZATION_URL =
    process.env.REACT_APP_ONADATA_AUTHORIZATION_URL || 'https://stage-api.ona.io/o/authorize/';

export const ONADATA_USER_URL = process.env.REACT_APP_ONADATA_USER_URL || 'https://stage-api.ona.io/api/v1/user.json';

export const ONADATA_OAUTH_STATE = process.env.REACT_APP_ONADATA_OAUTH_STATE || 'onadata';

export const GISIDA_ONADATA_API_TOKEN = process.env.REACT_APP_GISIDA_ONADATA_API_TOKEN || '';

// notice the trailing /
export const OPENSRP_API_BASE_URL =
    process.env.REACT_APP_OPENSRP_API_BASE_URL || 'https://reveal-stage.smartregister.org/opensrp/rest/';

/** the clients endpoint NOTE: does not end with / */
export const OPENSRP_CLIENT_ENDPOINT = process.env.REACT_APP_OPENSRP_CLIENT_ENDPOINT || 'client/search';

export const GET_FORM_DATA_ROW_LIMIT = Number(process.env.REACT_APP_GET_FORM_DATA_ROW_LIMIT) || 2000;

// slice IDs
export const PREGNANCY_LOGFACE_SLICE = process.env.REACT_APP_LOGFACE_PREGNANCY_SLICE || '0';

export const NBC_AND_PNC_LOGFACE_SLICE = process.env.REACT_APP_NBC_AND_PNC_LOGFACE_SLICE || '0';

export const NUTRITION_LOGFACE_SLICE = process.env.REACT_APP_NUTRITION_LOGFACE_SLICE || '0';

export const PROVINCE_SLICE = process.env.REACT_APP_PROVINCE_SLICE || '0';

export const DISTRICT_SLICE = process.env.REACT_APP_DISTRICT_SLICE || '0';

export const COMMUNE_SLICE = process.env.REACT_APP_COMMUNE_SLICE || '0';

export const VILLAGE_SLICE = process.env.REACT_APP_VILLAGE_SLICE || '0';

export const LOCATION_SLICES = [PROVINCE_SLICE, DISTRICT_SLICE, COMMUNE_SLICE, VILLAGE_SLICE];

export const SUPERSET_SMS_DATA_SLICE = process.env.REACT_APP_SUPERSET_SMS_DATA_SLICE || '0';

export const USER_LOCATION_DATA_SLICE = process.env.REACT_APP_USER_LOCATION_DATA_SLICE || '0';

// compartment slices
export const COMPARTMENTS_PREGNANCY_SLICE = process.env.REACT_APP_COMPARTMENTS_PREGNANCY_SLICE || '0';
export const COMPARTMENTS_NBC_AND_PNC_SLICE = process.env.REACT_APP_COMPARTMENTS_NBC_AND_PNC_SLICE || '0';
export const COMPARTMENTS_NUTRITION_SLICE = process.env.REACT_APP_COMPARTMENTS_NUTRITION_SLICE || '0';

export const BACKEND_ACTIVE = process.env.REACT_APP_BACKEND_ACTIVE === 'true';

export const EXPRESS_OAUTH_LOGOUT_URL =
    process.env.REACT_APP_EXPRESS_OAUTH_LOGOUT_URL || 'http://localhost:3000/logout';

export const KEYCLOAK_LOGOUT_URL =
    process.env.REACT_APP_KEYCLOAK_LOGOUT_URL ||
    'https://keycloak-stage.smartregister.org/auth/realms/opensrp-web-stage/protocol/openid-connect/logout';

/** Express server settings */
export const EXPRESS_OAUTH_GET_STATE_URL =
    process.env.REACT_APP_EXPRESS_OAUTH_GET_STATE_URL || 'http://localhost:3000/oauth/state';

export const CHILD_CHART_SLICE = process.env.REACT_APP_CHILD_CHART_SLICE || '0';

export const MOTHER_CHART_SLICE = process.env.REACT_APP_MOTHER_CHART_SLICE || '0';

export const SUPERSET_PREGNANCY_ANALYSIS_DASHBOARD = process.env.REACT_APP_SUPERSET_PREGNANCY_ANALYSIS_DASHBOARD || '0';

export const SUPERSET_NBC_AND_PNC_ANALYSIS_DASHBOARD =
    process.env.REACT_APP_SUPERSET_NBC_AND_PNC_ANALYSIS_DASHBOARD || '0';

export const SUPERSET_NUTRITION_ANALYSIS_DASHBOARD = process.env.REACT_APP_SUPERSET_NUTRITION_ANALYSIS_DASHBOARD || '0';
