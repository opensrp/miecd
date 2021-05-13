import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ReportTable, {
    chunkByGravida,
    filterEventsByType,
    getWeightHeightDataSeries,
    getBloodPSeriesForChart,
    pregnancyOptionsFilter,
    getWeightDataSeries,
} from '..';
import { mountWithTranslations } from '../../../helpers/testUtils';
import { backDatedEvents, singlePatientEvents } from './fixtures';
import { smsDataFixture } from '../../../store/ducks/tests/fixtures/index';
import { Dictionary } from '@onaio/utils';
import React from 'react';

jest.mock('highcharts');

jest.mock('react-select', () => ({ options, onChange }: Dictionary) => {
    function handleChange(event: Dictionary) {
        const option = options.find((option: Dictionary) => option.value === event.target?.value);
        onChange(option);
    }

    return (
        <select data-testid="select" onChange={handleChange}>
            {options.map(({ label, value }: Dictionary) => (
                <option key={value} value={value}>
                    {label}
                </option>
            ))}
        </select>
    );
});
describe('ReportTable', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // eslint-disable-next-line jest/expect-expect
    it('must render without crashing', () => {
        shallow(<ReportTable singlePatientEvents={[]} />);
    });

    it('works okay', () => {
        const smsDataProps = smsDataFixture.filter((sms) => sms.anc_id.toLowerCase() === '1002lj');
        const smsData = [...smsDataProps, ...backDatedEvents];
        const props = {
            singlePatientEvents: smsData,
            isChild: false,
        };
        const wrapper = mountWithTranslations(<ReportTable {...props} />);
        wrapper.find('table tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('initial current pregnancies');
        });

        expect(wrapper.find('Chart').at(0).props()).toEqual({
            chartWrapperId: 'weight-chart-1',
            dataArray: { categories: ['September/2019'], dataSeries: [{ data: [54], name: 'weight' }] },
            legendString: 'Weight',
            title: 'Weight Monitoring',
            units: 'kg',
            yAxisLabel: 'weight',
        });
        expect(wrapper.find('Chart').at(1).props()).toEqual({
            chartWrapperId: 'blood-pressure',
            dataArray: {
                categories: ['September/2018'],
                dataSeries: [
                    { data: [123], name: 'systolic' },
                    { data: [78], name: 'diastolic' },
                ],
            },
            legendString: 'Blood pressure',
            title: 'Blood Pressure',
            units: '',
            yAxisLabel: 'Blood Pressure',
        });

        expect(toJson(wrapper.find('select'))).toMatchSnapshot('pregnancy filter');

        // switch pregnancies
        wrapper.find('select').simulate('change', { target: { value: 0, name: 'pregnancy 1' } });
        wrapper.update();

        wrapper.find('table tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('after filter pregnancies');
        });
        expect(wrapper.find('Chart').at(0).props()).toEqual({
            chartWrapperId: 'weight-chart-1',
            dataArray: { categories: ['March/2020'], dataSeries: [{ data: [78], name: 'weight' }] },
            legendString: 'Weight',
            title: 'Weight Monitoring',
            units: 'kg',
            yAxisLabel: 'weight',
        });
        expect(wrapper.find('Chart').at(1).props()).toEqual({
            chartWrapperId: 'blood-pressure',
            dataArray: {
                categories: ['March/2020'],
                dataSeries: [
                    { data: [120], name: 'systolic' },
                    { data: [80], name: 'diastolic' },
                ],
            },
            legendString: 'Blood pressure',
            title: 'Blood Pressure',
            units: '',
            yAxisLabel: 'Blood Pressure',
        });
    });
});

describe('ReportTable utils', () => {
    const sampleT = (t: string) => t;
    it('filter events by type', () => {
        let response = filterEventsByType(singlePatientEvents, true);
        expect(response.map((x) => x.event_id)).toEqual(['1569576788502']);
        response = filterEventsByType(singlePatientEvents, false);
        expect(response.map((x) => x.event_id)).toEqual(['1569575715416', '1569575947489']);
    });

    it('get weight and height series', () => {
        let response = getWeightHeightDataSeries(singlePatientEvents, sampleT);
        expect(response).toEqual({
            categories: ['September/2019', 'September/2019', 'September/2019'],
            dataSeries: [
                { data: [2, 78, 2], name: 'weight' },
                { data: [48, 165, 48], name: 'height' },
            ],
        });
        response = getWeightDataSeries(singlePatientEvents, sampleT);
        expect(response).toEqual({
            categories: ['September/2019', 'September/2019', 'September/2019'],
            dataSeries: [{ data: [2, 78, 2], name: 'weight' }],
        });
    });
    it('get blood pressure data series', () => {
        const response = getBloodPSeriesForChart(singlePatientEvents, sampleT);
        expect(response).toEqual({
            categories: ['September/2019', 'September/2019', 'September/2019'],
            dataSeries: [
                { data: [120, 118, 118], name: 'systolic' },
                { data: [80, 78, 78], name: 'diastolic' },
            ],
        });
    });
    it('pregnancyOptionsFilter', () => {
        const chunkedSms = chunkByGravida(singlePatientEvents);
        const response = pregnancyOptionsFilter(chunkedSms, sampleT);
        expect(response).toEqual([
            { label: 'pregnancy 1', value: 0 },
            { label: 'Current Pregnancy', value: 1 },
        ]);
    });
});
