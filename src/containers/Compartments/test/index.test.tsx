import React from 'react';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import MockDate from 'mockdate';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedCompartments, {
    childrenAgeRangeFilterFunction,
    filterByDateInNextNWeeks,
    getNumberOfSmsWithRisk,
} from '..';
import {
    NBC_AND_PNC,
    NUTRITION,
    PREGNANCY,
    NO_UNDERSCORE_RISK,
    RISK_LEVEL,
    RED_ALERT,
    LOW,
    HIGH,
    RISK,
    INAPPROPRIATELY_FED,
    FEEDING_CATEGORY,
    OVERWEIGHT,
    NUTRITION_STATUS,
    STUNTED,
    GROWTH_STATUS,
    SEVERE_WASTING,
    NORMAL,
} from '../../../constants';
import { mountWithTranslations, waitForPromises } from '../../../helpers/testUtils';
import locationsReducer, { reducerName as locationsReducerName } from '../../../store/ducks/locations';
import smsReducer, {
    reducerName as smsReducerName,
    NutritionSmsData,
    PregnancySmsData,
} from '../../../store/ducks/sms_events';
import store from '../../../store/index';
import {
    villages,
    communes,
    districts,
    provinces,
    userLocationDetails,
    securityAuthenticate,
    pregnancySmsData,
    nutritionSmsData,
    nbcPncSmsData,
} from '../../HierarchichalDataTable/test/fixtures';
import { QueryClient, QueryClientProvider } from 'react-query';
import { authenticateUser } from '@onaio/session-reducer';
import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import fetchMock from 'fetch-mock';

const history = createBrowserHistory();
reducerRegistry.register(smsReducerName, smsReducer);
reducerRegistry.register(locationsReducerName, locationsReducer);

