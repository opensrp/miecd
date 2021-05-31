import ReportTable from '..';
import { Dictionary } from '@onaio/utils';
import { mountWithTranslations } from 'helpers/testUtils';
import { createBrowserHistory } from 'history';
import React from 'react';
import store from 'store';
import toJson from 'enzyme-to-json';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { backDatedEvents } from './fixtures';
import { smsDataFixture } from '../../../store/ducks/tests/fixtures/index';
import { act } from 'react-dom/test-utils';

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

    it('works okay', async () => {
        const smsDataProps = smsDataFixture.filter((sms) => sms.anc_id.toLowerCase() === '1002lj');
        const smsData = [...smsDataProps, ...backDatedEvents];
        const props = {
            ...locationProps,
            singlePatientEvents: smsData,
            isChild: false,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ReportTable {...props} />
                </Router>
            </Provider>,
        );

        await act(async () => {
            await new Promise((r) => setImmediate(r));
            wrapper.update();
        });

        wrapper.find('table tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('initial current pregnancies');
        });

        expect(toJson(wrapper.find('select'))).toMatchSnapshot('pregnancy filter');

        // switch pregnancies
        wrapper.find('select').simulate('change', { target: { value: 0, name: 'pregnancy 1' } });
        wrapper.update();

        wrapper.find('table tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('after filter pregnancies');
        });
    });

    it('renders correctly', async () => {
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
        await act(async () => {
            await new Promise((r) => setImmediate(r));
            wrapper.update();
        });

        expect(toJson(wrapper.find('#filter-panel'))).toMatchSnapshot('Filter panel');
        expect(wrapper.find('#tableRow table')).toHaveLength(1);
        expect(wrapper.find('MotherChart')).toHaveLength(1);
        expect(wrapper.find('ChildChart')).toHaveLength(0);
    });
    it('renders child chart', async () => {
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

        await act(async () => {
            await new Promise((r) => setImmediate(r));
            wrapper.update();
        });

        expect(wrapper.find('MotherChart')).toHaveLength(0);
        expect(wrapper.find('ChildChart')).toHaveLength(1);
    });
});
