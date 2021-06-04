import { ConnectedChildChart } from '..';
import { removeMotherData } from 'store/ducks/chartData';
import store from 'store';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';
import { act } from 'react-dom/test-utils';
import { childChartFixture } from 'store/ducks/chartData/test/fixtures';
import React from 'react';
import { mountWithTranslations } from 'helpers/testUtils';

const history = createBrowserHistory();
jest.mock('highcharts');

jest.mock('../../../../configs/env');

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
        params: { patient_id: '100TTG' },
        path: `chart`,
        url: `chart`,
    },
};

describe('ConnectedChildChart', () => {
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
                    <ConnectedChildChart {...props} />
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
        expect(wrapper.text()).toMatchInlineSnapshot(`"Chart could not load, an error occurred."`);

        expect(supersetFetchMock).toHaveBeenCalledWith('childChartSlice', {
            adhoc_filters: [
                {
                    clause: 'WHERE',
                    comparator: '100TTG',
                    expressionType: 'SIMPLE',
                    operator: '==',
                    subject: 'patient_id',
                },
            ],
            row_limit: 2000,
        });
    });

    it('works okay', async () => {
        const supersetFetchMock = jest.fn().mockResolvedValueOnce(childChartFixture);
        const props = {
            ...locationProps,
            supersetService: supersetFetchMock,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedChildChart {...props} />
                </Router>
            </Provider>,
        );

        await act(async () => {
            await new Promise((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        expect(wrapper.find('Chart').props()).toEqual({
            chartWrapperId: 'child-nutrition-chart-1',
            dataArray: {
                categories: ['November/2019', 'November/2019'],
                dataSeries: [
                    { data: [8, 8.8], name: 'weight' },
                    { data: [67, 69], name: 'height' },
                ],
            },
            legendString: 'Weight and height',
            title: 'Weight and height tracking',
            units: 'cm',
            yAxisLabel: 'Weight and height',
        });
    });
});
