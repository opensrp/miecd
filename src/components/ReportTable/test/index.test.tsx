import ReportTable from '..';
import { Dictionary } from '@onaio/utils';
import { mountWithTranslations } from 'helpers/testUtils';
import { createBrowserHistory } from 'history';
import React from 'react';
import store from 'store';
import toJson from 'enzyme-to-json';
import { Provider } from 'react-redux';
import { Router } from 'react-router';

jest.mock('highcharts');

const history = createBrowserHistory();
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

jest.mock('react-select', () => ({ options, onChange }: Dictionary) => {
    function handleChange(event: Dictionary) {
        const option = options.find((option: Dictionary) => option.value === event.target?.value);
        onChange(option);
    }

    return (
        <select data-testid="select" onChange={handleChange}>
            {options.map(({ label, value }: Dictionary) => (
                <option key={value} value={value}>
                    {label}
                </option>
            ))}
        </select>
    );
});

describe('ReportTable', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('renders correctly', () => {
        const props = {
            ...locationProps,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ReportTable {...props} />
                </Router>
            </Provider>,
        );

        expect(toJson(wrapper.find('#filter-panel'))).toMatchSnapshot('Filter panel');
        expect(wrapper.find('#tableRow table')).toHaveLength(1);
        expect(wrapper.find('MotherChart')).toHaveLength(1);
        expect(wrapper.find('ChildChart')).toHaveLength(0);
    });
    it('renders child chart', () => {
        const props = {
            ...locationProps,
            isChild: true,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ReportTable {...props} />
                </Router>
            </Provider>,
        );

        expect(wrapper.find('MotherChart')).toHaveLength(0);
        expect(wrapper.find('ChildChart')).toHaveLength(1);
    });
});