describe('Compartments', () => {
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
            .get(`https://somesuperseturl.org/oauth-authorized/opensrp`, {})
            .get(`https://someopensrpbaseurl/opensrp/security/authenticate/`, securityAuthenticate)
            .get(`https://somesuperseturl.org/superset/slice_json/1`, villages)
            .get(`https://somesuperseturl.org/superset/slice_json/2`, communes)
            .get(`https://somesuperseturl.org/superset/slice_json/3`, districts)
            .get(`https://somesuperseturl.org/superset/slice_json/4`, provinces)
            .get(`https://somesuperseturl.org/superset/slice_json/5`, userLocationDetails);
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
        fetchMock.restore();
    });

    it('must renders without crashing', () => {
        const queryClient = new QueryClient();

        const wrapper = shallow(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedCompartments module={PREGNANCY} />
                </QueryClientProvider>
            </Provider>,
        );

        // show ripple loader
        expect(wrapper.find('Ripple')).toBeTruthy();

        wrapper.unmount();
    });

    it('shows loader when loading data', async () => {
        const queryClient = new QueryClient();
        // fetch pregnancy sms slice
        fetchMock.get(`https://somesuperseturl.org/superset/slice_json/6`, pregnancySmsData);

        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedCompartments module={PREGNANCY} />
                    </QueryClientProvider>
                </Router>
            </Provider>,
        );

        // show ripple loader
        expect(wrapper.find('Ripple')).toBeTruthy();

        // wait for fetches to complete
        await waitForPromises();
        wrapper.update();

        // expect no loader
        expect(wrapper.find('Ripple').exists()).toBeFalsy();

        wrapper.unmount();
    });

    it('renders correctly for pregnancy module', async () => {
        const queryClient = new QueryClient();
        // fetch pregnancy sms slice
        fetchMock.get(`https://somesuperseturl.org/superset/slice_json/6`, pregnancySmsData);

        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedCompartments module={PREGNANCY} />
                    </QueryClientProvider>
                </Router>
            </Provider>,
        );

        // show ripple loader
        expect(wrapper.find('Ripple')).toBeTruthy();

        // show no data circle card groups
        expect(wrapper.find('DataCircleCard')).toHaveLength(0);

        // wait for fetches to complete
        await waitForPromises();
        wrapper.update();

        // expect no loader
        expect(wrapper.find('Ripple').exists()).toBeFalsy();

        // compartment title should have the correct text
        expect(wrapper.find('#compartment_title').text()).toMatchInlineSnapshot(`"Compartments"`);

        // get card groups
        const cardGroups = wrapper.find('DataCircleCard');

        // show 3 data circle card groups
        expect(cardGroups).toHaveLength(3);

        // first card group title to be pregnancies due in 1 week
        expect(cardGroups.at(0).find('.card_title').text()).toMatch(/Total Pregnancies due in 1 week/);

        // second card group title to be pregnancies due in 2 week
        expect(cardGroups.at(1).find('.card_title').text()).toMatch(/Total Pregnancies due in 2 weeks/);

        wrapper.unmount();
    });

    it('renders correctly for NBC_AND_PNC module', async () => {
        const queryClient = new QueryClient();
        // fetch nbcPnc sms slice
        fetchMock.get(`https://somesuperseturl.org/superset/slice_json/7`, nbcPncSmsData);

        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedCompartments module={NBC_AND_PNC} />
                    </QueryClientProvider>
                </Router>
            </Provider>,
        );

        // show ripple loader
        expect(wrapper.find('Ripple')).toBeTruthy();

        // show no data circle card groups
        expect(wrapper.find('DataCircleCard')).toHaveLength(0);

        // wait for fetches to complete
        await waitForPromises();
        wrapper.update();

        // expect no loader
        expect(wrapper.find('Ripple').exists()).toBeFalsy();

        // compartment title should have the correct text
        expect(wrapper.find('#compartment_title').text()).toMatchInlineSnapshot(`"Compartments"`);

        // get card groups
        const cardGroups = wrapper.find('DataCircleCard');

        // show 2 data circle card groups
        expect(cardGroups).toHaveLength(2);

        // first card group title to be Total Newborns
        expect(cardGroups.at(0).find('.card_title').text()).toMatch(/Total Newborn/);

        // second card group title to be Total Mother in PNC
        expect(cardGroups.at(1).find('.card_title').text()).toMatch(/Total Mother in PNC/);

        wrapper.unmount();
    });

    it('renders correctly for Nutrition module', async () => {
        const queryClient = new QueryClient();
        // fetch Nutrition sms slice
        fetchMock.get(`https://somesuperseturl.org/superset/slice_json/8`, nutritionSmsData);

        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <QueryClientProvider client={queryClient}>
                        <ConnectedCompartments module={NUTRITION} />
                    </QueryClientProvider>
                </Router>
            </Provider>,
        );

        // show ripple loader
        expect(wrapper.find('Ripple')).toBeTruthy();

        // show no data circle card groups
        expect(wrapper.find('DataCircleCard')).toHaveLength(0);

        // wait for fetches to complete
        await waitForPromises();
        wrapper.update();

        // expect no loader
        expect(wrapper.find('Ripple').exists()).toBeFalsy();

        // compartment title should have the correct text
        expect(wrapper.find('#compartment_title').text()).toMatchInlineSnapshot(`"Compartments"`);

        // get card groups
        const cardGroups = wrapper.find('DataCircleCard');

        // show 2 data circle card groups
        expect(cardGroups).toHaveLength(2);

        // first card group title to be Total Children Under 5
        expect(cardGroups.at(0).find('.card_title').text()).toMatch(/Total Children Under 5/);

        // second card group title to be Total Children Under 2
        expect(cardGroups.at(1).find('.card_title').text()).toMatch(/Total Children Under 2/);

        wrapper.unmount();
    });
});

// children range filter function
describe('components/Compartments/childrenAgeRangeFilterFunction', () => {
    it('returns the correct sms data items within range childrenAgeRangeFilterFunction', () => {
        MockDate.set(new Date('01/01/2020').getTime());
        const smsData = [
            { dob: new Date('01/01/2019').getTime() },
            { dob: new Date('01/01/2018').getTime() },
            { dob: new Date('01/20/2017').getTime() },
            { dob: new Date('01/01/2016').getTime() },
            { dob: new Date('01/01/2014').getTime() },
        ] as unknown as NutritionSmsData[];

        expect(smsData.filter(childrenAgeRangeFilterFunction(0, 2)).length).toEqual(2);
        expect(smsData.filter(childrenAgeRangeFilterFunction(2, 5)).length).toEqual(2);
        expect(smsData.filter(childrenAgeRangeFilterFunction(0, 10)).length).toEqual(5);
        MockDate.reset();
    });
});

