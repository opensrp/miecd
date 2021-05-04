import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from '@onaio/session-reducer';
import { LanguageSwitcher } from 'components/LanguageSwitcher';
import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';
import {
    Collapse,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    UncontrolledDropdown,
} from 'reactstrap';
import logo from '../../../assets/images/logo.png';
import logo2 from '../../../assets/images/vietnam-moh.png';
import { WEBSITE_NAME } from '../../../configs/env';
import {
    ALL_LANGUAGE_OPTIONS,
    EN_LANGUAGE_CODE,
    HOME_URL,
    LOGIN_URL,
    LOGOUT_URL,
    VI_LANGUAGE_CODE,
} from '../../../constants';
import { Dictionary } from '@onaio/utils';
import './Header.css';
import { APP_LOGIN_URL } from 'configs/settings';

/** interface for Header state */
interface State {
    isOpen: boolean;
}

/** interface for HeaderProps */
export interface HeaderProps extends RouteComponentProps {
    authenticated: boolean;
    user: User;
    extraData: Dictionary;
}

/** default props for Header */
const defaultHeaderProps: Partial<HeaderProps> = {
    authenticated: false,
    extraData: {},
    user: {
        email: '',
        name: '',
        username: '',
    },
};

export type HeaderPropTypes = HeaderProps & WithTranslation;
export type LanguageCode = typeof EN_LANGUAGE_CODE | typeof VI_LANGUAGE_CODE;

/** The Header component */
export class HeaderComponent extends React.Component<HeaderPropTypes, State> {
    public static defaultProps = defaultHeaderProps;

    constructor(props: HeaderPropTypes) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false,
        };
    }

    public render() {
        const { i18n, t } = this.props;
        const { authenticated, user } = this.props;

        /** handler called when language is changed
         *
         * @param languageCode - contains the languageOption.key of the selected language option
         */
        const languageChangeHandler = (languageCode: LanguageCode) => {
            i18n.changeLanguage(languageCode);
        };

        const languageSwitcherProps = {
            onLanguageChange: languageChangeHandler,
            allLanguageOptions: ALL_LANGUAGE_OPTIONS,
            supportedLanguages: [EN_LANGUAGE_CODE, VI_LANGUAGE_CODE],
        };

        return (
            <Navbar className="custom-navbar navbar-expand-sm">
                <NavbarBrand to={HOME_URL} className="custom-navbar__brand">
                    <img src={logo} alt={WEBSITE_NAME} />
                    <img src={logo2} alt={WEBSITE_NAME} />
                </NavbarBrand>
                <NavbarToggler onClick={this.toggle} />
                <Collapse isOpen={false} navbar>
                    <Nav className="ml-auto" navbar>
                        {authenticated ? (
                            <UncontrolledDropdown nav inNavbar>
                                <DropdownToggle nav caret>
                                    <FontAwesomeIcon icon={['far', 'user']} /> {user.username}
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem>
                                        <NavLink to={LOGOUT_URL} className="nav-link" activeClassName="active">
                                            {t('Sign Out')}
                                        </NavLink>
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        ) : (
                            <NavLink to={APP_LOGIN_URL} className="nav-link" activeClassName="active">
                                {t('Login')}
                            </NavLink>
                        )}
                        <LanguageSwitcher<LanguageCode> {...languageSwitcherProps} />
                    </Nav>
                </Collapse>
            </Navbar>
        );
    }

    private toggle() {
        this.setState({ isOpen: !this.state.isOpen });
    }
}

const Header = withRouter(HeaderComponent);

export default withTranslation()(Header);
