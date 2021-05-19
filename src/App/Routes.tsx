import React from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import ConnectedPrivateRoute from '@onaio/connected-private-route';
import { ConnectedLogout, ConnectedOauthCallback, LogoutProps } from '@onaio/gatekeeper';
import { isAuthenticated } from '@onaio/session-reducer';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { Route, RouteComponentProps, Switch } from 'react-router';
import { LastLocationProvider } from 'react-router-last-location';
import Loading from '../components/page/Loading';
import SideMenu from '../components/page/SideMenu';
import {
    NBC_AND_PNC_ANALYSIS_ENDPOINT,
    OPENSRP_LOGOUT_URL,
    SUPERSET_PREGNANCY_ANALYSIS_ENDPOINT,
} from '../configs/env';
import { providers } from '../configs/settings';
import {
    CHILD_PATIENT_DETAIL_URL,
    HIERARCHICAL_DATA_URL,
    LOGOUT_URL,
    NBC_AND_PNC_ANALYSIS_URL,
    NBC_AND_PNC_COMPARTMENTS_URL,
    NBC_AND_PNC_LOGFACE_URL,
    NBC_AND_PNC_MODULE,
    NBC_AND_PNC_URL,
    NUTRITION_ANALYSIS_URL,
    NUTRITION_COMPARTMENTS_URL,
    NUTRITION_LOGFACE_URL,
    NUTRITION_MODULE,
    NUTRITION_URL,
    PATIENT_DETAIL_URL,
    PREGNANCY_ANALYSIS_URL,
    PREGNANCY_COMPARTMENTS_URL,
    PREGNANCY_LOGFACE_URL,
    PREGNANCY_MODULE,
    PREGNANCY_URL,
    PREGNANCY,
    NUTRITION,
    NBC_AND_PNC,
} from '../constants';
import Compartments from '../containers/Compartments';
import ConnectedHierarchicalDataTable from '../containers/HierarchichalDataTable';
import ConnectedLogFace from '../containers/LogFace';
import Analysis from '../containers/pages/Analysis';
import Home from '../containers/pages/Home';
import ModuleHome from '../containers/pages/ModuleHome';
import ConnectedPatientDetails from '../containers/PatientDetails';
import { headerShouldRender, oAuthUserInfoGetter } from '../helpers/utils';
import './App.css';
import { Trans, useTranslation } from 'react-i18next';

library.add(faUser);

const mapStateToProps = (state: Partial<Store>) => {
    return {
        authenticated: isAuthenticated(state),
    };
};

export interface RoutesProps {
    authenticated: boolean;
}

