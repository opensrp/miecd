import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Route, Switch } from 'react-router-dom';
import { authenticateUser } from '@onaio/session-reducer';
import { SuccessfulLoginComponent, UnSuccessfulLogin } from '..';
import { EXPRESS_LOGIN_URL } from '../../../constants';
import * as utils from '../../../helpers/utils';
import { Provider } from 'react-redux';
import store from '../../../store';
import { mountWithTranslations } from 'helpers/testUtils';

jest.mock('../../../configs/env', () => ({
    ENABLE_OPENSRP_OAUTH: true,
    DOMAIN_NAME: 'http://localhost:3000',
    OPENSRP_OAUTH_SCOPES: ['read', 'profile'],
}));

const App = () => {
    return (
        <Switch>
            <Route exact={true} path="/callback" component={SuccessfulLoginComponent} />
            {/* tslint:disable-next-line: jsx-no-lambda */}
            <Route exact={true} path="/failedCallback" component={UnSuccessfulLogin} />
            {/* tslint:disable-next-line: jsx-no-lambda */}
            <Route path="/login" component={() => <div id="login" />} />
            {/* tslint:disable-next-line: jsx-no-lambda */}
            <Route path="/teams" component={() => <div id="teams" />} />
            {/* tslint:disable-next-line: jsx-no-lambda */}
            <Route path="/plans/update/:id" component={() => <div id="plans" />} />
            {/* tslint:disable-next-line: jsx-no-lambda */}
            <Route path="/" component={() => <div id="home" />} />
        </Switch>
    );
};
const realLocation = window.location;
describe('src/components/page/CustomCallback.SuccessfulLogin', () => {
    beforeAll(() => {
        store.dispatch(
            authenticateUser(
                true,
                {
                    email: 'bob@example.com',
                    name: 'Bobbie',
                    username: 'RobertBaratheon',
                },
                {
                    roles: ['ROLE_EDIT_KEYCLOAK_USERS'],
                    username: 'superset-user',
                    user_id: 'cab07278-c77b-4bc7-b154-bcbf01b7d35b',
                },
            ),
        );
    });
    afterEach(() => {
        window.location = realLocation;
        jest.resetAllMocks();
    });
    it('renders correctly', () => {
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <MemoryRouter initialEntries={[{ pathname: `/callback`, search: '', hash: '', state: {} }]}>
                    <App />
                </MemoryRouter>
            </Provider>,
        );
        // should redirect to home
        expect(wrapper.find('#home')).toHaveLength(1);
    });

    it('redirects to home if next page is /', () => {
        const mockutilsuccess = jest.spyOn(utils, 'toastToSuccess');
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <MemoryRouter initialEntries={[{ pathname: `/callback`, search: '?next=/', hash: '', state: {} }]}>
                    <App />
                </MemoryRouter>
            </Provider>,
        );
        // should redirect to home
        expect(wrapper.find('#home')).toHaveLength(1);
        expect(mockutilsuccess).toHaveBeenCalledWith('Welcome back, RobertBaratheon');
    });

    it('redirects if next page is provided; nominal', () => {
        const wrapper = mountWithTranslations(
            <MemoryRouter initialEntries={[{ pathname: `/callback`, search: '?next=%2Fteams', hash: '', state: {} }]}>
                <App />
            </MemoryRouter>,
        );
        // should redirect to teams
        expect(wrapper.find('#teams')).toHaveLength(1);
        expect(wrapper.find('#home')).toHaveLength(0);
    });

    it('redirects if next page is provided, tougher case', () => {
        const wrapper = mountWithTranslations(
            <MemoryRouter
                initialEntries={[
                    {
                        hash: '',
                        pathname: `/callback`,
                        search: '?next=%2Fplans%2Fupdate%2Fbc78591f-df79-45a7-99e4-c1fbeda629e2',
                        state: {},
                    },
                ]}
            >
                <App />
            </MemoryRouter>,
        );
        // should redirect to plans
        expect(wrapper.find('#plans')).toHaveLength(1);
    });
    it('redirect to login if redirect path doesnt exist', () => {
        // const hrefMock = jest.fn();
        // applyHrefMock(hrefMock);
        const wrapper = mountWithTranslations(
            <MemoryRouter initialEntries={[{ pathname: `/callback`, search: '?next=%2F', hash: '', state: {} }]}>
                <App />
            </MemoryRouter>,
        );
        expect(wrapper.find('#home')).toHaveLength(1);
    });
});

describe('src/components/page/CustomCallback.UnsuccessfulLogin', () => {
    const ActualWindowLocation = window.location;
    afterAll(() => {
        window.location = ActualWindowLocation;
    });
    delete window.location;
    const applyHrefMock = (mock: jest.Mock) => {
        (window.location as unknown) = {
            set href(url: string) {
                mock(url);
            },
        };
    };

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('renders unsuccessful login correctly', () => {
        const hrefMock = jest.fn();
        applyHrefMock(hrefMock);
        mountWithTranslations(
            <MemoryRouter initialEntries={[{ pathname: `/failedCallback`, search: '', hash: '', state: {} }]}>
                <App />
            </MemoryRouter>,
        );
        expect(hrefMock).toBeCalledWith(EXPRESS_LOGIN_URL);
    });

    it('Appends correct path when searchParams is given', () => {
        const hrefMock = jest.fn();
        applyHrefMock(hrefMock);
        mountWithTranslations(
            <MemoryRouter
                initialEntries={[{ pathname: `/failedCallback`, search: '?next=%2Fteams', hash: '', state: {} }]}
            >
                <App />
            </MemoryRouter>,
        );
        expect(hrefMock).toBeCalledWith(`${EXPRESS_LOGIN_URL}?next=%2Fteams`);
    });

    it('Redirects only to login if searchParam url is not allowable', () => {
        const hrefMock = jest.fn();
        applyHrefMock(hrefMock);
        mountWithTranslations(
            <MemoryRouter
                initialEntries={[
                    {
                        hash: '',
                        pathname: `/failedCallback`,
                        search: '?next=%2Flogout',
                        state: {},
                    },
                ]}
            >
                <App />
            </MemoryRouter>,
        );
        expect(hrefMock).toBeCalledWith(EXPRESS_LOGIN_URL);
    });
});
