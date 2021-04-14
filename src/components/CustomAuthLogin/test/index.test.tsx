import toJson from 'enzyme-to-json';
import React from 'react';
import CustomOauthLogin from '..';
import { mountWithTranslations } from '../../../helpers/testUtils';
import { providers } from './fixtures';

describe('CustomOAuth login', () => {
    it('must render correctly', () => {
        const props = {
            providers,
        };
        const wrapper = mountWithTranslations(<CustomOauthLogin {...props} />);
        expect(toJson(wrapper.find('CustomOauthLogin'))).toMatchSnapshot();
        wrapper.unmount();
    });
});
