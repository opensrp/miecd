import { authenticateUser } from '@onaio/session-reducer';
import { mountWithTranslations } from 'helpers/testUtils';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import ConnectedHeader from '..';
import store from '../../../store';

jest.mock('../../../configs/env');

describe('components/ConnectedHeader', () => {
    it('renders the ConnectedHeader component', () => {
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <MemoryRouter>
                    <ConnectedHeader />
                </MemoryRouter>
            </Provider>,
        );
        expect(wrapper.find('Navbar').props()).toMatchSnapshot();
        wrapper.unmount();
    });

    it('renders the ConnectedHeader when logged in', () => {
        store.dispatch(
            authenticateUser(true, {
                email: 'bob@example.com',
                name: 'Bobbie',
                username: 'RobertBaratheon',
            }),
        );
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <MemoryRouter>
                    <ConnectedHeader />
                </MemoryRouter>
            </Provider>,
        );
        expect(wrapper.find('Navbar').props()).toMatchSnapshot();
        wrapper.unmount();
    });
});
