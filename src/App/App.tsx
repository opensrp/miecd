import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faArrowLeft, faChartLine, faCog, faHome, faGlobe } from '@fortawesome/free-solid-svg-icons';
import ConnectedHeader from '../containers/ConnectedHeader';
import './App.css';
import ConnectedRoutes from './Routes';
import { I18nextProvider } from 'react-i18next';
import i18n from '../mls';
import { Toaster } from 'react-hot-toast';
import * as React from 'react';
import '@opensrp/team-assignment/dist/index.css';

library.add(faUser, faChartLine, faCog, faHome, faArrowLeft, faGlobe);

/** Main App component */
export const App = () => {
    return (
        <I18nextProvider i18n={i18n}>
            <div className="main-app-container">
                <ConnectedHeader />
                <ConnectedRoutes />
                <Toaster />
            </div>
        </I18nextProvider>
    );
};

export default App;
