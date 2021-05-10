/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedHierarchicalDataTable from '..';
import { mountWithTranslations } from '../../../helpers/testUtils';
import { fetchLocations } from '../../../store/ducks/locations';
import { fetchSms } from '../../../store/ducks/sms_events';
import store from '../../../store/index';
import { smsSlice } from '../../LogFace/tests/fixtures';
import { communes, districts, provinces, villages, countryId } from './fixtures';

jest.mock('@fortawesome/react-fontawesome');

const history = createBrowserHistory();

describe('HierarchichalDataTable', () => {
    // eslint-disable-next-line jest/expect-expect
    it('renders without crashing', () => {
        shallow(
            <Provider store={store}>
                <ConnectedHierarchicalDataTable />
            </Provider>,
        );
    });

    it('renders correctly', () => {
        store.dispatch(fetchLocations(districts));
        store.dispatch(fetchLocations(provinces));
        store.dispatch(fetchLocations(communes));
        store.dispatch(fetchLocations(villages));
        store.dispatch(fetchSms(smsSlice));

        // mount with node_id == country id
        const countryProps = {
            match: {
                params: {
                    module: 'Pregnancy',
                    risk_highlighter: 'high_risk',
                    title: 'Total Pregnancies',
                    current_level: '0',
                    direction: 'down',
                    node_id: countryId,
                    permission_level: '0',
                    from_level: '0',
                },
            },
        };

        let wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedHierarchicalDataTable {...countryProps} />
                </Router>
            </Provider>,
        );

        // find Hanoi province in table
        const countryRow = wrapper.find('#body').find('tr.cursor-pointer').find('td[children="Hanoi"]');
        expect(countryRow).toHaveLength(1);

        // mount with node_id == province id for Hanoi
        const provinceProps = {
            match: {
                params: {
                    module: 'Pregnancy',
                    risk_highlighter: 'high_risk',
                    title: 'Total Pregnancies',
                    current_level: '1',
                    direction: 'down',
                    node_id: '78a12165-3c12-471f-8755-c96bac123292',
                    permission_level: '0',
                    from_level: '0',
                },
            },
        };

        // pass props in the partern /:risk_highlighter?/:title?/:current_level?/:direction?/:node_id?/:from_level?
        // hierarchicaldata/high-risk/156 Total Pregnancies/1/down/1
        wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedHierarchicalDataTable {...provinceProps} />
                </Router>
            </Provider>,
        );

        // find Tay Ho district in table
        const provinceRow = wrapper.find('#body').find('tr.cursor-pointer').find('td[children="Tay Ho District"]');
        expect(provinceRow).toHaveLength(1);

        // mount with node_id == district id for Tay Ho District
        const districtProps = {
            match: {
                params: {
                    module: 'Pregnancy',
                    risk_highlighter: 'high_risk',
                    title: 'Total Pregnancies',
                    current_level: '2',
                    direction: 'down',
                    node_id: '623b644d-a1f2-4c5e-b065-d60c0ae6501f',
                    permission_level: '0',
                    from_level: '1',
                },
            },
        };

        wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedHierarchicalDataTable {...districtProps} />
                </Router>
            </Provider>,
        );

        // find Yen Phu Commune in table
        const districtRow = wrapper.find('#body').find('tr.cursor-pointer').find('td[children="Yen Phu Commune"]');
        expect(districtRow).toHaveLength(1);

        // mount with node_id == commune id for Yen Phu Commune
        const communeProps = {
            match: {
                params: {
                    module: 'Pregnancy',
                    risk_highlighter: 'high_risk',
                    title: 'Total Pregnancies',
                    current_level: '3',
                    direction: 'down',
                    node_id: '46d98781-7cc4-4c28-8379-a3552a57acfe',
                    permission_level: '0',
                    from_level: '2',
                },
            },
        };

        wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedHierarchicalDataTable {...communeProps} />
                </Router>
            </Provider>,
        );

        // find Yen Phu Village in table
        const villageRow = wrapper.find('#body').find('tr').at(0).find('td[children="Yen Phu Village"]');
        expect(villageRow).toHaveLength(1);

        let props = {
            match: {
                params: {
                    current_level: 2,
                    direction: 'up',
                    from_level: 3,
                    module: 'pregnancy',
                    node_id: '13',
                    risk_highlighter: 'high_risk',
                    title: 'Total Pregnancies',
                } as any,
            },
        };
        wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedHierarchicalDataTable {...props} />
                </Router>
            </Provider>,
        );
        expect(toJson(wrapper.find('tbody'))).toMatchSnapshot('hierarchichalDataTable');

        props = {
            match: {
                params: {
                    current_level: 1,
                    direction: 'up',
                    from_level: 3,
                    module: 'pregnancy',
                    node_id: '13',
                    risk_highlighter: 'high_risk',
                    title: 'Total Pregnancies',
                } as any,
            },
        };
        wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedHierarchicalDataTable {...props} />
                </Router>
            </Provider>,
        );
        expect(toJson(wrapper.find('tbody'))).toMatchSnapshot('hierarchichalDataTable');

        props = {
            match: {
                params: {
                    current_level: 0,
                    direction: 'up',
                    from_level: 3,
                    module: 'pregnancy',
                    node_id: '13',
                    risk_highlighter: 'high_risk',
                    title: 'Total Pregnancies',
                } as any,
            },
        };
        wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedHierarchicalDataTable {...props} />
                </Router>
            </Provider>,
        );
        expect(toJson(wrapper.find('tbody'))).toMatchSnapshot('hierarchichalDataTable');

        props = {
            match: {
                params: {
                    current_level: 1,
                    direction: 'up',
                    from_level: 2,
                    module: 'pregnancy',
                    node_id: '13',
                    risk_highlighter: 'high_risk',
                    title: 'Total Pregnancies',
                } as any,
            },
        };
        wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedHierarchicalDataTable {...props} />
                </Router>
            </Provider>,
        );
        expect(toJson(wrapper.find('tbody'))).toMatchSnapshot('hierarchichalDataTable');
        props = {
            match: {
                params: {
                    current_level: 0,
                    direction: 'up',
                    from_level: 1,
                    module: 'pregnancy',
                    node_id: '13',
                    risk_highlighter: 'high_risk',
                    title: 'Total Pregnancies',
                } as any,
            },
        };
        wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedHierarchicalDataTable {...props} />
                </Router>
            </Provider>,
        );
        expect(toJson(wrapper.find('tbody'))).toMatchSnapshot('hierarchichalDataTable');
    });

    it("must show the no record message when there's no data to show for a commune", () => {
        const props = {
            match: {
                params: {
                    module: 'pregnancy',
                    risk_highlighter: 'high_risk',
                    title: 'Total Pregnancies',
                },
            },
        };

        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedHierarchicalDataTable {...props} />
                </Router>
            </Provider>,
        );

        history.push(
            '/pregnancy_compartments/hierarchicaldata/Pregnancy/no/21%20Total%20Pregnancies/3/down/6792a597-4549-4f5f-9720-3d05e8bda8a0/0',
        );
        expect(toJson(wrapper.find('.norecord'))).toMatchSnapshot('norecord');
    });

    it('must ensure the back button works correctly', () => {
        const props = {
            match: {
                params: {
                    module: 'pregnancy',
                    risk_highlighter: 'high_risk',
                    title: 'Total Pregnancies',
                },
            },
        };

        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedHierarchicalDataTable {...props} />
                </Router>
            </Provider>,
        );

        const mockFunction = jest.fn();
        window.history.go = mockFunction;
        wrapper.find('.back-page').simulate('click');
        expect(mockFunction).toBeCalledWith(-1);
    });

    it('shows friendly error if drill down level is unavailable', () => {
        // mount level 3 for commune node_id with no villages
        const props = {
            match: {
                params: {
                    module: 'Pregnancy',
                    risk_highlighter: 'all',
                    title: 'Total Pregnancies',
                    current_level: '3',
                    direction: 'down',
                    node_id: '18ee2dfd-8a59-412d-943f-b9fd10ca4209',
                    permission_level: '0',
                    from_level: '2',
                },
            },
        };

        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <ConnectedHierarchicalDataTable {...props} />
                </Router>
            </Provider>,
        );

        // expect to find the no rows tr and the error message
        expect(toJson(wrapper.find('#no-rows'))).toMatchSnapshot('error if drill down villages unavailable');
    });
});
