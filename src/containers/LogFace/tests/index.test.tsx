import { history } from '@onaio/connected-reducer-registry';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { ConnectedRouter } from 'connected-react-router';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { Provider } from 'react-redux';
import ConnectedLogFace, { LogFacePropsType } from '..';
import { DEFAULT_NUMBER_OF_LOGFACE_ROWS, PREGNANCY, PREGNANCY_LOGFACE_URL } from '../../../constants';
import { mountWithTranslations } from '../../../helpers/testUtils';
import store from '../../../store';
import reducer, {
    clearLocationSlice,
    fetchLocations,
    fetchUserId,
    fetchUserLocations,
    reducerName,
} from '../../../store/ducks/locations';
import { fetchSms, removeSms } from '../../../store/ducks/sms_events';
import { communes, districts, provinces, villages } from '../../HierarchichalDataTable/test/fixtures';
import { smsSlice } from './fixtures';
import { userLocations } from './userLocationFixtures';
import { act } from 'react-dom/test-utils';
import * as securityAuthenticate from '../../../store/ducks/tests/fixtures/securityAuthenticate.json';
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom';
import { smsDataFixture } from 'store/ducks/tests/fixtures';
import { Dictionary } from '@onaio/utils/dist/types/index';

reducerRegistry.register(reducerName, reducer);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('jest-fetch-mock');

jest.mock('../../../configs/env');

jest.mock('react-select', () => {
    const SelectComponent = (argProps: Record<string, unknown>) => {
        const props = {
            ...argProps,
            className: `mock-select ${argProps.className}`,
        };
        return <select {...props}></select>;
    };
    return SelectComponent;
});

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

