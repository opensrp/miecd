import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from '@onaio/session-reducer';
import { LanguageCode, LanguageOptions, LanguageSwitcher } from 'components/LanguageSwitcher';
import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link, NavLink } from 'react-router-dom';
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
import { HOME_URL, LOGIN_URL, LOGOUT_URL } from '../../../constants';
import { headerShouldRender } from '../../../helpers/utils';
import { Dictionary } from '@onaio/utils';
import './Header.css';

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

        const languageOptions: LanguageOptions = {
            en: 'English',
            vi: 'Vietnamese',
        };

        /** handler called when language is changed
         *
         * @param languageCode - contains the languageOption.key of the selected language option
         */
        const languageChangeHandler = (languageCode: LanguageCode) => {
            i18n.changeLanguage(languageCode);
        };

        const languageSwitcherProps = {
            onLanguageChange: languageChangeHandler,
            allLanguageOptions: languageOptions,
            supportedLanguages: ['en', 'vi'] as LanguageCode[],
        };

        if (!headerShouldRender()) {
            return null;
        }

        return (
            <Navbar className="custom-navbar navbar-expand-sm">
                <NavbarBrand className="custom-navbar__brand">
                    <Link to={HOME_URL}>
                        <img src={logo} alt={WEBSITE_NAME} />
                        <img src={logo2} alt={WEBSITE_NAME} />
                    </Link>
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
                            <NavLink to={LOGIN_URL} className="nav-link" activeClassName="active">
                                {t('Login')}
                            </NavLink>
                        )}
                        <LanguageSwitcher {...languageSwitcherProps} />
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
