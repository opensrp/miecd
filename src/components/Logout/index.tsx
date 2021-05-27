import { logout, Payload } from '@opensrp/server-logout';
import React from 'react';
import {
    DOMAIN_NAME,
    KEYCLOAK_LOGOUT_URL,
    OPENSRP_LOGOUT_URL,
    EXPRESS_OAUTH_LOGOUT_URL,
    BACKEND_ACTIVE,
} from '../../configs/env';
import { getAccessToken } from '@onaio/session-reducer';
import { getFetchOptions } from '@opensrp/server-service';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toastToError } from 'helpers/utils';
import Ripple from 'components/page/Loading';
import store from 'store';

/** HOC function that calls function that logs out the user from both opensrp
 * and keycloak.
 *
 * @returns {Function} returns Ripple component
 */
export const CustomLogout: React.FC = (): JSX.Element => {
    const { t } = useTranslation();
    const payload = getFetchOptions(new AbortController().signal, getAccessToken(store.getState()) as string, 'GET');
    const redirectUri = BACKEND_ACTIVE ? EXPRESS_OAUTH_LOGOUT_URL : DOMAIN_NAME;
    const history = useHistory();
    logout(payload as Payload, OPENSRP_LOGOUT_URL, KEYCLOAK_LOGOUT_URL, redirectUri).catch(() => {
        toastToError(t('An error occurred'));
        history.push('/');
    });
    return <Ripple />;
};
