import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { mountWithTranslations } from 'helpers/testUtils';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import HeaderComponent from '../Header';

const history = createBrowserHistory();

describe('components/page/Header', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // eslint-disable-next-line jest/expect-expect
    it('renders without crashing', () => {
        const props = {
            authenticated: false,
            user: {
                email: '',
                name: '',
                username: '',
            },
        };
        shallow(
            <Router history={history}>
                <HeaderComponent {...props} />
            </Router>,
        );
    });

    it('renders header correctly', () => {
        // can check for certain crucial parts.
        const props = {
            authenticated: false,
            user: {
                email: '',
                name: '',
                username: '',
            },
        };
        const wrapper = mountWithTranslations(
            <Router history={history}>
                <HeaderComponent {...props} />
            </Router>,
        );

        // the login/logout
        const accntMgmtWrapper = wrapper.find('NavLink');
        expect(toJson(accntMgmtWrapper)).toMatchSnapshot('Login');
        expect(accntMgmtWrapper.text()).toEqual('Login');

        // has a language switcher component
        expect(wrapper.find('LanguageSwitcher')).toHaveLength(1);

        wrapper.unmount();
    });

    it('renders header correctly when authenticated', () => {
        const props = {
            authenticated: true,
            user: {
                email: 'bob@example.com',
                name: 'Bobbie',
                username: 'RobertBaratheon',
            },
        };
        const wrapper = mountWithTranslations(
            <Router history={history}>
                <HeaderComponent {...props} />
            </Router>,
        );

        // the login/logout
        const accntMgmtWrapper = wrapper.find('NavLink');
        expect(toJson(accntMgmtWrapper)).toMatchSnapshot('Sign Out');
        expect(accntMgmtWrapper.text()).toEqual('Sign Out');

        wrapper.unmount();
    });
});
