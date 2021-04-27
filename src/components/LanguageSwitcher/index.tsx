/** globe icon with a dropdown where users can select language */
import React from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Fragment } from 'react';

/** describes object representation of language options */
export type LanguageOptions<LanguageCodes extends string> = {
    [key in LanguageCodes]?: string;
};

interface LanguageSwitcherProps<LanguageCodes extends string> {
    allLanguageOptions: LanguageOptions<LanguageCodes>;
    supportedLanguages: LanguageCodes[];
    onLanguageChange?: (languageOptionKey: LanguageCodes) => void;
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
function getSupportedLanguageOptions<LanguageCodes extends string>(
    languageOptions: LanguageOptions<LanguageCodes>,
    supportedLanguages?: LanguageCodes[],
) {
    const supported: LanguageOptions<LanguageCodes> = {};
    const supportedLangIsDefined = supportedLanguages && supportedLanguages.length > 0;
    if (!supportedLangIsDefined) {
        return supported;
    }
    for (const languageCode in languageOptions) {
        if (supportedLanguages?.includes(languageCode)) {
            const code = languageCode;
            supported[code] = languageOptions[code];
        }
    }

    return supported;
}

/** globe icon ui that can be used to change the language of the application
 *
 * @param props - component props
 */
const LanguageSwitcher = <LanguageCodes extends string = ''>(props: LanguageSwitcherProps<LanguageCodes>) => {
    const { onLanguageChange, allLanguageOptions: fullLanguageOptions, supportedLanguages } = props;

    const supportedLanguageOptions = getSupportedLanguageOptions<LanguageCodes>(
        fullLanguageOptions,
        supportedLanguages,
    );

    const languageChangeHandler: React.MouseEventHandler<HTMLElement> = (event) => {
        const key = event?.currentTarget?.getAttribute('data-key') as LanguageCodes | null;
        if (key) {
            onLanguageChange?.(key);
        }
    };

    const LangMenu = (
        <Fragment>
            {Object.entries(supportedLanguageOptions).map(([languageCode, label]) => {
                return (
                    <DropdownItem data-key={languageCode} key={languageCode} onClick={languageChangeHandler}>
                        {label as string}
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
