import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import snapshotDiff from 'snapshot-diff';
import SideMenu from '..';
import { PREGNANCY } from '../../../../constants';

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
        const wrapper = mount(
            <Router history={history}>
                <SideMenu authenticated />
            </Router>,
        );
        /** client Collapse SubMenu renders correctly */
        expect(toJson(wrapper.find('Nav .side-collapse-nav').first())).toMatchSnapshot();
        wrapper.unmount();
    });

    it('manages state correctly', () => {
        const wrapper = mount(
            <Router history={history}>
                <SideMenu authenticated />
            </Router>,
        );

        expect(wrapper.find('SideMenu').state('collapsedModuleLabel')).toEqual('');

        wrapper.find(`ul#${PREGNANCY}`).simulate('click');
        expect(wrapper.find('SideMenu').state('collapsedModuleLabel')).toEqual(PREGNANCY);
        wrapper.unmount();
    });

    it('sets the collapsedModuleLabel correctly from clicks on parentNavs', () => {
        // clicking changes the collapsedModuleLabel state and collapses
        // nav to reveal child navigation

        const wrapper = mount(
            <Router history={history}>
                <SideMenu authenticated />)
            </Router>,
        );

        // starts with sub-menu as closed, not collapsed
        const clientChildNav = wrapper.find('div.collapse.show a[href="/clients"]');
        expect(clientChildNav.length).toEqual(0);
        const beforeClickWrapper = toJson(wrapper);

        // clicking on a parent nav changes the collapsedState for that navigation module
        const PregnancyNav = wrapper.find(`ul#${PREGNANCY}`);
        expect(PregnancyNav.length).toEqual(1);
        PregnancyNav.simulate('click');
        wrapper.update();
        const afterClickWrapper = toJson(wrapper);

        // isOpen value for collapsible div holding child navs changes from false to true
        expect(snapshotDiff(beforeClickWrapper, afterClickWrapper)).toMatchSnapshot('Everything');

        wrapper.unmount();
    });
});
