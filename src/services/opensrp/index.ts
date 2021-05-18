import { OPENSRP_API_BASE_URL } from '../../configs/env';
import store from '../../store';
import { getAccessToken } from '../../store/selectors';
import { getFetchOptions, OpenSRPService as GenericOpenSRPService } from '@opensrp/server-service';
import { Dictionary } from '@onaio/utils';
import { refreshToken } from '@onaio/gatekeeper';
import { isTokenExpired } from '@onaio/session-reducer';
import { history } from '@onaio/connected-reducer-registry';
import { EXPRESS_TOKEN_REFRESH_URL } from '../../constants';
import { APP_LOGIN_URL } from '../../configs/settings';

/** OpenSRP service Generic class */
export class OpenSRPService<T extends Record<string, unknown> = Dictionary> extends GenericOpenSRPService<T> {
    /**
     *
     * @param {string} endpoint - the OpenSRP endpoint
     * @param {string} baseURL - base OpenSRP API URL
     * @param {Function} fetchOptions - function to return options to be passed to request
     */
    constructor(
        endpoint: string,
        baseURL: string = OPENSRP_API_BASE_URL,
        fetchOptions: typeof getFetchOptions = getFetchOptions,
    ) {
        super(handleSessionOrTokenExpiry, baseURL, endpoint, fetchOptions);
    }
}

/**
 * gets access token or redirects to login if session is expired
 *
 * @param langObject - look up of translations
 */
export const handleSessionOrTokenExpiry = async () => {
    if (isTokenExpired(store.getState())) {
        try {
            // refresh token
            return await refreshToken(`${EXPRESS_TOKEN_REFRESH_URL}`, store.dispatch, {});
        } catch (e) {
            history.push(`${APP_LOGIN_URL}`);
            throw new Error('Session expired');
        }
    } else {
        return getAccessToken(store.getState());
    }
};
