import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import SideMenu from '..';
import { PREGNANCY } from '../../../../constants';
import { mountWithTranslations } from '../../../../helpers/testUtils';

const history = createBrowserHistory();

jest.mock('../../../../configs/env');

describe('components/page/SideMenu', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // eslint-disable-next-line jest/expect-expect
    it('renders without crashing', () => {
        shallow(
            <Router history={history}>
                <SideMenu authenticated />
            </Router>,
        );
    });

    it('renders side menu correctly', () => {
        const wrapper = mountWithTranslations(
            <Router history={history}>
                <SideMenu authenticated />
            </Router>,
        );
        /** client Collapse SubMenu renders correctly */
        expect(toJson(wrapper.find('Nav .side-collapse-nav').first())).toMatchSnapshot();
        wrapper.unmount();
    });

    it('manages state correctly', () => {
        const wrapper = mountWithTranslations(
            <Router history={history}>
                <SideMenu authenticated />
            </Router>,
        );

        expect(wrapper.find('SideMenu').state('collapsedModuleLabel')).toEqual('');

        wrapper.find('ul#Pregnancy').simulate('click');
        expect(wrapper.find('SideMenu').state('collapsedModuleLabel')).toEqual(PREGNANCY);
        wrapper.unmount();
    });

    it('sets the collapsedModuleLabel correctly from clicks on parentNavs', async () => {
        // clicking changes the collapsedModuleLabel state and collapses
        // nav to reveal child navigation

        const wrapper = mountWithTranslations(
            <Router history={history}>
                <SideMenu authenticated />)
            </Router>,
        );

        // how many parent navigationModules are initially collapsed
        expect(wrapper.find('div.collapse')).toHaveLength(7);
        expect(wrapper.find('div.collapse.show')).toHaveLength(0);
        expect(wrapper.find('SubMenu').at(1).find('Collapse').prop('isOpen')).toBeFalsy();

        // clicking on a parent nav changes the collapsedState for that navigation module
        const pregnancyNav = wrapper.find('div#sub-menu-Pregnancy Nav.side-collapse-nav');
        console.log(toJson(pregnancyNav));
        expect(pregnancyNav.length).toEqual(1);
        pregnancyNav.simulate('click');
        wrapper.update();

        wrapper.find('SubMenu').forEach((div) => expect(expect(div.text()).toMatchSnapshot('sideMenu link labels')));

        expect(wrapper.find('SubMenu').at(1).prop('collapsedModuleLabel')).toEqual('Pregnancy');

        expect(wrapper.find('SubMenu').at(1).find('Collapse').prop('isOpen')).toBeTruthy();

        wrapper.unmount();
    });
});
