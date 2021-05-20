/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleSessionOrTokenExpiry, OpenSRPService } from '..';
import MockDate from 'mockdate';
import { updateExtraData } from '@onaio/session-reducer';
import * as registry from '@onaio/connected-reducer-registry';
import store from '../../../store';
import { userAuthData, refreshTokenResponse } from './fixtures/session';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('jest-fetch-mock');

jest.mock('@opensrp/server-service', () => ({
    __esModule: true,
    ...Object.assign({}, jest.requireActual('@opensrp/server-service')),
}));

jest.mock('../../../configs/env');

describe('dataLoaders/OpenSRPService', () => {
    const baseURL = 'https://test.smartregister.org/opensrp/rest/';
    beforeEach(() => {
        jest.resetAllMocks();
        fetch.resetMocks();
        jest.restoreAllMocks();
    });

    it('OpenSRPService generic class constructor works', async () => {
        const planService = new OpenSRPService('organization', baseURL);
        expect(planService.baseURL).toEqual(baseURL);
        expect(planService.endpoint).toEqual('organization');
        expect(planService.generalURL).toEqual(`${baseURL}organization`);
    });

    it('works with default base url', async () => {
        const planService = new OpenSRPService('organization');
        expect(planService.baseURL).toEqual('https://test.smartregister.org/opensrp/rest/');
        expect(planService.endpoint).toEqual('organization');
        expect(planService.generalURL).toEqual('https://test.smartregister.org/opensrp/rest/organization');
    });
    it('handleSessionOrTokenExpiry works correctly', async () => {
        MockDate.set('1-1-2021 19:31');

        const pushMock = jest.fn();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (registry as any).history = {
            push: pushMock,
        };

        // no session found
        await handleSessionOrTokenExpiry().catch((e) => {
            expect(e.message).toEqual('Session expired');
        });

        // acess token availble and not expired
        store.dispatch(updateExtraData(userAuthData));
        const token = await handleSessionOrTokenExpiry();
        expect(token).toEqual(userAuthData.oAuth2Data.access_token);

        // refresh token when expired
        fetch.once(JSON.stringify(refreshTokenResponse));
        const authDataCopy = {
            ...userAuthData,
            oAuth2Data: {
                ...userAuthData.oAuth2Data,
                token_expires_at: '2019-01-02T14:11:20.102Z', // set token to expired
            },
        };
        store.dispatch(updateExtraData(authDataCopy));
        const newToken = await handleSessionOrTokenExpiry();
        expect(newToken).toEqual('refreshed-i-feel-new');

        // refresh token throws an error
        const errorMessage = 'API is down';
        fetch.mockRejectOnce(() => Promise.reject(errorMessage));
        store.dispatch(updateExtraData(authDataCopy));
        await handleSessionOrTokenExpiry().catch((e: Error) => {
            expect(e.message).toEqual('Session expired');
        });

        //check redirection action
        expect(pushMock).toHaveBeenCalledWith('/login');
        MockDate.reset();
    });
});
