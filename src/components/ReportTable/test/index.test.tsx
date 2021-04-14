import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ReportTable, { convertToStringArray, getEventsPregnancyArray } from '..';
import { WEIGHT } from '../../../constants';
import { mountWithTranslations } from '../../../helpers/testUtils';
import { SmsData } from '../../../store/ducks/sms_events';
import {
    convertToStringArrayInput,
    convertToStringArrayInput2,
    convertToStringArrayOutput,
    convertToStringArrayOutput2,
    getEventsPregnancyArrayInput1,
    getEventsPregnancyArrayInput2,
    getEventsPregnancyArrayOutput1,
    getEventsPregnancyArrayOutput2,
    getPregnancyStringsArrayInput,
    getPregnancyStringsArrayOutput,
    getWeightsArrayInput1,
    getWeightsArrayInput2,
    getWeightsArrayOutput1,
    getWeightsArrayOutput2,
    reportTableProps,
    singlePatientEvents,
} from './fixtures';
import React from 'react';

jest.mock('highcharts');

describe('ReportTable', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // eslint-disable-next-line jest/expect-expect
    it('must render without crashing', () => {
        shallow(<ReportTable singlePatientEvents={[]} />);
    });

    it('must render correctly', () => {
        const wrapper = mountWithTranslations(<ReportTable singlePatientEvents={reportTableProps as SmsData[]} />);
        expect(toJson(wrapper.find('tbody'))).toMatchSnapshot();
    });
});

describe('ReportTable.getPregnancyStringArray()', () => {
    it('Must return the correct value given certain input and ReportTable having certain props', () => {
        const wrapper = mountWithTranslations(<ReportTable singlePatientEvents={singlePatientEvents as SmsData[]} />);
        const instance = wrapper.find('ReportTable').instance() as ReportTable;
        expect(instance.getPregnancyStringArray(getPregnancyStringsArrayInput)).toEqual(getPregnancyStringsArrayOutput);
    });
});

describe('ReportTable.getWeightsArray()', () => {
    it('Must return the correct value given certain input and ReportTable having certain props', () => {
        const wrapper = mountWithTranslations(<ReportTable singlePatientEvents={singlePatientEvents as SmsData[]} />);
        const instance = wrapper.find('ReportTable').instance() as ReportTable;
        expect(instance.getWeightsArray(getWeightsArrayInput1, WEIGHT)).toEqual(getWeightsArrayOutput1);
        expect(instance.getWeightsArray(getWeightsArrayInput2, WEIGHT)).toEqual(getWeightsArrayOutput2);
    });
});

describe('convertToStringArray()', () => {
    it('must return the correct value for the provided input', () => {
        expect(convertToStringArray(convertToStringArrayInput2)).toEqual(convertToStringArrayOutput2);
        expect(convertToStringArray(convertToStringArrayInput)).toEqual(convertToStringArrayOutput);
    });
});

describe('getEventsPregnancyArray()', () => {
    it('must return the correct value for the provided input', () => {
        expect(getEventsPregnancyArray(getEventsPregnancyArrayInput1 as SmsData[], false)).toEqual(
            getEventsPregnancyArrayOutput1,
        );
        expect(getEventsPregnancyArray(getEventsPregnancyArrayInput2 as SmsData[], false)).toEqual(
            getEventsPregnancyArrayOutput2,
        );
    });
});
