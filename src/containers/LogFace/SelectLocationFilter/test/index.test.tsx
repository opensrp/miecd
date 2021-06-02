import { Dictionary } from '@onaio/utils/dist/types/types';
import toJson from 'enzyme-to-json';
import { mountWithTranslations } from 'helpers/testUtils';
import React from 'react';
import { RawOpenSRPHierarchy } from 'store/ducks/locationHierarchy/types';
import { generateJurisdictionTree } from 'store/ducks/locationHierarchy/utils';
import * as securityAuthenticate from 'store/ducks/tests/fixtures/securityAuthenticate.json';
import { SelectLocationFilter } from '..';

jest.mock('react-select', () => {
    const Select = ({ options, onChange, onInputChange }: Dictionary) => {
        function handleChange(event: Dictionary) {
            const option = options.find((option: Dictionary) => option.value === event.target.value);
            onChange(option);
        }
        function handleInputChange(event: Dictionary) {
            onInputChange(event.target.value);
        }

        return (
            <select data-testid="select" onChange={handleChange} onInput={handleInputChange}>
                {options.map(({ label, value }: Dictionary) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
        );
    };
    return Select;
});

describe('selectLocationFilter', () => {
    const userLocationTree = generateJurisdictionTree(securityAuthenticate.locations as unknown as RawOpenSRPHierarchy);
    const demoUserLocationId = 'd1865325-11e6-4e39-817b-e676c1affecf';

    it('works correctly', () => {
        const locationChangeMock = jest.fn();
        const props = {
            userLocationTree,
            userLocationId: demoUserLocationId,
            onLocationChange: locationChangeMock,
        };
        const wrapper = mountWithTranslations(<SelectLocationFilter {...props} />);

        // list option; should be 3, demo user is at national level and has access to only 3 provinces
        expect(toJson(wrapper.find('select'))).toMatchSnapshot('initial Options');
        expect((wrapper.find('Select').props() as Dictionary).closeMenuOnSelect).toBeFalsy();

        // simulate selection of one of provinces
        wrapper
            .find('select')
            .simulate('change', { target: { value: 'eccfe905-0e03-4188-98bc-22f141cccd0e', label: 'Kon Tum' } });

        // select now has the next set of options and menu is still open
        expect(toJson(wrapper.find('select'))).toMatchSnapshot('district Options');
        expect((wrapper.find('Select').props() as Dictionary).closeMenuOnSelect).toBeFalsy();

        // simulate selection of one of districts
        wrapper
            .find('select')
            .simulate('change', { target: { value: 'e1488a4b-d11f-463c-b20c-56d4fc190ab3', label: 'Đaklei' } });

        // select now has the next set of options and menu is still open
        expect(toJson(wrapper.find('select'))).toMatchSnapshot('commune Options');
        expect((wrapper.find('Select').props() as Dictionary).closeMenuOnSelect).toBeFalsy();

        // simulate selection of one of communes
        wrapper
            .find('select')
            .simulate('change', { target: { value: 'd2c63216-ac3c-499c-9688-94ede9308275', label: 'Đăk Pek' } });

        // select now has the next set of options and menu is still open
        expect(toJson(wrapper.find('select'))).toMatchSnapshot('village Options');
        expect((wrapper.find('Select').props() as Dictionary).closeMenuOnSelect).toBeFalsy();

        // simulate selection of one of communes
        wrapper
            .find('select')
            .simulate('change', { target: { value: '020d8cfd-a843-4405-956a-24a778806bc9', label: 'Thôn 14 A' } });

        // select now has the next set of options and menu is now closed on select
        expect(toJson(wrapper.find('select'))).toMatchSnapshot('still showing village Options');
        expect((wrapper.find('Select').props() as Dictionary).closeMenuOnSelect).toBeTruthy();

        expect(locationChangeMock).toHaveBeenCalledTimes(4);
        expect(locationChangeMock.mock.calls).toEqual([
            ['eccfe905-0e03-4188-98bc-22f141cccd0e'],
            ['e1488a4b-d11f-463c-b20c-56d4fc190ab3'],
            ['d2c63216-ac3c-499c-9688-94ede9308275'],
            ['020d8cfd-a843-4405-956a-24a778806bc9'],
        ]);
        wrapper.unmount();
    });

    it('test input filter', () => {
        // simulate searching behavior
        const props = {
            userLocationTree,
            userLocationId: demoUserLocationId,
            onLocationChange: () => void 0,
        };
        const wrapper = mountWithTranslations(<SelectLocationFilter {...props} />);

        // list option; should be 3, demo user is at national level and has access to only 3 provinces
        expect(toJson(wrapper.find('select'))).toMatchSnapshot('initial Options');
        expect((wrapper.find('Select').props() as Dictionary).closeMenuOnSelect).toBeFalsy();

        // expect(wrapper.find('Select').props()).toEqual();

        // target village 'Thôn 14 A'
        wrapper.find('select').simulate('input', {
            target: {
                value: 'Thôn 14',
            },
        });

        // check options
        expect(toJson(wrapper.find('select'))).toMatchSnapshot('options shown during search');

        // see what clearing does
        wrapper.find('select').simulate('input', {
            target: {
                value: '',
            },
        });

        // should show initial options
        expect(toJson(wrapper.find('select'))).toMatchSnapshot('and back to initial options');

        wrapper.unmount();
    });
});
