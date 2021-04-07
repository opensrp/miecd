import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import Home from '..';
import { mountWithTranslations } from '../../../../helpers/testUtils';

const history = createBrowserHistory();

describe('containers/pages/Home', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // eslint-disable-next-line jest/expect-expect
    it('renders without crashing', () => {
        shallow(
            <Router history={history}>
                <Home />
            </Router>,
        );
    });

    it('renders Home correctly', () => {
        const wrapper = mountWithTranslations(
            <Router history={history}>
                <Home />
            </Router>,
        );
        expect(toJson(wrapper.find('.home-main'))).toMatchSnapshot();
        wrapper.unmount();
    });
});
