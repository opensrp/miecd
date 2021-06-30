import { NBC_AND_PNC_MODULE, NUTRITION_MODULE, PREGNANCY_MODULE } from '../../../constants';
import toJson from 'enzyme-to-json';
import React from 'react';
import { mountWithTranslations } from '../../../helpers/testUtils';
import RiskColoring from '../index';
import { nutritionSmsFixtures, PregnancyReportFixture as pregnancyReportFixture } from 'store/ducks/tests/fixtures';

const nutritionSms = {
    ...nutritionSmsFixtures[0],
    feeding_category: 'appropriately fed',
    growth_status: 'stunted',
};

describe('RiskColoring', () => {
    it('renders correctly for nutrition module', () => {
        const wrapper = mountWithTranslations(<RiskColoring module={NUTRITION_MODULE} dataObject={nutritionSms} />);
        wrapper.find('RiskColoring .badge').forEach((badge) => {
            expect(toJson(badge)).toMatchSnapshot();
        });
    });

    it('renders correctly for pregnancy module', () => {
        const wrapper = mountWithTranslations(
            <RiskColoring module={PREGNANCY_MODULE} dataObject={pregnancyReportFixture[0]} />,
        );
        wrapper.find('RiskColoring .badge').forEach((badge) => {
            expect(toJson(badge)).toMatchSnapshot();
        });
    });

    it('renders correctly for nbc and pnc module', () => {
        const wrapper = mountWithTranslations(
            <RiskColoring module={NBC_AND_PNC_MODULE} dataObject={pregnancyReportFixture[1]} />,
        );
        wrapper.find('RiskColoring .badge').forEach((badge) => {
            expect(toJson(badge)).toMatchSnapshot();
        });
    });
});
