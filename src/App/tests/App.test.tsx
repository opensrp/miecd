import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import CustomOauthLogin from '../../components/CustomAuthLogin';
import store from '../../store';
import App from '../App';

const history = createBrowserHistory();

jest.mock('../../configs/env');

describe('App', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // eslint-disable-next-line jest/expect-expect
    it('renders without crashing', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);

        mount(
            <Provider store={store}>
                <Router history={history}>
                    <App />
                </Router>
            </Provider>,
            { attachTo: div },
        );
    });

    it('renders App correctly', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Router history={history}>
                    <App />
                </Router>
            </Provider>,
        );
        // should have a top header
        const headerWrapper = wrapper.find('HeaderComponent');
        expect(headerWrapper.length).toEqual(1);

        const customOathLoginChildren = wrapper.find(CustomOauthLogin).children();

        expect(toJson(customOathLoginChildren)).toMatchSnapshot();
        expect(wrapper.find('Toaster')).toHaveLength(1);
        wrapper.unmount();
    });
});
