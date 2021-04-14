import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faArrowLeft, faChartLine, faCog, faHome } from '@fortawesome/free-solid-svg-icons';
import React, { Component } from 'react';
import { Route } from 'react-router';
import { providers } from '../configs/settings';
import { LOGIN_URL } from '../constants';
import ConnectedHeader from '../containers/ConnectedHeader';
import { headerShouldRender } from '../helpers/utils';
import './App.css';
import CustomOauthLogin from '../components/CustomAuthLogin';
import ConnectedRoutes from './Routes';
import { I18nextProvider } from 'react-i18next';
import i18n from '../mls';

library.add(faUser, faChartLine, faCog, faHome, faArrowLeft);
/** Main App component */
class App extends Component {
    public render() {
        return (
            <I18nextProvider i18n={i18n}>
                <div className="main-app-container">
                    {/* tslint:enable jsx-no-lambda */}
                    <Route
                        exact
                        path={LOGIN_URL}
                        // tslint:disable-next-line: jsx-no-lambda
                        render={(routeProps) => <CustomOauthLogin providers={providers} {...routeProps} />}
                    />
                    {/* tslint:enable jsx-no-lambda */}
                    <ConnectedHeader />
                    {headerShouldRender() && <ConnectedRoutes />}
                </div>
            </I18nextProvider>
        );
    }
}

export default App;
