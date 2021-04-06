import toJson from 'enzyme-to-json';
import BasicInformation from '..';
import { mountWithTranslations } from '../../../helpers/testUtils';

const props = [
    { label: 'currentEdd', value: 'test edd' },
    { label: 'currentGravidity', value: 20 },
    { label: 'currentParity', value: 20 },
    { label: 'id', value: 'test' },
    { label: 'location', value: 'Test Location' },
    { label: 'previousPregnancyRisk', value: 'no risk' },
];

describe('BasicInformation', () => {
    it('must render correctly', () => {
        const wrapper = mountWithTranslations(<BasicInformation labelValuePairs={props} />);
        expect(toJson(wrapper.find('BasicInformation'))).toMatchSnapshot();
    });
});
