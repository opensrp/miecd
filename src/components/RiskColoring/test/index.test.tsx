import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { mountWithTranslations } from '../../../helpers/testUtils';
import RiskColoring from '../index';

describe('RiskColoring', () => {
    // eslint-disable-next-line jest/expect-expect
    it('must render without crashing', () => {
        shallow(<RiskColoring />);
    });

    it('must show correct Risk level depending on the string passed as a prop', () => {
        let wrapper = mountWithTranslations(<RiskColoring risk="high" />);
        expect(toJson(wrapper.find('RiskColoring'))).toMatchSnapshot('hight_risk');
        wrapper = mountWithTranslations(<RiskColoring risk="low" />);
        expect(toJson(wrapper.find('RiskColoring'))).toMatchSnapshot('low_risk');
        wrapper = mountWithTranslations(<RiskColoring risk="red" />);
        expect(toJson(wrapper.find('RiskColoring'))).toMatchSnapshot('red_alert');
        wrapper = mountWithTranslations(<RiskColoring risk="not set" />);
        expect(toJson(wrapper.find('RiskColoring'))).toMatchSnapshot('not_set');
        wrapper = mountWithTranslations(<RiskColoring />);
        expect(toJson(wrapper.find('RiskColoring'))).toMatchSnapshot('default');
    });
});