describe('components/Copartments/filterByDateInNextNWeeks', () => {
    it('returns the correct sms data items within range filterByDateInNextNWeeks', () => {
        MockDate.set(new Date('01/01/2020').getTime());
        const smsData = [
            { lmp_edd: '01/02/2020' },
            { lmp_edd: '01/03/2020' },
            { lmp_edd: '01/05/2020' },
            { lmp_edd: '01/08/2020' },
            { lmp_edd: '01/09/2020' },
            { lmp_edd: '01/12/2020' },
            { lmp_edd: '01/15/2020' },
            { lmp_edd: '02/09/2020' },
            { lmp_edd: '04/08/2020' },
            { lmp_edd: '04/09/2020' },
            { lmp_edd: '05/12/2020' },
            { lmp_edd: '07/08/2020' },
            { lmp_edd: '10/12/2020' },
        ] as unknown as PregnancySmsData[];

        expect(smsData.filter(filterByDateInNextNWeeks(1)).length).toEqual(4);
        expect(smsData.filter(filterByDateInNextNWeeks(2)).length).toEqual(7);
        expect(smsData.filter(filterByDateInNextNWeeks(3)).length).toEqual(7);
        expect(smsData.filter(filterByDateInNextNWeeks(6)).length).toEqual(8);
        expect(smsData.filter(filterByDateInNextNWeeks(15)).length).toEqual(10);
        expect(smsData.filter(filterByDateInNextNWeeks(20)).length).toEqual(11);
        expect(smsData.filter(filterByDateInNextNWeeks(25)).length).toEqual(11);
    });
});

describe('components/Copartments/getNumberOfSmsWithRisk', () => {
    it('gets correct number of sms with certain risk', () => {
        // pregnancy sms risks
        const pregnancyAndNbcPncSmsData = [
            {
                risk_level: 'no_risk',
            },
            {
                risk_level: 'no_risk',
            },
            {
                risk_level: 'red_alert',
            },
            {
                risk_level: 'red_alert',
            },
            {
                risk_level: 'low',
            },
            {
                risk_level: 'low',
            },
            {
                risk_level: 'high',
            },
            {
                risk_level: 'high',
            },
            {
                risk_level: 'risk',
            },
            {
                risk_level: 'risk',
            },
            {
                risk_level: 'idk',
            },
            {
                risk_level: 'idk',
            },
        ] as unknown as PregnancySmsData[];

        // nutrition sms risks
        const nutritionSmsData = [
            {
                feeding_category: 'inappropriately fed',
                nutrition_status: 'overweight',
                growth_status: 'stunted',
            },
            {
                feeding_category: 'inappropriately fed',
                nutrition_status: 'severe wasting',
                growth_status: 'stunted',
            },
            {
                feeding_category: 'inappropriately fed',
                nutrition_status: 'severe wasting',
                growth_status: 'stunted',
            },
            {
                feeding_category: 'inappropriately fed',
                nutrition_status: 'normal',
                growth_status: 'stunted',
            },
            {
                feeding_category: 'inappropriately fed',
                nutrition_status: 'overweight',
                growth_status: 'stunted',
            },
            {
                feeding_category: 'inappropriately fed',
                nutrition_status: 'overweight',
                growth_status: 'stunted',
            },
            {
                feeding_category: 'inappropriately fed',
                nutrition_status: 'overweight',
                growth_status: 'stunted',
            },
            {
                feeding_category: 'inappropriately fed',
                nutrition_status: 'normal',
                growth_status: 'stunted',
            },
        ] as unknown as NutritionSmsData[];

        // for pregnancy and nbc_pnc
        const noRisk = getNumberOfSmsWithRisk(NO_UNDERSCORE_RISK, pregnancyAndNbcPncSmsData, RISK_LEVEL);
        const redAlert = getNumberOfSmsWithRisk(RED_ALERT, pregnancyAndNbcPncSmsData, RISK_LEVEL);
        const risk =
            getNumberOfSmsWithRisk(LOW, pregnancyAndNbcPncSmsData, RISK_LEVEL) +
            getNumberOfSmsWithRisk(HIGH, pregnancyAndNbcPncSmsData, RISK_LEVEL) +
            getNumberOfSmsWithRisk(RISK, pregnancyAndNbcPncSmsData, RISK_LEVEL);

        expect(noRisk).toBe(2);
        expect(redAlert).toBe(2);
        expect(risk).toBe(6);

        // for nutrition
        const inappropriateFeeding = getNumberOfSmsWithRisk(INAPPROPRIATELY_FED, nutritionSmsData, FEEDING_CATEGORY);
        const overweight = getNumberOfSmsWithRisk(OVERWEIGHT, nutritionSmsData, NUTRITION_STATUS);
        const stunting = getNumberOfSmsWithRisk(STUNTED, nutritionSmsData, GROWTH_STATUS);
        const wasting = getNumberOfSmsWithRisk(SEVERE_WASTING, nutritionSmsData, NUTRITION_STATUS);
        const normal = getNumberOfSmsWithRisk(NORMAL, nutritionSmsData, NUTRITION_STATUS);

        expect(inappropriateFeeding).toBe(8);
        expect(overweight).toBe(4);
        expect(stunting).toBe(8);
        expect(wasting).toBe(2);
        expect(normal).toBe(2);
    });
});
