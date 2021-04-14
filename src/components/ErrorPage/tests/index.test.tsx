import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { ErrorPage } from '..';

describe('ErrorPage', () => {
    // eslint-disable-next-line jest/expect-expect
    it('renders without crashing', () => {
        mount(<ErrorPage />);
    });

    it('renders correctly', () => {
        const errorTitle = 'Error Title';
        const errorMessage = 'Error Message';
        const props = {
            title: errorTitle,
            message: errorMessage,
        };
        const wrapper = mount(<ErrorPage {...props} />);

        expect(toJson(wrapper)).toMatchSnapshot('full snapshot');

        expect(wrapper.text()).toMatchInlineSnapshot(`"An error occurredError TitleError Message"`);

        expect(wrapper.text().includes(errorTitle)).toBeTruthy();
        expect(wrapper.text().includes(errorMessage)).toBeTruthy();
    });
});
