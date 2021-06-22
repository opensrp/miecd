import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import ConnectedPrivateRoute from '@onaio/connected-private-route';
import { ConnectedOauthCallback, getOpenSRPUserInfo, RouteParams, useOAuthLogin } from '@onaio/gatekeeper';
import { isAuthenticated } from '@onaio/session-reducer';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { Route, RouteComponentProps, Switch } from 'react-router';
import { LastLocationProvider } from 'react-router-last-location';
import SideMenu from '../components/page/SideMenu';
import { BACKEND_ACTIVE, DISABLE_LOGIN_PROTECTION } from '../configs/env';
import { APP_CALLBACK_PATH, APP_CALLBACK_URL, APP_LOGIN_URL, AuthGrantType, providers } from '../configs/settings';
import {
    CHILD_PATIENT_DETAIL_URL,
    HIERARCHICAL_DATA_URL,
    HOME_URL,
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
} from '../constants';
import Compartments from '../containers/Compartments';
import ConnectedHierarchicalDataTable from '../containers/HierarchichalDataTable';
import ConnectedLogFace from '../containers/LogFace';
import Analysis from '../containers/pages/Analysis';
import Home from '../containers/pages/Home';
import ModuleHome from '../containers/pages/ModuleHome';
import ConnectedPatientDetails from '../containers/PatientDetails';
import './App.css';
import { Trans, useTranslation } from 'react-i18next';
import { CustomLogout } from 'components/Logout';
import CustomConnectedAPICallBack, { SuccessfulLoginComponent } from 'components/CustomCallback';
import Ripple from '../components/page/Loading';
import React from 'react';
import NotFound from '../components/NotFound';

library.add(faUser);

const mapStateToProps = (state: Partial<Store>) => {
    return {
        authenticated: isAuthenticated(state),
    };
};

export interface RoutesProps {
    authenticated: boolean;
}

export const CallbackComponent = (routeProps: RouteComponentProps<RouteParams>) => {
    if (BACKEND_ACTIVE) {
        return <CustomConnectedAPICallBack {...routeProps} />;
    }

    return (
        <ConnectedOauthCallback
            SuccessfulLoginComponent={SuccessfulLoginComponent}
            LoadingComponent={Ripple}
            providers={providers}
            oAuthUserInfoGetter={getOpenSRPUserInfo}
            {...routeProps}
        />
    );
};

export const Routes = (props: RoutesProps) => {
    const { authenticated } = props;
    const { t } = useTranslation();
    const NBC_AND_PNC_DASHBOARD_WELCOME = t('Welcome to Newborn and Postnatal Care');
    const NUTRITION_DASHBOARD_WELCOME = t('Welcome to Nutrition Care');
    const PREGNANCY_DASHBOARD_WELCOME = t('Welcome to the pregnancy dashboard');
    const PREGNANCY_DESCRIPTION = (
        <Trans>
            This dashboard displays information collected from MIECD Viet Nam Pregnancy Module for patients in your
            geographical location.
            <span className="font-italic d-block">
                The module covers the whole pregnancy period from conception to delivery and includes Pregnancy
                Registration, ANC visits, Birth/Death reports, Risk Reports, Risk alerts and Response reports.
            </span>
        </Trans>
    );

    const { OpenSRP } = useOAuthLogin({ providers, authorizationGrantType: AuthGrantType });

    return (
        <div className="main-container">
            <SideMenu authenticated={authenticated} />
            <div className="content">
                <LastLocationProvider>
                    <Switch>
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            path={HOME_URL}
                            component={Home}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
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
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
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
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
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
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            path={PREGNANCY_COMPARTMENTS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Compartments module={PREGNANCY_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            path={NBC_AND_PNC_COMPARTMENTS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Compartments module={NBC_AND_PNC_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            path={NUTRITION_COMPARTMENTS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Compartments module={NUTRITION_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
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
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            path={PREGNANCY_ANALYSIS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Analysis module={PREGNANCY_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            path={NBC_AND_PNC_ANALYSIS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Analysis module={NBC_AND_PNC_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            path={NUTRITION_ANALYSIS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Analysis module={NUTRITION_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
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
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
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
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            path={(() => {
                                return [NUTRITION_LOGFACE_URL, NBC_AND_PNC_LOGFACE_URL, PREGNANCY_LOGFACE_URL].map(
                                    (url) => `${url}${PATIENT_DETAIL_URL}`,
                                );
                            })()}
                            component={ConnectedPatientDetails}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
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
                            redirectPath={APP_CALLBACK_URL}
                            exact
                            path={PREGNANCY_LOGFACE_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={(routeProps: RouteComponentProps) => (
                                <ConnectedLogFace module={PREGNANCY_MODULE} {...routeProps} />
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            exact
                            path={NBC_AND_PNC_LOGFACE_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={(routeProps: RouteComponentProps) => (
                                <ConnectedLogFace module={NBC_AND_PNC_MODULE} {...routeProps} />
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            exact
                            path={NUTRITION_LOGFACE_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={(routeProps: RouteComponentProps) => (
                                <ConnectedLogFace module={NUTRITION_MODULE} {...routeProps} />
                            )}
                        />
                        <Route
                            exact
                            path={APP_LOGIN_URL}
                            render={() => {
                                window.location.href = OpenSRP;
                                return <></>;
                            }}
                        />
                        <Route exact path={APP_CALLBACK_PATH} component={CallbackComponent} />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact={true}
                            path={LOGOUT_URL}
                            component={CustomLogout}
                        />
                        <Route exact component={NotFound} />
                    </Switch>
                </LastLocationProvider>
            </div>
        </div>
    );
};

const ConnectedRoutes = connect(mapStateToProps)(Routes);

export default ConnectedRoutes;
