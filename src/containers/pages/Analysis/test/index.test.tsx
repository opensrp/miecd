import { PREGNANCY_MODULE, NBC_AND_PNC_MODULE, NUTRITION_MODULE } from '../../../../constants';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { mountWithTranslations } from 'helpers/testUtils';
import React from 'react';
import Analysis from '..';

describe('Analysis', () => {
    // eslint-disable-next-line jest/expect-expect
    it('must render without crashing', () => {
        shallow(<Analysis module={PREGNANCY_MODULE} />);
    });

    it('must render correctly nutrition', () => {
        const wrapper = mountWithTranslations(<Analysis module={NUTRITION_MODULE} />);
        expect(wrapper.find('div.analysis h2').text()).toMatchSnapshot();
        expect(toJson(wrapper.find('div.analysis iframe'))).toMatchSnapshot('Analysis iframe');
    });

    it('must render correctly pregnancy', () => {
        const wrapper = mountWithTranslations(<Analysis module={PREGNANCY_MODULE} />);
        expect(wrapper.find('div.analysis h2').text()).toMatchSnapshot();
        expect(toJson(wrapper.find('div.analysis iframe'))).toMatchSnapshot('Analysis iframe');
    });

    it('must render correctly NBC_AND_PNC', () => {
        const wrapper = mountWithTranslations(<Analysis module={NBC_AND_PNC_MODULE} />);
        expect(wrapper.find('div.analysis h2').text()).toMatchSnapshot();
        expect(toJson(wrapper.find('div.analysis iframe'))).toMatchSnapshot('Analysis iframe');
    });
});
