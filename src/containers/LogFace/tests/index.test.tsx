import { history } from '@onaio/connected-reducer-registry';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { ConnectedRouter } from 'connected-react-router';
import toJson from 'enzyme-to-json';
import { Provider } from 'react-redux';
import ConnectedLogFace, { LogFacePropsType } from '..';
import { NUTRITION_MODULE, PREGNANCY, PREGNANCY_LOGFACE_URL, PREGNANCY_MODULE } from '../../../constants';
import { mountWithTranslations } from '../../../helpers/testUtils';
import store from '../../../store';
import reducer, { clearLocationSlice, fetchUserLocations, reducerName } from '../../../store/ducks/locations';
import { LogFaceSmsType, RemoveLogFaceSms, removeSms } from '../../../store/ducks/sms_events';
import { userLocations } from './userLocationFixtures';
import { act } from 'react-dom/test-utils';
import * as securityAuthenticate from '../../../store/ducks/tests/fixtures/securityAuthenticate.json';
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom';
import { nutritionSmsFixtures, PregnancyReportFixture } from 'store/ducks/tests/fixtures';
import { Dictionary } from '@onaio/utils';
import React from 'react';
import { LogFaceModules } from '../../../configs/settings';
import { authenticateUser } from '@onaio/session-reducer';

reducerRegistry.register(reducerName, reducer);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('jest-fetch-mock');

jest.mock('../../../configs/env');

const locationProps = {
    history,
    location: {
        hash: '',
        pathname: `${PREGNANCY_LOGFACE_URL}`,
        search: '',
        state: {},
    },
    match: {
        isExact: true,
        params: {},
        path: `${PREGNANCY_LOGFACE_URL}`,
        url: `${PREGNANCY_LOGFACE_URL}`,
    },
};

jest.mock('react-select', () => ({ options, onChange }: Dictionary) => {
    function handleChange(event: Dictionary) {
        const option = options.find((option: Dictionary) => option.value === event.target?.value);
        onChange(option);
    }

    return (
        <select data-testid="select" onChange={handleChange}>
            {options.map(({ label, value }: Dictionary) => (
                <option key={value} value={value}>
                    {label}
                </option>
            ))}
        </select>
    );
});

