/** globe icon with a dropdown where users can select language */
import React from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Fragment } from 'react';
import { EN_LANGUAGE_CODE, VI_LANGUAGE_CODE } from '../../constants';

export type LanguageCode = typeof EN_LANGUAGE_CODE | typeof VI_LANGUAGE_CODE;

/** describes object representation of language options */
export type LanguageOptions = {
    [key in LanguageCode]?: string;
};

interface LanguageSwitcherProps {
    allLanguageOptions: LanguageOptions;
    supportedLanguages: LanguageCode[];
    onLanguageChange?: (languageOptionKey: LanguageCode) => void;
}

const defaultProps = {
    allLanguageOptions: {},
    supportedLanguages: [],
};

/** returns section of all the options that will be rendered as option in the ui
 *
 * @param languageOptions - a map of all allowed language options
 * @param supportedLanguages - an array of the keys for options that will be displayed
 */
function getSupportedLanguageOptions(languageOptions: LanguageOptions, supportedLanguages?: LanguageCode[]) {
    const supported: LanguageOptions = {};
    const supportedLangIsDefined = supportedLanguages && supportedLanguages.length > 0;
    if (!supportedLangIsDefined) {
        return supported;
    }
    for (const languageCode in languageOptions) {
        if (supportedLanguages?.includes(languageCode as LanguageCode)) {
            const code = languageCode as LanguageCode;
            supported[code] = languageOptions[code];
        }
    }

    return supported;
}

/** globe icon ui that can be used to change the language of the application
 *
 * @param props - component props
 */
const LanguageSwitcher = (props: LanguageSwitcherProps) => {
    const { onLanguageChange, allLanguageOptions: fullLanguageOptions, supportedLanguages } = props;

    const supportedLanguageOptions = getSupportedLanguageOptions(fullLanguageOptions, supportedLanguages);

    const languageChangeHandler: React.MouseEventHandler<HTMLElement> = (event) => {
        const key = event?.currentTarget?.getAttribute('data-key') as LanguageCode | null;
        if (key) {
            onLanguageChange?.(key);
        }
    };

    const LangMenu = (
        <Fragment>
            {Object.entries(supportedLanguageOptions).map(([languageCode, label]) => {
                return (
                    <DropdownItem data-key={languageCode} key={languageCode} onClick={languageChangeHandler}>
                        {label}
                    </DropdownItem>
                );
            })}
        </Fragment>
    );

    return (
        <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
                <FontAwesomeIcon icon={['fas', 'globe']} />
            </DropdownToggle>
            <DropdownMenu right>{LangMenu}</DropdownMenu>
        </UncontrolledDropdown>
    );
};

LanguageSwitcher.defaultProps = defaultProps;

export { LanguageSwitcher };
