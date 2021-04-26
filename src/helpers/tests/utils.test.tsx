import { getNumberSuffix, oAuthUserInfoGetter, parseMessage } from '../utils';
import { OpenSRPAPIResponse } from './fixtures';

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
});
