import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faArrowLeft, faChartLine, faCog, faHome, faGlobe } from '@fortawesome/free-solid-svg-icons';
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
import { Toaster } from 'react-hot-toast';
import * as React from 'react';

library.add(faUser, faChartLine, faCog, faHome, faArrowLeft, faGlobe);

/** Main App component */
export const App = () => {
    return (
        <I18nextProvider i18n={i18n}>
            <div className="main-app-container">
                <Route
                    exact
                    path={LOGIN_URL}
                    // tslint:disable-next-line: jsx-no-lambda
                    render={(routeProps) => <CustomOauthLogin providers={providers} {...routeProps} />}
                />
                {/* tslint:enable jsx-no-lambda */}
                <ConnectedHeader />
                {headerShouldRender() && <ConnectedRoutes />}
                <Toaster />
            </div>
        </I18nextProvider>
    );
};

export default App;
