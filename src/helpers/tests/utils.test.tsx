import {
    formatAge,
    getNumberSuffix,
    oAuthUserInfoGetter,
    parseMessage,
    sortByEventDate,
    fetchSupersetData,
    fetchOpenSrpData,
    getLocationId,
    getFilterFunctionAndLocationLevel,
} from '../utils';
import { OpenSRPAPIResponse } from './fixtures';
import fetchMock from 'fetch-mock';
import store from '../../store/index';
import { authenticateUser } from '@onaio/session-reducer';
import { CompartmentSmsTypes } from '../../store/ducks/sms_events';
import { authorizeSuperset } from '../../store/ducks/superset';
import {
    villages,
    communes,
    districts,
    provinces,
    userLocationDetails,
    pregnancySmsData,
    nutritionSmsData,
    nbcPncSmsData,
    userUUID,
    securityAuthenticate,
} from '../../containers/HierarchichalDataTable/test/fixtures';

jest.mock('@onaio/gatekeeper', () => {
    const actual = jest.requireActual('@onaio/gatekeeper');
    return {
        ...actual,
        getOpenSRPUserInfo: () => 'Called by Opensrp',
        getOnadataUserInfo: () => 'Called by Onaio',
    };
});

describe('src/helpers', () => {
    it('oauth User Info getter', () => {
        let response = oAuthUserInfoGetter(OpenSRPAPIResponse);
        expect(response).toEqual('Called by Opensrp');

        const onaApiResponse = {
            ...OpenSRPAPIResponse,
            oAuth2Data: {
                state: 'onadata',
            },
        };

        response = oAuthUserInfoGetter(onaApiResponse);
        expect(response).toEqual('Called by Onaio');
    });

    it('get Number Suffix', () => {
        let response = getNumberSuffix(0);
        expect(response).toEqual('th');

        response = getNumberSuffix(1);
        expect(response).toEqual('st');

        response = getNumberSuffix(2);
        expect(response).toEqual('nd');

        response = getNumberSuffix(3);
        expect(response).toEqual('rd');

        response = getNumberSuffix(45);
        expect(response).toEqual('th');
    });

    it('able to reformat dates in smsEvent.message', () => {
        const message = 'Date of death = 23-04-2021 Location of Death = District hospitals/CDC Contact = ';
        const result = parseMessage(message);
        expect(result).toMatchInlineSnapshot(`
            <ul>
              <li>
                Date of death : 23/04/2021 Location of Death = District hospitals/CDC Contact =
              </li>
            </ul>
        `);
    });

    it('able to add units when parsing smsEvent.message', () => {
        const message1 =
            'Child DOB = 23-04-2021 \nChild Gender = NU \nDelivery Location =  \nNewborn Symptoms = Lack of movement \nChild Weight = 4.9 \nChild Length = 50 \nChild Risk =  \nBreastfeeding = No breastfeeding within 1 hour\nMother Symptoms = Bu00ecnh thu01b0u1eddng';
        const message2 =
            'MUAC = 6.7 \nWeight = 27 \nHeight = 40 \nFeeding Status =  \nSupplements = Micronutrients Supplement: Yes\nMUAC Classification = Severe Acute Malnutrition';
        const result1 = parseMessage(message1);
        const result2 = parseMessage(message2);
        expect(result1).toMatchSnapshot('Add units');
        expect(result2).toMatchSnapshot('Add units');
    });

    it('gets and formats age correctly', () => {
        let response = formatAge('1m 29d', (t: string) => t);
        expect(response).toEqual('1 age.months');
        response = formatAge('0m 29d', (t: string) => t);
        expect(response).toEqual('29 age.days');
        response = formatAge('0m 0d', (t: string) => t);
        expect(response).toEqual('0 age.days');
        response = formatAge('2y 0m 0d', (t: string) => t);
        expect(response).toEqual('24 age.months');
        response = formatAge('3y 9m 0d', (t: string) => t);
        expect(response).toEqual('3 age.years');
    });

    it('sorts by event dates correctly', () => {
        const mockEvent1 = { event_date: '2021-04-27T15:19:04.173000' };
        const mockEvent2 = { event_date: '2020-04-27T15:19:04.173000' };
        const mockEvent3 = { event_date: '2022-04-27T15:19:04.173000' };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const events = [mockEvent1, mockEvent2, mockEvent3] as any;

        const response = sortByEventDate(events);
        expect(response).toEqual([
            { event_date: '2022-04-27T15:19:04.173000' },
            { event_date: '2021-04-27T15:19:04.173000' },
            { event_date: '2020-04-27T15:19:04.173000' },
        ]);
    });

    it('gets location id of logged in user', () => {
        // uuid corresponding to vietnam country
        const userLocationId = getLocationId(userLocationDetails.data.records, userUUID);
        // expect vietnam country id
        expect(userLocationId).toMatchInlineSnapshot(`"d1865325-11e6-4e39-817b-e676c1affecf"`);

        // random uuid
        const randomUserLocationId = getLocationId(
            userLocationDetails.data.records,
            'random-515ad0e9-fccd-4cab-8861-0ef3ecb831e0',
        );
        // expect empty string (no matching id)
        expect(randomUserLocationId).toMatchInlineSnapshot(`""`);
    });

    it('calculates filter function and location level for logged in user', () => {
        // get location level and location filter function
        // user location id from previous test (vietnam country)
        const { locationLevel, locationFilterFunction } = getFilterFunctionAndLocationLevel(
            'd1865325-11e6-4e39-817b-e676c1affecf',
            [villages.data.records, districts.data.records, communes.data.records, villages.data.records],
        );
        // expect level 0 (country - shows countries provinces)
        expect(locationLevel).toMatchInlineSnapshot(`0`);
        // faux filter function allowing everything through (for level country)
        expect(locationFilterFunction.toString()).toMatchInlineSnapshot(`"() => true"`);
    });
});

