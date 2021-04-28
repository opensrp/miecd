import { Dictionary } from '@onaio/utils';
import { mount, shallow } from 'enzyme';
import React from 'react';
import { LanguageCode, LanguageOptions, LanguageSwitcher } from '..';

describe('components/pages/languageSwitcher', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    // eslint-disable-next-line jest/expect-expect
    it('renders correctly', () => {
        shallow(<LanguageSwitcher />);
    });

    it('works correctly', () => {
        const languageOptions: LanguageOptions = {
            en: 'English',
            vi: 'Vietnamese',
        };

        const languageHandlerMock = jest.fn();

        const props = {
            onLanguageChange: languageHandlerMock,
            allLanguageOptions: languageOptions,
            supportedLanguages: ['en', 'vi'] as LanguageCode[],
        };

        const wrapper = mount(<LanguageSwitcher {...props} />);
        expect(wrapper.find('button')).toHaveLength(2);

        expect(wrapper.text()).toMatchInlineSnapshot(`"EnglishVietnamese"`);

        // choose language change to french
        wrapper.find('[data-key="en"]').first().simulate('click');
        expect(languageHandlerMock.mock.calls).toEqual([['en']]);

        wrapper.find('[data-key="vi"]').first().simulate('click');
        expect(languageHandlerMock.mock.calls).toEqual([['en'], ['vi']]);
        wrapper.update();
    });

    it('shows all options when supportedLangues is not defined', () => {
        const languageOptions: Dictionary = {
            en: 'English',
            fr: 'Français',
            ar: 'Arabic',
        };

        const props = {
            allLanguageOptions: languageOptions,
            supportedLanguages: [],
        };

        const wrapper = mount(<LanguageSwitcher {...props} />);
        expect(wrapper.find('button')).toHaveLength(0);

        expect(wrapper.text()).toMatchInlineSnapshot(`""`);
    });
});
