import { authenticateUser } from '@onaio/session-reducer';
import {
    PREGNANCY_ANALYSIS_URL,
    NBC_AND_PNC_ANALYSIS_URL,
    NUTRITION_ANALYSIS_URL,
    URL_TEAMS,
    URL_TEAMS_ADD,
    URL_TEAMS_EDIT,
    URL_TEAM_ASSIGNMENT,
    URL_LOCATION_UNIT,
    URL_LOCATION_UNIT_ADD,
    URL_LOCATION_UNIT_GROUP,
    URL_LOCATION_UNIT_GROUP_ADD,
} from '../../constants';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter, RouteComponentProps } from 'react-router';
import store from '../../store';
import App from '../App';
import toJson from 'enzyme-to-json';
import React from 'react';
import {
    URL_USER_CREDENTIALS,
    URL_USER_EDIT,
    URL_USER_GROUP_CREATE,
    URL_USER_GROUP_EDIT,
    URL_USER,
    URL_USER_GROUPS,
} from '@opensrp/user-management';

jest.mock('containers/pages/Analysis', () => {
    const Analysis = () => {
        return <div>This is Analysis</div>;
    };
    return Analysis;
});

jest.mock('@opensrp/user-management', () => {
    const userMocks = jest.requireActual('@opensrp/user-management');
    const MockUsersComponent = ({ message }: { message: string }) => <div>{message}</div>;
    return {
        ...userMocks,
        ConnectedUserList: () => <MockUsersComponent message="Users list" />,
        ConnectedCreateEditUser: () => <MockUsersComponent message="UserEdit" />,
        ConnectedUserCredentials: () => <MockUsersComponent message="User credentials list" />,
        UserGroupsList: () => <MockUsersComponent message="User groups list" />,
        UserRolesList: () => <MockUsersComponent message="User roles list" />,
        CreateEditUserGroup: () => <MockUsersComponent message="Edit user groups" />,
    };
});

jest.mock('@opensrp/team-management', () => {
    const userMocks = jest.requireActual('@opensrp/team-management');
    const MockTeamsComponent = ({ message }: { message: string }) => <div>{message}</div>;
    return {
        ...userMocks,
        TeamsView: () => <MockTeamsComponent message="Teams list" />,
        TeamsAddEdit: () => <MockTeamsComponent message="Teams add/edit" />,
    };
});

jest.mock('@opensrp/team-assignment', () => {
    const userMocks = jest.requireActual('@opensrp/team-assignment');
    const MockTeamAssignmentComponent = ({ message }: { message: string }) => <div>{message}</div>;
    return {
        ...userMocks,
        TeamAssignmentView: () => <MockTeamAssignmentComponent message="Teams assignment" />,
    };
});

jest.mock('@opensrp/location-management', () => {
    const userMocks = jest.requireActual('@opensrp/location-management');
    const MockLocationComponent = ({ message }: { message: string }) => <div>{message}</div>;
    return {
        ...userMocks,
        LocationUnitList: () => <MockLocationComponent message="Location list" />,
        LocationUnitGroupAddEdit: () => <MockLocationComponent message="Location group add edit" />,
        LocationUnitGroupList: () => <MockLocationComponent message="Location unit group list" />,
        NewLocationUnit: () => <MockLocationComponent message="New location unit" />,
        EditLocationUnit: () => <MockLocationComponent message="Edit location unit" />,
    };
});

jest.mock('../../configs/env');

