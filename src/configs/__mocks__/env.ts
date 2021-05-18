/** You can hard code variables that would have been
 * extracted from the environment here, and then mock
 * this file from your test file.
 * The goal is to have consistent test results
 */

/** Base Api url for opensrp */
export const OPENSRP_API_BASE_URL = 'https://test.smartregister.org/opensrp/rest/';
/** the clients endpoint NOTE: does not end with / */
export const OPENSRP_CLIENT_ENDPOINT = 'client/search';

/** The website name */
export const WEBSITE_NAME = 'OpenSRP';

export const ONADATA_CLIENT_ID = 'hunter2';

export const OPENSRP_CLIENT_ID = 'hunter1';

/** This module handles settings taken from environment variables */

/** The domain name */
export const DOMAIN_NAME = 'http://localhost:3000';

export const ENABLE_PREGNANCY_MODULE = true;

export const SUPERSET_FETCH_TIMEOUT_INTERVAL = 15000;

export const ENABLE_NUTRITION_MODULE = true;

export const ENABLE_NEWBORN_AND_POSTNATAL_MODULE = true;

/** Do you want to enable the Client Page of Client Records Module? */
export const ENABLE_CLIENT_PAGE = true;

/** Do you want to enable the Household Page of Client Records Module? */
export const ENABLE_HOUSEHOLD_PAGE = true;

/** Do you want to enable the ANC Page of Client Records Module? */
export const ENABLE_ANC_PAGE = true;

/** Do you want to enable the Child Page of Client Records Module? */
export const ENABLE_CHILD_PAGE = true;

/** Do you want to enable the Reports Module? */
export const ENABLE_REPORT_MODULE = true;

/** Do you want to enable the nbc and pnc Module? */
export const ENABLE_NBC_AND_PNC_MODULE = true;

/** Do you want to enable the  home navigation? */
export const ENABLE_HOME_NAVIGATION = true;

/** Do you want to enable User page of Admin Module? */
export const ENABLE_USER_PAGE = true;

/** Do you want to enable Role page of Admin Module? */
export const ENABLE_ROLE_PAGE = true;

/** Do you want to enable Team page of Admin Module? */
export const ENABLE_TEAM_PAGE = true;

/** Do you want to enable Location page of Admin Module? */
export const ENABLE_LOCATION_PAGE = true;

/** Do you want to enable the clients page? */
export const ENABLE_CLIENTS = true;

/** The Superset API base */
export const SUPERSET_API_BASE = 'http://superset';

/** The Superset API endpoint */
export const SUPERSET_API_ENDPOINT = 'slice';

/** OpenSRP oAuth2 settings */
export const ENABLE_OPENSRP_OAUTH = true;

// notice the ending is NOT / here
export const OPENSRP_ACCESS_TOKEN_URL = 'https://test-stage.smartregister.org/opensrp/oauth/token';

// notice the ending is NOT / here
export const OPENSRP_AUTHORIZATION_URL = 'https://test-stage.smartregister.org/opensrp/oauth/authorize';

export const OPENSRP_USER_URL = 'https://test-stage.smartregister.org/opensrp/user-details';

export const OPENSRP_LOGOUT_URL = 'https://opensrp-test-stage.smartregister.org/opensrp/logout.do';

export const OPENSRP_OAUTH_STATE = 'opensrp';

/** Onadata oAuth2 settings */
export const ENABLE_ONADATA_OAUTH = true;

// notice the ending / here
export const ONADATA_ACCESS_TOKEN_URL = 'https://stage-api.ona.io/o/token/';

// notice the ending / here
export const ONADATA_AUTHORIZATION_URL = 'https://stage-api.ona.io/o/authorize/';

export const ONADATA_USER_URL = 'https://stage-api.ona.io/api/v1/user.json';

export const ONADATA_OAUTH_STATE = 'onadata';

export const GISIDA_ONADATA_API_TOKEN = '';

export const GET_FORM_DATA_ROW_LIMIT = 2000;

// analysis page iframes
export const SUPERSET_PREGNANCY_ANALYSIS_ENDPOINT = 'https://discover.ona.io/superset/dashboard/53/?standalone=true';

export const NBC_AND_PNC_ANALYSIS_ENDPOINT = 'https://discover.ona.io/superset/dashboard/66/?standalone=true';

// csv export links
export const SUPERSET_PREGNANCY_DATA_EXPORT =
    'https://discover.ona.io/superset/explore_json/?form_data={"slice_id":2263}&csv=true';

// slice IDs
export const PROVINCE_SLICE = 'province';

export const DISTRICT_SLICE = 'district';

export const COMMUNE_SLICE = 'commune';

export const VILLAGE_SLICE = 'village';

export const LOCATION_SLICES = [PROVINCE_SLICE, DISTRICT_SLICE, COMMUNE_SLICE, VILLAGE_SLICE];

export const SUPERSET_SMS_DATA_SLICE = 'smsData';

export const USER_LOCATION_DATA_SLICE = 'userLocation';

export const BACKEND_ACTIVE = false;

export const EXPRESS_OAUTH_LOGOUT_URL = 'http://localhost:3000/logout';

export const KEYCLOAK_LOGOUT_URL =
    'https://keycloak-test-stage.smartregister.org/auth/realms/opensrp-web-stage/protocol/openid-connect/logout';

/** Express server settings */
export const EXPRESS_OAUTH_GET_STATE_URL = 'http://localhost:3000/oauth/state';
