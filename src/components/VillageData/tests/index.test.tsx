import { NBC_AND_PNC_WOMAN, NUTRITION, NBC_AND_PNC_CHILD, PREGNANCY } from '../../../constants';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import VillageData, { Props } from '..';
import { mountWithTranslations } from '../../../helpers/testUtils';
import store from '../../../store/index';
import {
    villageDataProps,
    pregnancyModuleData,
    nutritionModuleData,
    nbcPncChildModuleData,
    nbcPncMotherModuleData,
} from './villageDataPropsfixtures';
import MockDate from 'mockdate';

global.fetch = require('jest-fetch-mock');
MockDate.set('2021-04-12T19:31:00.000Z'); // 7-13-17 19:31 => Mersenne primes :)

const history = createBrowserHistory();

describe('components/VillageData', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // eslint-disable-next-line jest/expect-expect
    it('must render without crashing', () => {
        shallow(<VillageData />);
    });

    it('must render correctly with data', () => {
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <VillageData {...(villageDataProps as Props)} />
                </Router>
            </Provider>,
        );
        wrapper.find('tbody#body tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('VillageData with data');
        });
        wrapper.unmount();
    });

    it('pagination works correctly', () => {
        const props = {
            ...villageDataProps,
            module: NUTRITION,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <VillageData {...(props as Props)} />
                </Router>
            </Provider>,
        );

        expect(wrapper.find('.pagination-container').text()).toMatchInlineSnapshot(`"previous12next"`);

        // inspect entries shown on page 1
        wrapper.find('tbody#body tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('first Page');
        });

        // go to page 2
        const page2PaginationItem = wrapper.find('.pagination-container ul li').at(3);
        expect(toJson(page2PaginationItem)).toMatchSnapshot('paginationItem for page 2');

        page2PaginationItem.simulate('click');
        wrapper.update();

        // inspect entries shown on page 2
        wrapper.find('tbody#body tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('second Page');
        });
        wrapper.unmount();
    });

    it('works correctly for NUTRITION', () => {
        const props = {
            ...villageDataProps,
            module: NUTRITION,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <VillageData {...(props as Props)} />
                </Router>
            </Provider>,
        );

        expect(wrapper.find('.pagination-container').text()).toMatchInlineSnapshot(`"previous12next"`);

        wrapper.find('tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('Nutrition Page');
        });
        wrapper.unmount();
    });

    it('works correctly for PREGNANCY', () => {
        const props = {
            ...villageDataProps,
            module: PREGNANCY,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <VillageData {...(props as Props)} />
                </Router>
            </Provider>,
        );

        expect(wrapper.find('.pagination-container').text()).toMatchInlineSnapshot(`"previous12next"`);

        wrapper.find('tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('Pregnancy Page');
        });
        wrapper.unmount();
    });

    it('works correctly for NBC_AND_PNC_CHILD', () => {
        const props = {
            ...villageDataProps,
            module: NBC_AND_PNC_CHILD,
            current_level: 2,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <VillageData {...(props as Props)} />
                </Router>
            </Provider>,
        );

        expect(wrapper.find('.pagination-container').text()).toMatchInlineSnapshot(`"previous12next"`);

        wrapper.find('tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('NBC_AND_PNC_CHILD page');
        });
        wrapper.unmount();
    });

    it('works correctly for NBC_AND_PNC_WOMAN', () => {
        const props = {
            ...villageDataProps,
            module: NBC_AND_PNC_WOMAN,
        };
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <VillageData {...(props as Props)} />
                </Router>
            </Provider>,
        );

        expect(wrapper.find('.pagination-container').text()).toMatchInlineSnapshot(`"previous12next"`);

        wrapper.find('tr').forEach((tr) => {
            expect(tr.text()).toMatchSnapshot('nBC and PNC woman Page');
        });
        wrapper.unmount();
    });
});

describe('components/VillageData/pregnancyMapFunction', () => {
    it('must return the correct value given specific input', () => {
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <VillageData {...(villageDataProps as Props)} />
                </Router>
            </Provider>,
        );
        const instance = wrapper.find('VillageData').instance() as typeof VillageData;
        const tableRows = shallow(instance.pregnancyMapFunction(pregnancyModuleData));
        const tableData = tableRows.find('td[className="default-width"]');
        expect(tableData.length).toEqual(8);
        // expect Patient ID row to match Patient ID
        const PatientIDRow = tableData.at(0).text();
        expect(PatientIDRow).toMatchInlineSnapshot(`"101CN2"`);
    });
});

describe('components/VillageData/nutritionMapFunction', () => {
    it('must return the correct value given specific input', () => {
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <VillageData {...(villageDataProps as Props)} />
                </Router>
            </Provider>,
        );
        const instance = wrapper.find('VillageData').instance() as typeof VillageData;
        const tableRows = shallow(instance.nutritionMapFunction(nutritionModuleData));
        const tableData = tableRows.find('td[className="default-width"]');
        expect(tableData.length).toEqual(4);
        // expect Patient ID row to match Patient ID
        const PatientIDRow = tableData.at(0).text();
        expect(PatientIDRow).toMatchInlineSnapshot(`"100TPL"`);
    });
});

describe('components/VillageData/nbcAndPncChildMapFunction', () => {
    it('must return the correct value given specific input', () => {
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <VillageData {...(villageDataProps as Props)} />
                </Router>
            </Provider>,
        );
        const instance = wrapper.find('VillageData').instance() as typeof VillageData;
        const tableRows = shallow(instance.nbcAndPncChildMapFunction(nbcPncChildModuleData));
        const tableData = tableRows.find('td[className="default-width"]');
        expect(tableData.length).toEqual(6);
        // expect Patient ID row to match Patient ID
        const PatientIDRow = tableData.at(0).text();
        expect(PatientIDRow).toMatchInlineSnapshot(`"100T5T-20190920-01"`);
    });
});

describe('components/VillageData/nbcAndPncMotherMapFunction', () => {
    it('must return the correct value given specific input', () => {
        const wrapper = mountWithTranslations(
            <Provider store={store}>
                <Router history={history}>
                    <VillageData {...(villageDataProps as Props)} />
                </Router>
            </Provider>,
        );
        const instance = wrapper.find('VillageData').instance() as typeof VillageData;
        const tableRows = shallow(instance.nbcAndPncMotherMapFunction(nbcPncMotherModuleData));
        const tableData = tableRows.find('td[className="default-width"]');
        expect(tableData.length).toEqual(7);
        // expect Patient ID row to match Patient ID
        const PatientIDRow = tableData.at(0).text();
        expect(PatientIDRow).toMatchInlineSnapshot(`"100VNL"`);
    });
});
