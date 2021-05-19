import {
    getWeightHeightDataSeries,
    getWeightDataSeries,
    getBloodPSeriesForChart,
    chunkByGravida,
    pregnancyOptionsFilter,
} from 'components/ReportTable';
import { singlePatientEvents } from './fixtures';

describe('ReportTable utils', () => {
    const sampleT = (t: string) => t;

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
