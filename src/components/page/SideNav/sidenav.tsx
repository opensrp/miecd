import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Nav, NavItem } from 'reactstrap';
import './sidenav.css';

/** The side navigation component */
export class SidenavComponent extends React.Component<WithTranslation> {
    public render() {
        const { t } = this.props;
        return (
            <div id="sidenav">
                <Nav className="flex-column" navbar>
                    <NavItem>
                        <NavLink to="/" className="nav-link navbar-inverse" activeClassName="active" id="link-font">
                            {t('Home')}
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            to="/log-face"
                            className="nav-link navbar-inverse"
                            activeClassName="active"
                            id="link-font"
                        >
                            {t('Log Face')}
                        </NavLink>
                    </NavItem>
                </Nav>
            </div>
        );
    }
}

export default withTranslation()(SidenavComponent);