describe('containers/LogFace', () => {
    const commonProps = { module: PREGNANCY, ...locationProps };
    afterEach(() => {
        store.dispatch(removeSms);
        fetch.resetMocks();
    });
    beforeEach(() => {
        jest.resetAllMocks();
        store.dispatch(fetchLocations(provinces));
        store.dispatch(fetchLocations(districts));
        store.dispatch(fetchLocations(communes));
        store.dispatch(fetchLocations(villages));
        store.dispatch(fetchUserLocations(userLocations));
        store.dispatch(fetchUserId('515ad0e9-fccd-4cab-8861-0ef3ecb831e0'));
    });
    // eslint-disable-next-line jest/expect-expect
    it('renders without crashing', async () => {
        shallow(
            <Provider store={store}>
                <ConnectedLogFace {...commonProps} />
            </Provider>,
        );

        await act(async () => {
            await new Promise((resolve) => setImmediate(resolve));
        });
    });

    it('renders correctly', async () => {
        const supersetFetchMock = jest.fn(async () => []);
        const props = {
            ...commonProps,
            supersetService: supersetFetchMock,
        };
        store.dispatch(fetchSms(smsSlice));
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <ConnectedLogFace {...props} />
                </ConnectedRouter>
            </Provider>,
        );

        await act(async () => {
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        expect(toJson(wrapper.find('table'))).toMatchSnapshot('table snapshot');
        expect(toJson(wrapper.find('.logface-page-filter'))).toMatchSnapshot('filter div');
        expect(toJson(wrapper.find('input#search'))).toMatchSnapshot('search div');
        expect(toJson(wrapper.find('#logface_title'))).toMatchSnapshot('logface title');
        expect(toJson(wrapper.find('.paginator'))).toMatchSnapshot('paginator');

        wrapper.unmount();
    });

    it('renders only 10 items per page', async () => {
        store.dispatch(fetchSms(smsSlice));
        const supersetFetchMock = jest.fn(async () => []);
        const props = {
            ...commonProps,
            supersetService: supersetFetchMock,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <ConnectedLogFace {...props} />
                </ConnectedRouter>
            </Provider>,
        );

        await act(async () => {
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
        });
        // + 1 is added here to unclude the header `tr`
        expect(wrapper.find('tr').length).toBe(DEFAULT_NUMBER_OF_LOGFACE_ROWS + 1);
        wrapper.unmount();
    });

    it('search works correctly', async () => {
        store.dispatch(fetchSms(smsSlice));
        const supersetFetchMock = jest.fn(async () => []);
        const props = {
            ...commonProps,
            supersetService: supersetFetchMock,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <ConnectedLogFace {...props} />
                </ConnectedRouter>
            </Provider>,
        );

        await act(async () => {
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        expect(wrapper.find('input').length).toBe(1);
        // wrapper.find('input').simulate('change', { target: { value: '1569837448461' } });
        // + 1 is added here to unclude the header `tr`
        expect(wrapper.find('tr').length).toBe(DEFAULT_NUMBER_OF_LOGFACE_ROWS + 1);
    });
});

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
    const commonProps = { module: PREGNANCY };

    beforeEach(() => {
        jest.resetAllMocks();
        store.dispatch(clearLocationSlice());
        store.dispatch(removeSms);
        fetch.resetMocks();
    });

    it('shows loader and Breaks just fine', async () => {
        const supersetFetchMock = jest.fn(async () => []);
        fetch.mockResponse(JSON.stringify([]));
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

        fetch.mockReject(new Error('coughid'));

        await act(async () => {
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        // loader is no longer showing
        expect(wrapper.find('Ripple')).toHaveLength(0);

        // showing broken page due to error
        expect(wrapper.text()).toMatchInlineSnapshot(`"An error occurredErrorcoughid"`);
        // and finally check the requests made
        expect(supersetFetchMock.mock.calls).toEqual([['userLocation'], ['smsData']]);
        expect(fetch.mock.calls).toEqual([
            [
                'https://test.smartregister.org/opensrp/rest//security/authenticate/',
                {
                    headers: {
                        accept: 'application/json',
                        authorization: 'Bearer ',
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    method: 'GET',
                },
            ],
        ]);

        wrapper.unmount();
    });

    it('filters work correctly', async () => {
        const supersetFetchMock = jest.fn().mockResolvedValueOnce(userLocations).mockResolvedValueOnce(smsDataFixture);
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

        expect((wrapper.find('LogFace').props() as LogFacePropsType).smsData).toHaveLength(428);

        // start with search field
        wrapper.find('#search').simulate('change', { target: { value: '100' } });
        wrapper.update();

        // check url changed correctly
        expect((wrapper.find('Router').props() as RouteComponentProps).history.location.search).toEqual('?search=100');

        // just checking that there were some events filtered out.
        expect((wrapper.find('LogFace').props() as LogFacePropsType).smsData).toHaveLength(420);

        expect(toJson(wrapper.find('#risk-filter select'))).toMatchSnapshot('risk filter');

        // change risk level
        wrapper.find('#risk-filter select').simulate('change', { target: { value: 'red_alert', name: 'Red alert' } });
        wrapper.update();

        // check url changed correctly
        expect((wrapper.find('Router').props() as RouteComponentProps).history.location.search).toEqual(
            '?search=100&riskCategory=red_alert',
        );

        // just checking that there were some events filtered out.
        expect((wrapper.find('LogFace').props() as LogFacePropsType).smsData).toHaveLength(36);

        // change sms type level
        wrapper
            .find('#sms-type-filter select')
            .simulate('change', { target: { value: 'Birth Report', name: 'Birth Report' } });
        wrapper.update();

        // check url changed correctly
        expect((wrapper.find('Router').props() as RouteComponentProps).history.location.search).toEqual(
            '?search=100&riskCategory=red_alert&smsType=Birth%20Report',
        );

        // just checking that there were some events filtered out.
        expect((wrapper.find('LogFace').props() as LogFacePropsType).smsData).toHaveLength(26);

        // play with locations
        wrapper
            .find('SelectLocationFilter select')
            .simulate('change', { target: { value: 'eccfe905-0e03-4188-98bc-22f141cccd0e', label: 'Kon Tum' } });

        // check url changed correctly
        expect((wrapper.find('Router').props() as RouteComponentProps).history.location.search).toEqual(
            '?search=100&riskCategory=red_alert&smsType=Birth%20Report&locationSearch=eccfe905-0e03-4188-98bc-22f141cccd0e',
        );
        wrapper.unmount();
    });
});
