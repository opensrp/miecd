/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { Provider } from 'react-redux';
import { Route, MemoryRouter } from 'react-router';
import ConnectedHierarchicalDataTable from '..';
import { mountWithTranslations, waitForPromises } from '../../../helpers/testUtils';
import store from '../../../store/index';
import { authorizeSuperset } from '../../../store/ducks/superset';
import {
    villages,
    communes,
    districts,
    provinces,
    pregnancySmsData,
    nutritionSmsData,
    nbcPncSmsData,
} from '../../HierarchichalDataTable/test/fixtures';
import { authenticateUser } from '@onaio/session-reducer';
import { QueryClient, QueryClientProvider } from 'react-query';
import fetchMock from 'fetch-mock';

jest.mock('@fortawesome/react-fontawesome');

interface RenderWithProviders {
    store: typeof store;
    queryClient: QueryClient;
    initialEntry: string;
}
// Render with Providers Helper function
function renderWithProviders(UI: React.FC, { store, queryClient, initialEntry }: RenderWithProviders) {
    return mountWithTranslations(
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[initialEntry]}>
                    <Route
                        exact
                        path="/:module?/:risk_highlighter?/:title?/:current_level?/:direction?/:node_id?/:permission_level?/:from_level?"
                        component={UI}
                    />
                </MemoryRouter>
            </QueryClientProvider>
        </Provider>,
    );
}