describe('src/helpers/utils.tsx', () => {
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

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
        fetchMock.restore();
    });

    it('fetches slices from superset', async () => {
        // pregnancy, nbcPnc, Nutrition sms slice
        fetchMock
            .get(`https://somesuperseturl.org/superset/slice_json/6`, pregnancySmsData)
            .get(`https://somesuperseturl.org/superset/slice_json/7`, nbcPncSmsData)
            .get(`https://somesuperseturl.org/superset/slice_json/8`, nutritionSmsData);

        // location slices
        fetchMock
            .get(`https://somesuperseturl.org/superset/slice_json/1`, villages)
            .get(`https://somesuperseturl.org/superset/slice_json/2`, communes)
            .get(`https://somesuperseturl.org/superset/slice_json/3`, districts)
            .get(`https://somesuperseturl.org/superset/slice_json/4`, provinces);

        // userLocations slice
        fetchMock.get(`https://somesuperseturl.org/superset/slice_json/5`, userLocationDetails);

        // fetch pregnancy,nbcPnc,Nutrition
        const pregnancyResp = await fetchSupersetData<CompartmentSmsTypes>('6');
        const nbcPncResp = await fetchSupersetData<CompartmentSmsTypes>('7');
        const nutritionResp = await fetchSupersetData<CompartmentSmsTypes>('8');

        expect(pregnancyResp).toMatchObject(pregnancySmsData.data.records);
        expect(nbcPncResp).toMatchObject(nbcPncSmsData.data.records);
        expect(nutritionResp).toMatchObject(nutritionSmsData.data.records);

        // fetch villages,communes,districts,provinces
        const villagesResp = await fetchSupersetData<CompartmentSmsTypes>('1');
        const communesResp = await fetchSupersetData<CompartmentSmsTypes>('2');
        const districtsResp = await fetchSupersetData<CompartmentSmsTypes>('3');
        const provincesResp = await fetchSupersetData<CompartmentSmsTypes>('4');

        expect(villagesResp).toMatchObject(villages.data.records);
        expect(communesResp).toMatchObject(communes.data.records);
        expect(districtsResp).toMatchObject(districts.data.records);
        expect(provincesResp).toMatchObject(provinces.data.records);

        // fetch userLocationDetails
        const userLocationDetailsResp = await fetchSupersetData<CompartmentSmsTypes>('5');
        expect(userLocationDetailsResp).toMatchObject(userLocationDetails.data.records);
    });

    it('fetches superset auth data', async () => {
        fetchMock.get(`https://someopensrpbaseurl/opensrp/security/authenticate/`, securityAuthenticate);
        const supersetAuthData = await fetchOpenSrpData('');
        expect(supersetAuthData).toMatchObject(supersetAuthData);
    });
});
