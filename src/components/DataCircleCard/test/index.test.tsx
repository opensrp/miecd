import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { removeFilterArgs } from 'store/ducks/sms_events';
import DataCircleCard from '..';
import { NUTRITION, PREGNANCY } from '../../../constants';
import { mountWithTranslations } from '../../../helpers/testUtils';
import store from '../../../store/index';
import * as smsEventsDucks from '../../../store/ducks/sms_events';

const history = createBrowserHistory();

describe('DataCircleCard', () => {
    afterEach(() => {
        store.dispatch(removeFilterArgs());
        jest.resetAllMocks();
    });
    it('must render correctly', () => {
        const props = { highRisk: 10, lowRisk: 10, noRisk: 10, title: 'test title' };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <DataCircleCard {...props} module={PREGNANCY} />
                </Router>
            </Provider>,
        );
        expect(toJson(wrapper.find('Card'))).toMatchSnapshot();
    });

    it('card title link works', () => {
        const filterArgsSpy = jest.fn();
        const props = {
            filterArgs: [filterArgsSpy],
            module: NUTRITION,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <DataCircleCard {...props} module={PREGNANCY} />
                </Router>
            </Provider>,
        );

        const cardTitleLink = wrapper.find('CardTitle Link');
        expect(toJson(cardTitleLink)).toMatchSnapshot('card title link');

        // simulate click on card title link
        cardTitleLink.simulate('click', { button: 0 });
        wrapper.update();
        expect(smsEventsDucks.getFilterArgs(store.getState())).toEqual([filterArgsSpy]);
        wrapper.unmount();
    });

    it('card body link works', () => {
        const filterArgsSpy = jest.fn();
        const props = {
            filterArgs: [filterArgsSpy],
            module: PREGNANCY,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <DataCircleCard {...props} module={PREGNANCY} />
                </Router>
            </Provider>,
        );

        const cardBodyLink = wrapper.find('CardBody Link').first();
        expect(toJson(cardBodyLink)).toMatchSnapshot('card title link');

        // simulate click on card title link
        cardBodyLink.simulate('click', { button: 0 });
        wrapper.update();
        expect(smsEventsDucks.getFilterArgs(store.getState())).toEqual([filterArgsSpy]);
        wrapper.unmount();
    });
});