describe('HierarchichalDataTable', () => {
    beforeAll(() => {
        store.dispatch(
            authenticateUser(
                true,
                {
                    email: 'demo@example.com',
                    name: 'demo',
                    username: 'demo',
                },
                { api_token: 'hunter2', oAuth2Data: { access_token: 'hunter2', state: 'abcde' } },
            ),
        );
        store.dispatch(authorizeSuperset(true));
    });

    beforeEach(() => {
        fetchMock
            .get(`https://somesuperseturl.org/superset/slice_json/1`, villages)
            .get(`https://somesuperseturl.org/superset/slice_json/2`, communes)
            .get(`https://somesuperseturl.org/superset/slice_json/3`, districts)
            .get(`https://somesuperseturl.org/superset/slice_json/4`, provinces);
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
        fetchMock.restore();
    });

    it('renders without crashing', () => {
        const queryClient = new QueryClient();

        const wrapper = shallow(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedHierarchicalDataTable />
                </QueryClientProvider>
            </Provider>,
        );

        // show ripple loader
        expect(wrapper.find('Ripple')).toBeTruthy();

        wrapper.unmount();
    });

    it('renders correctly for Pregnancy module', async () => {
        const queryClient = new QueryClient();

        // fetch pregnancy sms slice
        fetchMock.get(`https://somesuperseturl.org/superset/slice_json/6`, pregnancySmsData);

        // mount for pregnancy module with 'all' risk type
        let wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry: '/Pregnancy/all/11 Total Pregnancies/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // show ripple loader
        expect(wrapper.find('Ripple')).toBeTruthy();

        // flush promises
        await waitForPromises();
        wrapper.update();

        // expect no loader
        expect(wrapper.find('Ripple').exists()).toBeFalsy();

        // show's hierarchy table
        expect(toJson(wrapper.find('Table'))).toMatchSnapshot('hierarchicalDataTable');

        // mount for pregnancy module with 'red' risk type
        wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry: '/Pregnancy/red/11 Total Pregnancies/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // flush promises
        await waitForPromises();
        wrapper.update();

        // show's hierarchy table with red alert highlighted

        // table rows with 'red-alert' class
        const redAlertTr = wrapper.find('Table tr').find('.red-alert');
        // expect four rows (3 provinces and totals)
        expect(redAlertTr).toHaveLength(4);

        // mount for pregnancy module with 'risk' risk type
        wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry: '/Pregnancy/risk/11 Total Pregnancies/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // flush promises
        await waitForPromises();
        wrapper.update();

        // show's hierarchy table with red alert highlighted

        // table rows with 'risk' class
        const riskTd = wrapper.find('Table tr').find('.risk');
        // expect four rows (3 provinces and totals)
        expect(riskTd).toHaveLength(4);

        // mount for pregnancy module with 'no' risk type
        wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry:
                '/Pregnancy/no/0 Total Pregnancies due in 2 weeks/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // flush promises
        await waitForPromises();
        wrapper.update();

        // show's hierarchy table with no_risk highlighted

        // table rows with 'risk' class
        const noRiskTd = wrapper.find('Table tr').find('.no');
        // expect four rows (3 provinces and totals)
        expect(noRiskTd).toHaveLength(4);

        wrapper.unmount();
    });

    it('renders correctly for NBC_AND_PNC module', async () => {
        const queryClient = new QueryClient();

        // fetch nbcPnc sms slice
        fetchMock.get(`https://somesuperseturl.org/superset/slice_json/7`, nbcPncSmsData);

        // mount for nbcPnc module with 'all' risk type
        let wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry: '/NBC & PNC_CHILD/all/4 Total Newborns/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // show ripple loader
        expect(wrapper.find('Ripple')).toBeTruthy();

        // flush promises
        await waitForPromises();
        wrapper.update();

        // expect no loader
        expect(wrapper.find('Ripple').exists()).toBeFalsy();

        // show's hierarchy table
        expect(toJson(wrapper.find('Table'))).toMatchSnapshot('hierarchicalDataTable');

        // mount for nbcPnc module with 'red' risk type
        wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry: '/NBC & PNC_WOMAN/red/3 Total Mothers in PNC/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // flush promises
        await waitForPromises();
        wrapper.update();

        // show's hierarchy table with red alert highlighted

        // table rows with 'red-alert' class
        const redAlertTr = wrapper.find('Table tr').find('.red-alert');
        // expect four rows (3 provinces and totals)
        expect(redAlertTr).toHaveLength(4);

        // mount for nbcPnc module with 'risk' risk type
        wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry: '/NBC & PNC_CHILD/risk/4 Total Newborns/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // flush promises
        await waitForPromises();
        wrapper.update();

        // show's hierarchy table with red alert highlighted

        // table rows with 'risk' class
        const riskTd = wrapper.find('Table tr').find('.risk');
        // expect four rows (3 provinces and totals)
        expect(riskTd).toHaveLength(4);

        // mount for nbcPnc module with 'no' risk type
        wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry: '/NBC & PNC_CHILD/no/4 Total Newborns/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // flush promises
        await waitForPromises();
        wrapper.update();

        // show's hierarchy table with no_risk highlighted

        // table rows with 'no' class
        const noRiskTd = wrapper.find('Table tr').find('.no');
        // expect four rows (3 provinces and totals)
        expect(noRiskTd).toHaveLength(4);

        wrapper.unmount();
    });

    it('renders correctly for Nutrition module', async () => {
        const queryClient = new QueryClient();

        // fetch Nutrition sms slice
        fetchMock.get(`https://somesuperseturl.org/superset/slice_json/8`, nutritionSmsData);

        // mount for pregnancy module with 'all' risk type
        let wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry:
                '/Nutrition/all/11%20Total%20Children%20Under%205/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // show ripple loader
        expect(wrapper.find('Ripple')).toBeTruthy();

        // flush promises
        await waitForPromises();
        wrapper.update();

        // expect no loader
        expect(wrapper.find('Ripple').exists()).toBeFalsy();

        // show's hierarchy table
        expect(toJson(wrapper.find('Table'))).toMatchSnapshot('hierarchicalDataTable');

        // mount for Nutrition module with 'stunted' risk type
        wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry: '/Nutrition/stunted/11 Total Children Under 5/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // flush promises
        await waitForPromises();
        wrapper.update();

        // show's hierarchy table with stunted highlighted

        // table rows with 'stunted' class
        const stuntedTr = wrapper.find('Table tr').find('.stunted');
        // expect four rows (3 provinces and totals)
        expect(stuntedTr).toHaveLength(4);

        // mount for Nutrition module with 'severe wasting' risk type
        wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry:
                '/Nutrition/severe wasting/9 Total Children Under 2/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // flush promises
        await waitForPromises();
        wrapper.update();

        // show's hierarchy table with severe wasting highlighted

        // table rows with 'severe-wasting' class
        const severeWastingTd = wrapper.find('Table tr').find('.severe-wasting');
        // expect four rows (3 provinces and totals)
        expect(severeWastingTd).toHaveLength(4);

        // mount for Nutrition module with 'overweight' risk type
        wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry:
                '/Nutrition/overweight/9 Total Children Under 2/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // flush promises
        await waitForPromises();
        wrapper.update();

        // show's hierarchy table with overweight highlighted

        // table rows with 'overweight' class
        const overweight = wrapper.find('Table tr').find('.overweight');
        // expect four rows (3 provinces and totals)
        expect(overweight).toHaveLength(4);

        // mount for Nutrition module with 'inappropriately fed' risk type
        wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry:
                '/Nutrition/inappropriately fed/11 Total Children Under 5/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // flush promises
        await waitForPromises();
        wrapper.update();

        // show's hierarchy table with inappropriately fed highlighted

        // table rows with 'inappropriately-fed' class
        const inappropriatelyFed = wrapper.find('Table tr').find('.inappropriately-fed');
        // expect four rows (3 provinces and totals)
        expect(inappropriatelyFed).toHaveLength(4);

        // mount for Nutrition module with 'normal' risk type
        wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry: '/Nutrition/normal/11 Total Children Under 5/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // flush promises
        await waitForPromises();
        wrapper.update();

        // show's hierarchy table with normal highlighted

        // table rows with 'inappropriately-fed' class
        const normal = wrapper.find('Table tr').find('.normal');
        // expect four rows (3 provinces and totals)
        expect(normal).toHaveLength(4);

        wrapper.unmount();
    });
    it('shows friendly error if drill down level is unavailable', async () => {
        const queryClient = new QueryClient();

        // fetch Nutrition sms slice
        fetchMock.get(`https://somesuperseturl.org/superset/slice_json/6`, pregnancySmsData);

        // mount level 3 for commune node_id with no villages "The 'Ayun' commune"
        const wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry: '/Pregnancy/all/11 Total Pregnancies/3/down/4f03186d-674c-44c5-8d74-9351272df429/0',
        });

        // flush promises
        await waitForPromises();
        wrapper.update();

        // expect to find the no rows td with the error message
        expect(wrapper.find('#no-rows td').text()).toMatchInlineSnapshot(
            `"The Provinces commune doesn't seem to have villages"`,
        );
    });
});
