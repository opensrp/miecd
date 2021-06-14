import { PatientDetailsReport, chunkByGravida, pregnancyOptionsFilter } from '..';
import { mountWithTranslations } from '../../../helpers/testUtils';
import { pregnancyReport1, pregnancyReports } from './fixtures';
import { Dictionary } from '@onaio/utils';
import React from 'react';
import { PregnancyReportFixture } from 'store/ducks/tests/fixtures';
import toJson from 'enzyme-to-json';
import { NutritionLogFaceSms } from 'store/ducks/sms_events';

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

describe('PatientDetailsReport', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('works okay', () => {
        const patientsReports = PregnancyReportFixture.filter(
            (sms) => sms.patient_id == '10063H',
        ) as NutritionLogFaceSms[];
        const props = {
            patientsReports,
            isChild: false,
        };
        const wrapper = mountWithTranslations(<PatientDetailsReport {...props} />);
        wrapper.find('table tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('initial current pregnancies');
        });
    });
    it('can switch pregnancies', () => {
        const patientsReports = PregnancyReportFixture.filter(
            (sms) => sms.patient_id == '10063H' || sms.patient_id === '101AVR',
        ) as NutritionLogFaceSms[];
        const props = {
            patientsReports,
            isChild: false,
        };
        const wrapper = mountWithTranslations(<PatientDetailsReport {...props} />);
        wrapper.find('table tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('initial current pregnancies');
        });
        // switch pregnancies
        expect(toJson(wrapper.find('select'))).toMatchSnapshot('select snapshot');
        wrapper.find('select').simulate('change', { target: { value: 1618905587899, name: 'pregnancy 1' } });
        wrapper.update();

        wrapper.find('table tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('after filter pregnancies');
        });
    });
});

describe('PatientDetailsReport utils', () => {
    const sampleT = (t: string) => t;

    it('able to group sms by pregnancy_id correctly', () => {
        const grouped = chunkByGravida(pregnancyReports);
        const expected = {
            [pregnancyReport1.pregnancy_id]: pregnancyReports,
        };
        expect(grouped).toEqual(expected);
    });
    it('pregnancyOptionsFilter', () => {
        const chunkedSms = chunkByGravida(pregnancyReports);
        const response = pregnancyOptionsFilter(chunkedSms, sampleT);
        expect(response).toEqual([{ label: 'Current pregnancy', value: '1618905587899' }]);
    });
});