describe('App', () => {
    beforeAll(() => {
        store.dispatch(
            authenticateUser(
                true,
                {
                    email: 'test@gmail.com',
                    name: 'This Name',
                    username: 'tHat Part',
                },
                {
                    roles: ['ROLE_VIEW_KEYCLOAK_USERS'],
                    username: 'superset-user',
                    user_id: 'cab07278-c77b-4bc7-b154-bcbf01b7d35b',
                },
            ),
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('Analysis routes are correctly registered', async () => {
        // redirecting to certain routes renders the correct page
        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter initialEntries={[{ pathname: PREGNANCY_ANALYSIS_URL }]}>
                    <App />
                </MemoryRouter>
            </Provider>,
        );
        await act(async () => {
            await new Promise<unknown>((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        expect(toJson(wrapper.find('Analysis'))).toMatchSnapshot('pregnancy module');

        // go to new nbc and pnc module page
        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(NBC_AND_PNC_ANALYSIS_URL);
        wrapper.update();
        expect(toJson(wrapper.find('Analysis'))).toMatchSnapshot('nbc and pnc module');

        // go to edit nutrition module
        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(NUTRITION_ANALYSIS_URL);
        wrapper.update();
        expect(toJson(wrapper.find('Analysis'))).toMatchSnapshot('nutrition module');
        wrapper.unmount();
    });

    it('userManagement routes are correctly registered', async () => {
        // redirecting to certain routes renders the correct page
        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter initialEntries={[{ pathname: URL_USER }]}>
                    <App />
                </MemoryRouter>
            </Provider>,
        );
        await act(async () => {
            await new Promise<unknown>((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        expect(toJson(wrapper.find('MockUsersComponent'))).toMatchSnapshot('user list');

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(`${URL_USER_EDIT}/uuid`);
        wrapper.update();
        expect(toJson(wrapper.find('MockUsersComponent'))).toMatchSnapshot();

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(`${URL_USER_CREDENTIALS}/uuid`);
        wrapper.update();
        expect(toJson(wrapper.find('MockUsersComponent'))).toMatchSnapshot();

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(`${URL_USER_GROUP_EDIT}/uuid`);
        wrapper.update();
        expect(toJson(wrapper.find('MockUsersComponent'))).toMatchSnapshot();

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(`${URL_USER_GROUPS}/uuid`);
        wrapper.update();
        expect(toJson(wrapper.find('MockUsersComponent'))).toMatchSnapshot();

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(URL_USER_GROUP_CREATE);
        wrapper.update();
        expect(toJson(wrapper.find('MockUsersComponent'))).toMatchSnapshot();
        wrapper.unmount();
    });

    it('teams routes are correctly registered', async () => {
        // redirecting to certain routes renders the correct page
        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter initialEntries={[{ pathname: URL_TEAMS }]}>
                    <App />
                </MemoryRouter>
            </Provider>,
        );
        await act(async () => {
            await new Promise<unknown>((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        expect(toJson(wrapper.find('MockTeamsComponent'))).toMatchSnapshot('user list');

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(URL_TEAM_ASSIGNMENT);
        wrapper.update();
        expect(toJson(wrapper.find('MockTeamAssignmentComponent'))).toMatchSnapshot();

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(`${URL_TEAMS_EDIT}/uuid`);
        wrapper.update();
        expect(toJson(wrapper.find('MockTeamsComponent'))).toMatchSnapshot();

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(URL_TEAMS_ADD);
        wrapper.update();
        expect(toJson(wrapper.find('MockTeamsComponent'))).toMatchSnapshot();
        wrapper.unmount();
    });

    it('location units routes are correctly registered', async () => {
        // redirecting to certain routes renders the correct page
        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter initialEntries={[{ pathname: URL_LOCATION_UNIT }]}>
                    <App />
                </MemoryRouter>
            </Provider>,
        );
        await act(async () => {
            await new Promise<unknown>((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        expect(toJson(wrapper.find('MockLocationComponent'))).toMatchSnapshot('user list');

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(URL_LOCATION_UNIT_GROUP);
        wrapper.update();
        expect(toJson(wrapper.find('MockLocationComponent'))).toMatchSnapshot();

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(
            `${URL_LOCATION_UNIT_GROUP}/edit/:id`,
        );
        wrapper.update();
        expect(toJson(wrapper.find('MockLocationComponent'))).toMatchSnapshot();

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(URL_LOCATION_UNIT_GROUP_ADD);
        wrapper.update();
        expect(toJson(wrapper.find('MockLocationComponent'))).toMatchSnapshot();

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(
            `${URL_LOCATION_UNIT}/edit/:id`,
        );
        wrapper.update();
        expect(toJson(wrapper.find('MockLocationComponent'))).toMatchSnapshot();

        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(URL_LOCATION_UNIT_ADD);
        wrapper.update();
        expect(toJson(wrapper.find('MockLocationComponent'))).toMatchSnapshot();
        wrapper.unmount();
    });
});