describe('containers/LogFace extended', () => {
    const commonProps = { module: PREGNANCY as LogFaceModules };
    beforeAll(() => {
        store.dispatch(fetchUserLocations(userLocations));
        store.dispatch(
            authenticateUser(
                true,
                {
                    email: 'bob@example.com',
                    name: 'Bobbie',
                    username: 'RobertBaratheon',
                },
                { api_token: 'hunter2', oAuth2Data: { access_token: 'hunter2', state: 'abcde' } },
            ),
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
        store.dispatch(clearLocationSlice());
        store.dispatch(removeSms);
        fetch.resetMocks();
        store.dispatch(RemoveLogFaceSms());
    });

    it('renders correctly', async () => {
        const supersetFetchMock = jest
            .fn()
            .mockResolvedValueOnce(PregnancyReportFixture)
            .mockResolvedValueOnce(userLocations);
        fetch.mockResponse(JSON.stringify(securityAuthenticate));
        const props = {
            module: PREGNANCY_MODULE as LogFaceModules,
            supersetService: supersetFetchMock,
        };
        const container = document.createElement('div');
        document.body.appendChild(container);

        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <MemoryRouter initialEntries={[PREGNANCY_LOGFACE_URL]}>
                    <Route
                        path={PREGNANCY_LOGFACE_URL}
                        render={(routeProps: RouteComponentProps) => {
                            return <ConnectedLogFace {...{ ...routeProps, ...props }} />;
                        }}
                    ></Route>
                </MemoryRouter>
            </Provider>,
            { attachTo: container },
        );

        expect(wrapper.find('Ripple')).toHaveLength(1);

        await act(async () => {
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        expect((wrapper.find('LogFace').props() as LogFacePropsType).smsData).toHaveLength(490);
        expect(toJson(wrapper.find('table'))).toMatchSnapshot('table snapshot');
        expect(toJson(wrapper.find('input#search'))).toMatchSnapshot('search div');
        expect(toJson(wrapper.find('#logface_title'))).toMatchSnapshot('logface title');
        expect(toJson(wrapper.find('.paginator'))).toMatchSnapshot('paginator');

        wrapper.unmount();
    });

    it('shows loader and Breaks just fine', async () => {
        const supersetFetchMock = jest.fn(async () => []);
        fetch.mockReject(new Error('coughid'));
        const props = {
            ...commonProps,
            ...locationProps,
            supersetService: supersetFetchMock,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <ConnectedLogFace {...props} />
                </ConnectedRouter>
            </Provider>,
        );

        expect(wrapper.find('Ripple')).toHaveLength(1);

        await act(async () => {
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        // loader is no longer showing
        expect(wrapper.find('Ripple')).toHaveLength(0);

        // showing broken page due to error
        expect(wrapper.text()).toMatchInlineSnapshot(`"An error occurredErrorcoughid"`);
        // // and finally check the requests made
        expect(supersetFetchMock.mock.calls).toEqual([['pregnancyLogface'], ['userLocation']]);
        expect(fetch.mock.calls).toEqual([
            [
                'https://test.smartregister.org/opensrp/rest//security/authenticate/',
                {
                    headers: {
                        accept: 'application/json',
                        authorization: 'Bearer hunter2',
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    method: 'GET',
                },
            ],
        ]);

        wrapper.unmount();
    });

    it('filters work correctly for pregnancy', async () => {
        const supersetFetchMock = jest
            .fn()
            .mockResolvedValueOnce(PregnancyReportFixture)
            .mockResolvedValueOnce(userLocations);
        fetch.mockResponse(JSON.stringify(securityAuthenticate));
        const props = {
            ...commonProps,
            supersetService: supersetFetchMock,
        };
        const container = document.createElement('div');
        document.body.appendChild(container);

        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <MemoryRouter initialEntries={[PREGNANCY_LOGFACE_URL]}>
                    <Route
                        path={PREGNANCY_LOGFACE_URL}
                        render={(routeProps: RouteComponentProps) => {
                            return <ConnectedLogFace {...{ ...routeProps, ...props }} />;
                        }}
                    ></Route>
                </MemoryRouter>
            </Provider>,
            { attachTo: container },
        );

        expect(wrapper.find('Ripple')).toHaveLength(1);

        await act(async () => {
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        expect((wrapper.find('LogFace').props() as LogFacePropsType).smsData).toHaveLength(490);

        // start with search field
        wrapper.find('#search').simulate('change', { target: { value: '100' } });
        wrapper.update();

        // check url changed correctly
        expect((wrapper.find('Router').props() as RouteComponentProps).history.location.search).toEqual('?search=100');

        // just checking that there were some events filtered out.
        expect((wrapper.find('LogFace').props() as LogFacePropsType).smsData).toHaveLength(482);

        expect(toJson(wrapper.find('#risk-filter select'))).toMatchSnapshot('risk filter');

        // change risk level
        wrapper.find('#risk-filter select').simulate('change', { target: { value: 'redAlert', name: 'Red alert' } });
        wrapper.update();

        // check url changed correctly
        expect((wrapper.find('Router').props() as RouteComponentProps).history.location.search).toEqual(
            '?search=100&riskCategory=redAlert',
        );

        // just checking that there were some events filtered out.
        expect((wrapper.find('LogFace').props() as LogFacePropsType).smsData).toHaveLength(35);

        // change sms type level
        wrapper
            .find('#sms-type-filter select')
            .simulate('change', { target: { value: 'Birth Report', name: 'Birth Report' } });
        wrapper.update();

        // check url changed correctly
        expect((wrapper.find('Router').props() as RouteComponentProps).history.location.search).toEqual(
            '?search=100&riskCategory=redAlert&smsType=Birth%20Report',
        );

        // just checking that there were some events filtered out.
        expect((wrapper.find('LogFace').props() as LogFacePropsType).smsData).toHaveLength(26);

        // play with locations
        expect(toJson(wrapper.find('SelectLocationFilter select'))).toMatchSnapshot('location filter');
        wrapper
            .find('SelectLocationFilter select')
            .simulate('change', { target: { value: 'eccfe905-0e03-4188-98bc-22f141cccd0e', label: 'Kon Tum' } });
        wrapper.update();

        // check url changed correctly
        expect((wrapper.find('Router').props() as RouteComponentProps).history.location.search).toEqual(
            '?search=100&riskCategory=redAlert&smsType=Birth%20Report&locationSearch=eccfe905-0e03-4188-98bc-22f141cccd0e',
        );
        wrapper.unmount();
    });

    it('filters work correctly for Nutrition', async () => {
        const supersetFetchMock = jest
            .fn()
            .mockResolvedValueOnce(nutritionSmsFixtures)
            .mockResolvedValueOnce(userLocations);
        fetch.mockResponse(JSON.stringify(securityAuthenticate));
        const props = {
            ...commonProps,
            module: NUTRITION_MODULE as LogFaceModules,
            supersetService: supersetFetchMock,
        };
        const container = document.createElement('div');
        document.body.appendChild(container);

        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <MemoryRouter initialEntries={[PREGNANCY_LOGFACE_URL]}>
                    <Route
                        path={PREGNANCY_LOGFACE_URL}
                        render={(routeProps: RouteComponentProps) => {
                            return <ConnectedLogFace {...{ ...routeProps, ...props }} />;
                        }}
                    ></Route>
                </MemoryRouter>
            </Provider>,
            { attachTo: container },
        );

        expect(wrapper.find('Ripple')).toHaveLength(1);

        await act(async () => {
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        expect((wrapper.find('LogFace').props() as LogFacePropsType).smsData).toHaveLength(
            (nutritionSmsFixtures as LogFaceSmsType[]).length,
        );

        // start with search field
        wrapper.find('#search').simulate('change', { target: { value: '100' } });
        wrapper.update();

        // check url changed correctly
        expect((wrapper.find('Router').props() as RouteComponentProps).history.location.search).toEqual('?search=100');

        // just checking that there were some events filtered out.
        expect((wrapper.find('LogFace').props() as LogFacePropsType).smsData).toHaveLength(45);

        expect(toJson(wrapper.find('#risk-filter select'))).toMatchSnapshot('risk filter');

        // change risk level
        wrapper.find('#risk-filter select').simulate('change', { target: { value: 'overweight', name: 'Overweight' } });
        wrapper.update();

        // check url changed correctly
        expect((wrapper.find('Router').props() as RouteComponentProps).history.location.search).toEqual(
            '?search=100&riskCategory=overweight',
        );
        // start with search field
        wrapper.find('#search').simulate('change', { target: { value: '' } });
        wrapper.update();

        // just checking that there were some events filtered out.
        expect((wrapper.find('LogFace').props() as LogFacePropsType).smsData).toHaveLength(3);

        // change sms type level
        expect(toJson(wrapper.find('#sms-type-filter select'))).toMatchSnapshot('smsType filter');
        wrapper
            .find('#sms-type-filter select')
            .simulate('change', { target: { value: 'Nutrition Report', name: 'Nutrition Report' } });
        wrapper.update();

        // check url changed correctly
        expect((wrapper.find('Router').props() as RouteComponentProps).history.location.search).toEqual(
            '?riskCategory=overweight&smsType=Nutrition%20Report',
        );
        wrapper.unmount();
    });
});
