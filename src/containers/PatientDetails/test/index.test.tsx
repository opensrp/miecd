import reducerRegistry from '@onaio/redux-reducer-registry';
import { ConnectedRouter } from 'connected-react-router';
import { PATIENT_DETAIL_URL, PREGNANCY, PREGNANCY_LOGFACE_URL } from '../../../constants';
import { LogFacePropsType } from 'containers/LogFace';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, RouteComponentProps, Router } from 'react-router';
import { clearLocationSlice } from 'store/ducks/locations';
import { mountWithTranslations } from '../../../helpers/testUtils';
import smsReducer, { reducerName, removeSms } from '../../../store/ducks/sms_events';
import store from '../../../store/index';
import ConnectedPatientDetails from '..';
import { smsDataFixture } from 'store/ducks/tests/fixtures';
import * as securityAuthenticate from '../../../store/ducks/tests/fixtures/securityAuthenticate.json';
import { communes, districts, provinces, villages } from '../../HierarchichalDataTable/test/fixtures';
import { userLocations } from 'containers/LogFace/tests/userLocationFixtures';
import { authenticateUser } from '@onaio/session-reducer';

// /** register the superset reducer */
reducerRegistry.register(reducerName, smsReducer);

const history = createBrowserHistory();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('jest-fetch-mock');

jest.mock('../../../configs/env');

jest.mock('highcharts');

const locationProps = {
    history,
    location: {
        hash: '',
        pathname: `${PATIENT_DETAIL_URL}`,
        search: '',
        state: {},
    },
    match: {
        isExact: true,
        params: { patient_id: '' },
        path: `${PATIENT_DETAIL_URL}`,
        url: `${PATIENT_DETAIL_URL}`,
    },
};

describe('containers/LogFace extended', () => {
    beforeAll(() => {
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
    });

    it('shows loader and Breaks just fine', async () => {
        const supersetFetchMock = jest.fn(async () => []);
        fetch.mockReject(new Error('coughid'));
        const props = {
            ...locationProps,
            supersetService: supersetFetchMock,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <ConnectedPatientDetails {...props} />
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
        // and finally check the requests made
        expect(supersetFetchMock.mock.calls).toEqual([
            ['userLocation'],
            ['province'],
            ['district'],
            ['commune'],
            ['village'],
            ['smsData'],
        ]);
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

    it('renders correctly', async () => {
        const supersetFetchMock = jest
            .fn()
            .mockResolvedValueOnce(userLocations)
            .mockResolvedValueOnce(provinces)
            .mockResolvedValueOnce(districts)
            .mockResolvedValueOnce(communes)
            .mockResolvedValueOnce(villages)
            .mockResolvedValueOnce(smsDataFixture);
        fetch.mockResponse(JSON.stringify(securityAuthenticate));
        const props = {
            ...locationProps,
            supersetService: supersetFetchMock,
        };
        const container = document.createElement('div');
        document.body.appendChild(container);

        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <ConnectedPatientDetails {...props} />
                </ConnectedRouter>
            </Provider>,
        );

        expect(wrapper.find('Ripple')).toHaveLength(1);

        await act(async () => {
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        wrapper.find('.information__card_body_cell').forEach((cell) => {
            expect(toJson(cell)).toMatchSnapshot('Basic Info key value');
        });

        expect(wrapper.find('ReportTable')).toHaveLength(1);

        expect(toJson(wrapper.find('#titleDiv'))).toMatchSnapshot('titleDiv');

        wrapper.unmount();
    });
});
