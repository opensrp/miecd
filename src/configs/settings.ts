/** This is the main configuration module */
import { Providers } from '@onaio/gatekeeper';
import { PREGNANCY_MODULE, NUTRITION_MODULE } from '../constants';
import { TFunction } from 'react-i18next';
import { GREEN, RED, YELLOW } from './colors';
import {
    DOMAIN_NAME,
    ENABLE_ONADATA_OAUTH,
    ENABLE_OPENSRP_OAUTH,
    ONADATA_ACCESS_TOKEN_URL,
    ONADATA_AUTHORIZATION_URL,
    ONADATA_CLIENT_ID,
    ONADATA_OAUTH_STATE,
    ONADATA_USER_URL,
    OPENSRP_ACCESS_TOKEN_URL,
    OPENSRP_AUTHORIZATION_URL,
    OPENSRP_CLIENT_ID,
    OPENSRP_OAUTH_STATE,
    OPENSRP_USER_URL,
} from './env';

/** Authentication Configs */
export const providers: Providers = {
    ...(ENABLE_OPENSRP_OAUTH && {
        OpenSRP: {
            accessTokenUri: OPENSRP_ACCESS_TOKEN_URL,
            authorizationUri: OPENSRP_AUTHORIZATION_URL,
            clientId: OPENSRP_CLIENT_ID,
            redirectUri: `${DOMAIN_NAME}/oauth/callback/OpenSRP/`,
            scopes: ['read', 'write'],
            state: OPENSRP_OAUTH_STATE,
            userUri: OPENSRP_USER_URL,
        },
    }),
    ...(ENABLE_ONADATA_OAUTH && {
        Ona: {
            accessTokenUri: ONADATA_ACCESS_TOKEN_URL,
            authorizationUri: ONADATA_AUTHORIZATION_URL,
            clientId: ONADATA_CLIENT_ID,
            redirectUri: `${DOMAIN_NAME}/oauth/callback/Ona/`,
            scopes: ['read', 'write'],
            state: ONADATA_OAUTH_STATE,
            userUri: ONADATA_USER_URL,
        },
    }),
};

export const SmsTypes = [
    'Response Report',
    'Red Alert Report',
    'Social Determinants',
    'ANC Visit',
    'Delivery Planning',
    'Pregnancy Detection',
    'Pregnancy Identification',
    'Pregnancy registration',
    'ANC Report',
    'Home Visit Report',
    'Birth Report',
    'Death Report',
    'Postnatal and Newborn Care',
    'Nutrition Registration',
    'Nutrition Report',
    'Monthly Nutrition Report',
    'Departure Code',
    'Refusal Code',
    'Account Check',
] as const;
export const URLS_TO_HIDE_HEADER: string[] = ['login', 'home'];

/** constant react-hot-toast config */
export const toastConfig = {
    style: {
        minWidth: '250px',
    },
    duration: 2000,
};

// Risk categories in the logface component
export const riskCategories = (t: TFunction) => ({
    [PREGNANCY_MODULE]: [
        { label: t('Red alert'), value: 'red_alert', color: RED },
        { label: t('Risk'), value: 'risk', color: YELLOW },
        { label: t('No risk'), value: 'no_risk', color: GREEN },
    ],
    [NUTRITION_MODULE]: [
        { label: t('Stunting'), value: 'stunting' },
        { label: t('Wasting'), value: 'wasting' },
        { label: t('Overweight'), value: 'overweight' },
        { label: t('Inappropriate Feeding'), value: 'inappropriate_feeding' },
    ],
});
