import { ConnectedMotherChart } from '..';
import { removeMotherData } from 'store/ducks/chartData';
import store from 'store';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';
import { act } from 'react-dom/test-utils';
import { motherChartFixture } from 'store/ducks/chartData/test/fixtures';
import React from 'react';
import { mountWithTranslations } from 'helpers/testUtils';

const history = createBrowserHistory();
jest.mock('highcharts');

const locationProps = {
    history,
    location: {
        hash: '',
        pathname: `chart`,
        search: '',
        state: {},
    },
    match: {
        isExact: true,
        params: { patient_id: '1002KL' },
        path: `chart`,
        url: `chart`,
    },
};

describe('connectedMotherChart', () => {
    afterEach(() => {
        jest.clearAllMocks();
        store.dispatch(removeMotherData);
    });

    it('makes the correct calls', async () => {
        const supersetFetchMock = jest.fn().mockRejectedValue(new Error('coughid'));
        const props = {
            ...locationProps,
            supersetService: supersetFetchMock,
        };

        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedMotherChart {...props} />
                </Router>
            </Provider>,
        );

        // has ripple
        expect(wrapper.find('Ripple')).toHaveLength(1);

        await act(async () => {
            await new Promise((res) => setImmediate(res));
            wrapper.update();
        });

        expect(wrapper.find('Ripple')).toHaveLength(0);
        expect(wrapper.text()).toMatchInlineSnapshot(`"Chart could not load, an error occurred. coughid"`);

        expect(supersetFetchMock).toHaveBeenCalledWith('18914', {
            adhoc_filters: [
                {
                    clause: 'WHERE',
                    comparator: '1002KL',
                    expressionType: 'SIMPLE',
                    operator: '==',
                    subject: 'patient_id',
                },
            ],
            row_limit: 2000,
        });
    });

    it('works okay', async () => {
        const supersetFetchMock = jest.fn().mockResolvedValueOnce(motherChartFixture);
        const props = {
            ...locationProps,
            supersetService: supersetFetchMock,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedMotherChart {...props} />
                </Router>
            </Provider>,
        );

        await act(async () => {
            await new Promise((res) => setImmediate(res));
            wrapper.update();
        });

        expect(wrapper.find('Chart').at(0).props()).toEqual({
            chartWrapperId: 'weight-chart-1',
            dataArray: {
                categories: ['February/2020', 'February/2020'],
                dataSeries: [{ data: [78, 44], name: 'weight' }],
            },
            legendString: 'Weight',
            title: 'Wight Monitoring',
            units: 'kg',
            yAxisLabel: 'weight',
        });
        expect(wrapper.find('Chart').at(1).props()).toEqual({
            chartWrapperId: 'blood-pressure',
            dataArray: {
                categories: ['February/2020'],
                dataSeries: [
                    { data: [118], name: 'systolic' },
                    { data: [78], name: 'diastolic' },
                ],
            },
            legendString: 'Blood pressure',
            title: 'Blood Pressure',
            units: '',
            yAxisLabel: 'Blood Pressure',
        });
    });
});