export const Routes = (props: RoutesProps) => {
    const { authenticated } = props;
    const { t } = useTranslation();
    const NBC_AND_PNC_DASHBOARD_WELCOME = t('Welcome to Newborn and Postnatal Care');
    const NUTRITION_DASHBOARD_WELCOME = t('Welcome to Nutrition Care');
    const PREGNANCY_DASHBOARD_WELCOME = t('Welcome to the pregnancy dashboard');
    const PREGNANCY_DESCRIPTION = (
        <Trans>
            This dashboard displays information collected from MIECD Viet Nam Pregnancy Module for patients in your
            geographical location.&nbsp;
            <span className="font-italic">
                The module covers the whole pregnancy period from conception to delivery and includes Pregnancy
                Registration, ANC visits, Birth/Death reports, Risk Reports, Risk alerts and Response reports.
            </span>
        </Trans>
    );

    return (
        <div className={`${authenticated && headerShouldRender() ? 'main-container' : 'hidden-container'}`}>
            <SideMenu authenticated={authenticated} />
            <div className="content">
                <Switch>
                    <LastLocationProvider>
                        <ConnectedPrivateRoute disableLoginProtection={false} exact path="/" component={Home} />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={PREGNANCY_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => (
                                <ModuleHome
                                    title={PREGNANCY_DASHBOARD_WELCOME}
                                    description={PREGNANCY_DESCRIPTION}
                                    logFaceUrl={PREGNANCY_LOGFACE_URL}
                                    compartmentUrl={PREGNANCY_COMPARTMENTS_URL}
                                    analysisUrl={PREGNANCY_ANALYSIS_URL}
                                />
                            )}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={NBC_AND_PNC_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => (
                                <ModuleHome
                                    title={NBC_AND_PNC_DASHBOARD_WELCOME}
                                    description={PREGNANCY_DESCRIPTION}
                                    logFaceUrl={NBC_AND_PNC_LOGFACE_URL}
                                    compartmentUrl={NBC_AND_PNC_COMPARTMENTS_URL}
                                    analysisUrl={NBC_AND_PNC_ANALYSIS_URL}
                                />
                            )}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={NUTRITION_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => (
                                <ModuleHome
                                    title={NUTRITION_DASHBOARD_WELCOME}
                                    description={PREGNANCY_DESCRIPTION}
                                    logFaceUrl={NUTRITION_LOGFACE_URL}
                                    compartmentUrl={NUTRITION_COMPARTMENTS_URL}
                                    analysisUrl={NUTRITION_ANALYSIS_URL}
                                />
                            )}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={PREGNANCY_COMPARTMENTS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Compartments module={PREGNANCY_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={NBC_AND_PNC_COMPARTMENTS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Compartments module={NBC_AND_PNC_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={NUTRITION_COMPARTMENTS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Compartments module={NUTRITION_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={(() => {
                                return [
                                    NUTRITION_COMPARTMENTS_URL,
                                    NBC_AND_PNC_COMPARTMENTS_URL,
                                    PREGNANCY_COMPARTMENTS_URL,
                                ].map(
                                    (url) =>
                                        `${url}${HIERARCHICAL_DATA_URL}/:module?/:risk_highlighter?/:title?/:current_level?/:direction?/:node_id?/:permission_level?/:from_level?`,
                                );
                            })()}
                            component={ConnectedHierarchicalDataTable}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={PREGNANCY_ANALYSIS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => (
                                <Analysis endpoint={SUPERSET_PREGNANCY_ANALYSIS_ENDPOINT} module={PREGNANCY} />
                            )}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={NBC_AND_PNC_ANALYSIS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Analysis endpoint={NBC_AND_PNC_ANALYSIS_ENDPOINT} module={NBC_AND_PNC} />}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={NUTRITION_ANALYSIS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => (
                                <Analysis endpoint={SUPERSET_PREGNANCY_ANALYSIS_ENDPOINT} module={NUTRITION} />
                            )}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={(() => {
                                return [
                                    NUTRITION_COMPARTMENTS_URL,
                                    NBC_AND_PNC_COMPARTMENTS_URL,
                                    PREGNANCY_COMPARTMENTS_URL,
                                ].map((url) => `${url}${PATIENT_DETAIL_URL}`);
                            })()}
                            component={ConnectedPatientDetails}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={(() => {
                                return [
                                    NUTRITION_COMPARTMENTS_URL,
                                    NBC_AND_PNC_COMPARTMENTS_URL,
                                    PREGNANCY_COMPARTMENTS_URL,
                                ].map((url) => `${url}${CHILD_PATIENT_DETAIL_URL}`);
                            })()}
                            // tslint:disable-next-line: jsx-no-lambda
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            component={(routeProps: any) => <ConnectedPatientDetails isChild {...routeProps} />}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={(() => {
                                return [NUTRITION_LOGFACE_URL, NBC_AND_PNC_LOGFACE_URL, PREGNANCY_LOGFACE_URL].map(
                                    (url) => `${url}${PATIENT_DETAIL_URL}`,
                                );
                            })()}
                            component={ConnectedPatientDetails}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={(() => {
                                return [NUTRITION_LOGFACE_URL, NBC_AND_PNC_LOGFACE_URL, PREGNANCY_LOGFACE_URL].map(
                                    (url) => `${url}${CHILD_PATIENT_DETAIL_URL}`,
                                );
                            })()}
                            // tslint:disable-next-line: jsx-no-lambda
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            component={(routeProps: any) => <ConnectedPatientDetails isChild {...routeProps} />}
                        />
                        <ConnectedPrivateRoute
                            disableLoginProtection={false}
                            exact
                            path={LOGOUT_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => (
                                <ConnectedLogout {...({ logoutURL: OPENSRP_LOGOUT_URL } as Partial<LogoutProps>)} />
                            )}
                        />

                        <ConnectedPrivateRoute
                            exact
                            path={PREGNANCY_LOGFACE_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={(routeProps: RouteComponentProps) => (
                                <ConnectedLogFace module={PREGNANCY_MODULE} {...routeProps} />
                            )}
                        />
                        <ConnectedPrivateRoute
                            exact
                            path={NBC_AND_PNC_LOGFACE_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={(routeProps: RouteComponentProps) => (
                                <ConnectedLogFace module={NBC_AND_PNC_MODULE} {...routeProps} />
                            )}
                        />
                        <ConnectedPrivateRoute
                            exact
                            path={NUTRITION_LOGFACE_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={(routeProps: RouteComponentProps) => (
                                <ConnectedLogFace module={NUTRITION_MODULE} {...routeProps} />
                            )}
                        />
                        {/* tslint:disable jsx-no-lambda */}
                        <Route
                            exact
                            path="/oauth/callback/:id"
                            render={(routeProps) => (
                                <ConnectedOauthCallback
                                    LoadingComponent={Loading}
                                    providers={providers}
                                    oAuthUserInfoGetter={oAuthUserInfoGetter}
                                    SuccessfulLoginComponent={Home}
                                    {...routeProps}
                                />
                            )}
                        />
                        {/* tslint:enable jsx-no-lambda */}
                    </LastLocationProvider>
                </Switch>
            </div>
        </div>
    );
};

const ConnectedRoutes = connect(mapStateToProps)(Routes);

export default ConnectedRoutes;
