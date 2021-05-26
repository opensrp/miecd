/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { Provider } from 'react-redux';
import { Route, MemoryRouter } from 'react-router';
import ConnectedHierarchicalDataTable from '..';
import { mountWithTranslations } from '../../../helpers/testUtils';
import store from '../../../store/index';
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
import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { QueryClient, QueryClientProvider } from 'react-query';
import fetchMock from 'fetch-mock';
import flushPromises from 'flush-promises';
import { act } from 'react-dom/test-utils';

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
        const OpenSRPAPIResponse = {
            oAuth2Data: {
                access_token: 'hunter2',
                expires_in: '3599',
                state: 'opensrp',
                token_type: 'bearer',
            },
            preferredName: 'Superset User',
            roles: ['Provider'],
            username: 'admin',
        };
        const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
        store.dispatch(authenticateUser(authenticated, user, extraData));
    });

    beforeEach(() => {
        fetchMock
            .get(`https://discover.miecd-stage.smartregister.org/oauth-authorized/opensrp`, {})
            .get(`https://discover.miecd-stage.smartregister.org/superset/slice_json/12`, villages)
            .get(`https://discover.miecd-stage.smartregister.org/superset/slice_json/13`, communes)
            .get(`https://discover.miecd-stage.smartregister.org/superset/slice_json/10`, districts)
            .get(`https://discover.miecd-stage.smartregister.org/superset/slice_json/11`, provinces);
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
        fetchMock.get(`https://discover.miecd-stage.smartregister.org/superset/slice_json/8`, pregnancySmsData);

        // mount for pregnancy module with 'all' risk type
        let wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry: '/Pregnancy/all/11 Total Pregnancies/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // show ripple loader
        expect(wrapper.find('Ripple')).toBeTruthy();

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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
        fetchMock.get(`https://discover.miecd-stage.smartregister.org/superset/slice_json/5`, nbcPncSmsData);

        // mount for nbcPnc module with 'all' risk type
        let wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry: '/NBC & PNC_CHILD/all/4 Total Newborns/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // show ripple loader
        expect(wrapper.find('Ripple')).toBeTruthy();

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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
        fetchMock.get(`https://discover.miecd-stage.smartregister.org/superset/slice_json/6`, nutritionSmsData);

        // mount for pregnancy module with 'all' risk type
        let wrapper = renderWithProviders(ConnectedHierarchicalDataTable, {
            store,
            queryClient,
            initialEntry:
                '/Nutrition/all/11%20Total%20Children%20Under%205/0/down/d1865325-11e6-4e39-817b-e676c1affecf/0',
        });

        // show ripple loader
        expect(wrapper.find('Ripple')).toBeTruthy();

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

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

        // wait for fetches to complete
        await act(async () => {
            await flushPromises();
            wrapper.update();
        });

        // show's hierarchy table with normal highlighted

        // table rows with 'inappropriately-fed' class
        const normal = wrapper.find('Table tr').find('.normal');
        // expect four rows (3 provinces and totals)
        expect(normal).toHaveLength(4);

        wrapper.unmount();
    });
});
