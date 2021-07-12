import { ConfigState, setAllConfigs, getAllConfigs } from '@opensrp/pkg-config';
import { OPENSRP_REST_API_BASE_URL } from 'configs/settings';
import { BACKEND_ACTIVE } from '../configs/env';
import { BACKEND_LOGIN_URL, REACT_LOGIN_URL } from '../constants';
import i18n from '../mls';

export const APP_LOGIN_URL = BACKEND_ACTIVE ? BACKEND_LOGIN_URL : REACT_LOGIN_URL;

const defaultvalues = getAllConfigs();

const configObject: ConfigState = {
    ...defaultvalues,
    appLoginURL: APP_LOGIN_URL,
    opensrpBaseURL: OPENSRP_REST_API_BASE_URL,
    i18n,
};

setAllConfigs(configObject);
