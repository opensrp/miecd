import { shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import * as serverLogout from '@opensrp/server-logout';
import toJson from 'enzyme-to-json';
import React from 'react';
import { CustomLogout } from '..';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import * as utils from '../../../helpers/utils';
import { act } from 'react-dom/test-utils';
import store from '../../../store';
import { mountWithTranslations } from 'helpers/testUtils';

jest.mock('../../../configs/env');

describe('components/Logout', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    // eslint-disable-next-line jest/expect-expect
    it('renders without crashing', () => {
        shallow(<CustomLogout />);
    });

    it('renders logout component', () => {
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <MemoryRouter>
                    <CustomLogout />
                </MemoryRouter>
            </Provider>,
        );
        expect(toJson(wrapper.find('CustomLogout'))).toMatchSnapshot();
    });

    it('calls logout with correct params', async () => {
        const mock = jest.spyOn(serverLogout, 'logout');
        mock.mockRejectedValue('Logout failed');
        const payload = {
            headers: {
                accept: 'application/json',
                authorization: 'Bearer null',
                'content-type': 'application/json;charset=UTF-8',
            },
            method: 'GET',
        };
        const logoutURL = 'https://opensrp-test-stage.smartregister.org/opensrp/logout.do';
        const keycloakURL =
            'https://keycloak-test-stage.smartregister.org/auth/realms/opensrp-web-stage/protocol/openid-connect/logout';
        mountWithTranslations(
            <Provider store={store}>
                <MemoryRouter>
                    <CustomLogout />
                </MemoryRouter>
            </Provider>,
        );
        await flushPromises();
        expect(mock).toHaveBeenCalledWith(payload, logoutURL, keycloakURL, 'http://localhost:3000');
    });

    it('handles logout failure correctly', async () => {
        jest.spyOn(serverLogout, 'logout').mockImplementation(() => Promise.reject('error'));
        const mockNotificationError = jest.spyOn(utils, 'toastToError');
        mountWithTranslations(
            <Provider store={store}>
                <MemoryRouter>
                    <CustomLogout />
                </MemoryRouter>
            </Provider>,
        );
        await act(async () => {
            await flushPromises();
        });
        expect(mockNotificationError).toHaveBeenCalledWith('An error occurred');
    });
});
