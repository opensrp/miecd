import './dispatchConfig';
import { getAllConfigs } from '@opensrp/pkg-config';
import i18n from '../../mls';
import { APP_LOGIN_URL, OPENSRP_REST_API_BASE_URL } from 'configs/settings';

jest.mock('./configs/env');

it('can dispatch configs', () => {
    expect(getAllConfigs()).toMatchObject({
        appLoginURL: APP_LOGIN_URL,
        opensrpBaseURL: OPENSRP_REST_API_BASE_URL,
        i18n,
    });
});
