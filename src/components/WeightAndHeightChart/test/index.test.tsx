/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { Chart } from '..';
import store from '../../../store/index';
const history = createBrowserHistory();

const weights = {
    categories: ['20/2019', '8/2019', '28/2019'],
    dataSeries: [{ data: [10, 10, 9], name: 'Weights' }],
};

jest.mock('highcharts', () => {
    return {
        _esModule: true,
        chart: (...args: any[]) => {
            expect(JSON.stringify(args)).toEqual(
                '["wrapper-id",{"chart":{"type":"line","width":819.2},"legend":{"align":"right","layout":"vertical","verticalAlign":"middle"},"title":{"text":""},"tooltip":{"backgroundColor":"white","borderColor":"#DADCE0","borderRadius":10,"borderWidth":1,"shadow":{"color":"#D7D7E0","offsetX":0,"offsetY":2,"opacity":0.2,"width":8}},"subtitle":{"text":""},"yAxis":{"title":{"text":""}},"xAxis":{"categories":["undefined 2019","September 2019","undefined 2019"]},"series":[{"data":[10,10,9],"name":"x axis label"}],"responsive":{"rules":[{"chartOptions":{"legend":{"align":"center","layout":"horizontal","verticalAlign":"bottom"}},"condition":{"maxWidth":5000}}]}}]',
            );
        },
    };
});

const defaultProps = {
    chartWrapperId: 'wrapper-id',
    legendString: 'legend string',
    title: 'the title',
    units: 'kgs',
    xAxisLabel: 'x axis label',
};

describe('Chart', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    // eslint-disable-next-line jest/expect-expect
    it('must render without crashing', () => {
        shallow(<Chart dataArray={weights} {...defaultProps} />);
    });

    it('must render correctly', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Router history={history}>
                    <Chart dataArray={weights} {...defaultProps} />
                </Router>
            </Provider>,
        );
        expect(toJson(wrapper.find('#wrapper-id'))).toMatchSnapshot();
        wrapper.unmount();
    });
});
