import { OPENSRP_API_BASE_URL } from '../../configs/env';
import store from '../../store';
import { getAccessToken } from '../../store/selectors';
import { getFetchOptions, OpenSRPService as GenericOpenSRPService } from '@opensrp/server-service';
import { Dictionary } from '@onaio/utils';

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
        const accessToken = getAccessToken(store.getState()) ?? '';
        super(accessToken, baseURL, endpoint, fetchOptions);
    }
}
