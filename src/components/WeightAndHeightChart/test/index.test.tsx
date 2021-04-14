/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import * as Highcharts from 'highcharts';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { act } from 'react-dom/test-utils';
import WeightAndHeightChart from '..';
import store from '../../../store/index';
import { WeightMonthYear } from '../../ReportTable';
import { chartArgument } from './fixtures';

const history = createBrowserHistory();

const weights = [
    {
        month: 20,
        weight: 10,
        year: 2019,
    },
    {
        month: 8,
        weight: 10,
        year: 2019,
    },
    {
        month: 28,
        weight: 9,
        year: 2019,
    },
] as WeightMonthYear[];

const defaultProps = {
    chartWrapperId: 'wrapper-id',
    legendString: 'legend string',
    title: 'the title',
    units: 'kgs',
    xAxisLabel: 'x axis label',
};

describe('WeightAndHeightChart', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    // eslint-disable-next-line jest/expect-expect
    it('must render without crashing', () => {
        shallow(<WeightAndHeightChart weights={weights} {...defaultProps} />);
    });

    it('must render correctly', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Router history={history}>
                    <WeightAndHeightChart weights={weights} {...defaultProps} />
                </Router>
            </Provider>,
        );
        expect(toJson(wrapper.find('#wrapper-id'))).toMatchSnapshot();
        wrapper.unmount();
    });

    it('calls hicharts.chart with the correct arguments', async () => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        // eslint-disable-next-line @typescript-eslint/ban-types
        const customTimeout = (fun: Function) => {
            fun();
        };
        const actualTimeout = window.setTimeout;
        (window as any).setTimeout = customTimeout;

        const chartMock = jest.fn();
        (Highcharts as any).chart = chartMock;

        const wrapper = mount(
            <Provider store={store}>
                <Router history={history}>
                    <WeightAndHeightChart weights={weights} {...defaultProps} />
                </Router>
            </Provider>,
            { attachTo: div },
        );

        await act(async () => {
            await new Promise((resolve) => setImmediate(resolve));
        });

        expect(JSON.stringify(chartMock.mock.calls)).toEqual(chartArgument);

        (window as any).setTimeout = actualTimeout;
        wrapper.unmount();
    });
});
