import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { mountWithTranslations } from 'helpers/testUtils';
import React from 'react';
import Analysis from '..';
import { SUPERSET_PREGNANCY_ANALYSIS_ENDPOINT } from '../../../../configs/env';

describe('Analysis', () => {
    // eslint-disable-next-line jest/expect-expect
    it('must render without crashing', () => {
        shallow(<Analysis endpoint={SUPERSET_PREGNANCY_ANALYSIS_ENDPOINT} />);
    });

    it('must render correctly', () => {
        const wrapper = mountWithTranslations(<Analysis endpoint={SUPERSET_PREGNANCY_ANALYSIS_ENDPOINT} />);
        expect(toJson(wrapper.find('div.analysis'))).toMatchSnapshot('Analysis snapshot');
    });
});
