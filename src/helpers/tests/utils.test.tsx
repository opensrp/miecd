import { Dictionary, getNumberSuffix, oAuthUserInfoGetter } from '../utils';
import { OpenSRPAPIResponse } from './fixtures';
import * as gatekeeper from '@onaio/gatekeeper';

jest.mock('@onaio/gatekeeper', () => {
    const actual = jest.requireActual('@onaio/gatekeeper');
    return {
        ...actual,
        getOpenSRPUserInfo: () => 'Called by Opensrp',
        getOnadataUserInfo: () => 'Called by Onaio',
    };
});

describe('src/helpers', () => {
    it('oauth User Info getter', () => {
        let response = oAuthUserInfoGetter(OpenSRPAPIResponse);
        expect(response).toEqual('Called by Opensrp');

        const onaApiResponse = {
            ...OpenSRPAPIResponse,
            oAuth2Data: {
                state: 'onadata',
            },
        };

        response = oAuthUserInfoGetter(onaApiResponse);
        expect(response).toEqual('Called by Onaio');
    });

    it('get Number Suffix', () => {
        let response = getNumberSuffix(0);
        expect(response).toEqual('th');

        response = getNumberSuffix(1);
        expect(response).toEqual('st');

        response = getNumberSuffix(2);
        expect(response).toEqual('nd');

        response = getNumberSuffix(3);
        expect(response).toEqual('rd');

        response = getNumberSuffix(45);
        expect(response).toEqual('th');
    });
});
