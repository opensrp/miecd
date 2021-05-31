import { getWeightHeightDataSeries, getWeightDataSeries, getBloodPSeriesForChart } from '../utils';
import { sampleMotherChartData, sampleChildChartData } from './fixtures';

describe('ReportTable utils', () => {
    const sampleT = (t: string) => t;

    it('get weight and height series', () => {
        let response = getWeightHeightDataSeries(sampleChildChartData, sampleT);
        expect(response).toEqual({
            categories: ['November/2019', 'November/2019'],
            dataSeries: [
                { data: [9, 9], name: 'weight' },
                { data: [64, 64], name: 'height' },
            ],
        });
        response = getWeightDataSeries(sampleMotherChartData, sampleT);
        expect(response).toEqual({
            categories: ['November/2019', 'November/2019'],
            dataSeries: [{ data: [80, 80], name: 'weight' }],
        });
    });
    it('get blood pressure data series', () => {
        const response = getBloodPSeriesForChart(sampleMotherChartData, sampleT);
        expect(response).toEqual({
            categories: ['November/2019', 'November/2019'],
            dataSeries: [
                { data: [129, 118], name: 'systolic' },
                { data: [78, 78], name: 'diastolic' },
            ],
        });
    });
});
