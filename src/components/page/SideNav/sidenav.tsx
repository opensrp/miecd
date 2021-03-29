import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, NavItem } from 'reactstrap';
import './sidenav.css';

/** The side navigation component */
export class SidenavComponent extends React.Component {
    public render() {
        return (
            <div id="sidenav">
                <Nav className="flex-column" navbar>
                    <NavItem>
                        <NavLink to="/" className="nav-link navbar-inverse" activeClassName="active" id="link-font">
                            Home
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            to="/log-face"
                            className="nav-link navbar-inverse"
                            activeClassName="active"
                            id="link-font"
                        >
                            Log Face
                        </NavLink>
                    </NavItem>
                </Nav>
            </div>
        );
    }
}

export default SidenavComponent;
