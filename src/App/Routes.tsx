import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import RawConnectedPrivateRoute from '@onaio/connected-private-route';
import { ConnectedOauthCallback, getOpenSRPUserInfo, RouteParams, useOAuthLogin } from '@onaio/gatekeeper';
import { useSelector } from 'react-redux';
import { getExtraData } from '@opensrp/store';
import { Route, RouteComponentProps, RouteProps, Switch } from 'react-router';
import { LastLocationProvider } from 'react-router-last-location';
import ConnectedSidebar from '../components/page/SideMenu';
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
    NOT_FOUND_URL,
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
    URL_LOCATION_UNIT,
    URL_LOCATION_UNIT_ADD,
    URL_LOCATION_UNIT_EDIT,
    URL_LOCATION_UNIT_GROUP,
    URL_LOCATION_UNIT_GROUP_ADD,
    URL_LOCATION_UNIT_GROUP_EDIT,
    URL_TEAMS,
    URL_TEAMS_ADD,
    URL_TEAMS_EDIT,
    URL_TEAM_ASSIGNMENT,
    URL_USER_GROUPS,
    URL_USER_ROLES,
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
import {
    LocationUnitList,
    LocationUnitGroupAddEdit,
    LocationUnitGroupList,
    NewLocationUnit,
    EditLocationUnit,
} from '@opensrp/location-management';
import { TeamsView, TeamsAddEdit } from '@opensrp/team-management';
import {
    locationUnitProps,
    newLocationUnitProps,
    editLocationProps,
    createEditUserProps,
    teamAssignmentProps,
    usersListProps,
    baseProps,
    teamsEditProps,
} from './utils';
import {
    ConnectedUserList,
    ConnectedCreateEditUser,
    ConnectedUserCredentials,
    UserGroupsList,
    UserRolesList,
    URL_USER,
    URL_USER_EDIT,
    ROUTE_PARAM_USER_ID,
    ROUTE_PARAM_USER_GROUP_ID,
    URL_USER_GROUP_EDIT,
    URL_USER_GROUP_CREATE,
    URL_USER_CREATE,
    URL_USER_CREDENTIALS,
    CreateEditUserGroup,
    EditUserProps,
    CredentialsPropsTypes,
} from '@opensrp/user-management';
import { TeamAssignmentView } from '@opensrp/team-assignment';
import '@opensrp/team-assignment/dist/index.css';
import '@opensrp/user-management/dist/index.css';
import { ContentWrapper } from 'components/ContentWrapper';
import { enabledModules } from 'helpers/utils';

library.add(faUser);

interface UserGroupRouteParams {
    userGroupId: string;
}

interface UserIdRouteParams {
    userId: string;
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

/** interface for PrivateRoute props */
interface PrivateRouteProps extends RouteProps {
    authenticated: boolean /** is the current user authenticated */;
    disableLoginProtection: boolean /** should we disable login protection */;
    redirectPath: string /** redirect to this path is use if not authenticated */;
    routerDisabledRedirectPath: string /** redirect to this path if router is not enabled */;
    routerEnabled: boolean /** is this route enabled */;
}
const ConnectedPrivateRoute = (props: Partial<PrivateRouteProps>) => {
    return <RawConnectedPrivateRoute {...props} routerDisableRedirectPath={NOT_FOUND_URL} />;
};

// ConnectedPrivateRoute.defaultProps.routerDisabledRedirectPath = NOT_FOUND_URL;

export const Routes = () => {
    const { t } = useTranslation();
    const extraData = useSelector((state) => getExtraData(state));
    const {
        pregnancyIsEnabled,
        usersIsEnabled,
        nutritionIsEnabled,
        nbcPncIsEnabled,
        locationsIsEnabled,
        teamsIsEnabled,
    } = enabledModules(extraData?.roles ?? []);
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
    const userAssignmentClass = 'user-assignment__list';

    const { OpenSRP } = useOAuthLogin({ providers, authorizationGrantType: AuthGrantType });
    return (
        <div className="main-container">
            <ConnectedSidebar />
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
                            routerEnabled={pregnancyIsEnabled}
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
                            routerEnabled={nbcPncIsEnabled}
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
                            routerEnabled={nutritionIsEnabled}
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
                            routerEnabled={pregnancyIsEnabled}
                            path={PREGNANCY_COMPARTMENTS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Compartments module={PREGNANCY_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={nbcPncIsEnabled}
                            path={NBC_AND_PNC_COMPARTMENTS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Compartments module={NBC_AND_PNC_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={nutritionIsEnabled}
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
                            routerEnabled={pregnancyIsEnabled}
                            path={PREGNANCY_ANALYSIS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Analysis module={PREGNANCY_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={nbcPncIsEnabled}
                            path={NBC_AND_PNC_ANALYSIS_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={() => <Analysis module={NBC_AND_PNC_MODULE} />}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={nutritionIsEnabled}
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
                            routerEnabled={pregnancyIsEnabled}
                            path={PREGNANCY_LOGFACE_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={(routeProps: RouteComponentProps) => (
                                <ConnectedLogFace module={PREGNANCY_MODULE} {...routeProps} />
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            exact
                            routerEnabled={nbcPncIsEnabled}
                            path={NBC_AND_PNC_LOGFACE_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={(routeProps: RouteComponentProps) => (
                                <ConnectedLogFace module={NBC_AND_PNC_MODULE} {...routeProps} />
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            exact
                            routerEnabled={nutritionIsEnabled}
                            path={NUTRITION_LOGFACE_URL}
                            // tslint:disable-next-line: jsx-no-lambda
                            component={(routeProps: RouteComponentProps) => (
                                <ConnectedLogFace module={NUTRITION_MODULE} {...routeProps} />
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={locationsIsEnabled}
                            path={URL_LOCATION_UNIT}
                            component={(props: RouteComponentProps) => (
                                <ContentWrapper>
                                    <LocationUnitList {...{ ...props, ...locationUnitProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={locationsIsEnabled}
                            path={URL_LOCATION_UNIT_ADD}
                            component={(props: RouteComponentProps) => (
                                <ContentWrapper>
                                    <NewLocationUnit {...{ ...props, ...newLocationUnitProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={locationsIsEnabled}
                            path={URL_LOCATION_UNIT_EDIT}
                            component={(props: RouteComponentProps<{ id: string }>) => (
                                <ContentWrapper>
                                    <EditLocationUnit {...{ ...props, ...editLocationProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={locationsIsEnabled}
                            path={URL_LOCATION_UNIT_GROUP}
                            component={(props: RouteComponentProps) => (
                                <ContentWrapper>
                                    <LocationUnitGroupList {...{ ...props, ...baseProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={locationsIsEnabled}
                            path={URL_LOCATION_UNIT_GROUP_ADD}
                            component={(props: RouteComponentProps) => (
                                <ContentWrapper>
                                    <LocationUnitGroupAddEdit {...{ ...props, ...baseProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={locationsIsEnabled}
                            path={URL_LOCATION_UNIT_GROUP_EDIT}
                            component={(props: RouteComponentProps) => (
                                <ContentWrapper>
                                    <LocationUnitGroupAddEdit {...{ ...props, ...baseProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={usersIsEnabled}
                            path={URL_USER}
                            {...usersListProps}
                            component={(props: RouteComponentProps<UserGroupRouteParams>) => (
                                <ContentWrapper className={userAssignmentClass}>
                                    <ConnectedUserList {...{ ...props, ...usersListProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={usersIsEnabled}
                            path={URL_USER_GROUPS}
                            component={(props: RouteComponentProps<UserGroupRouteParams>) => (
                                <ContentWrapper className={userAssignmentClass}>
                                    <UserGroupsList {...{ ...props, ...baseProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={usersIsEnabled}
                            path={URL_USER_ROLES}
                            component={(props: RouteComponentProps) => (
                                <ContentWrapper className={userAssignmentClass}>
                                    <UserRolesList {...{ ...props, ...baseProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={usersIsEnabled}
                            path={`${URL_USER_GROUPS}/:${ROUTE_PARAM_USER_GROUP_ID}`}
                            component={(props: RouteComponentProps<UserGroupRouteParams>) => (
                                <ContentWrapper className={userAssignmentClass}>
                                    <UserGroupsList {...{ ...props, ...baseProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={teamsIsEnabled}
                            path={URL_TEAMS}
                            component={(props: RouteComponentProps) => (
                                <ContentWrapper>
                                    <TeamsView {...{ ...props, ...baseProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={teamsIsEnabled}
                            path={URL_TEAM_ASSIGNMENT}
                            {...teamAssignmentProps}
                            component={(props: RouteComponentProps) => (
                                <ContentWrapper>
                                    <TeamAssignmentView {...{ ...props, ...teamAssignmentProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={teamsIsEnabled}
                            path={URL_TEAMS_ADD}
                            component={(props: RouteComponentProps) => (
                                <ContentWrapper>
                                    <TeamsAddEdit {...{ ...props, ...teamsEditProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={teamsIsEnabled}
                            path={`${URL_TEAMS_EDIT}/:id`}
                            component={(props: RouteComponentProps) => (
                                <ContentWrapper>
                                    <TeamsAddEdit {...{ ...props, ...teamsEditProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={usersIsEnabled}
                            path={URL_USER_CREATE}
                            component={(props: RouteComponentProps<UserIdRouteParams>) => (
                                <ContentWrapper>
                                    <ConnectedCreateEditUser
                                        {...{ ...props, ...(createEditUserProps as unknown as EditUserProps) }}
                                    />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={usersIsEnabled}
                            path={`${URL_USER_EDIT}/:${ROUTE_PARAM_USER_ID}`}
                            component={(props: RouteComponentProps<UserIdRouteParams>) => (
                                <ContentWrapper>
                                    <ConnectedCreateEditUser
                                        {...{ ...props, ...(createEditUserProps as unknown as EditUserProps) }}
                                    />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={usersIsEnabled}
                            path={`${URL_USER_CREDENTIALS}/:${ROUTE_PARAM_USER_ID}`}
                            component={(props: RouteComponentProps) => (
                                <ContentWrapper>
                                    <ConnectedUserCredentials
                                        {...{ ...props, ...(createEditUserProps as unknown as CredentialsPropsTypes) }}
                                    />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            path={`${URL_USER_GROUP_EDIT}/:${ROUTE_PARAM_USER_GROUP_ID}`}
                            component={(props: RouteComponentProps<UserGroupRouteParams>) => (
                                <ContentWrapper>
                                    <CreateEditUserGroup {...{ ...props, ...baseProps }} />
                                </ContentWrapper>
                            )}
                        />
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact
                            routerEnabled={usersIsEnabled}
                            path={URL_USER_GROUP_CREATE}
                            component={(props: RouteComponentProps<UserGroupRouteParams>) => (
                                <ContentWrapper>
                                    <CreateEditUserGroup {...{ ...props, ...baseProps }} />
                                </ContentWrapper>
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
                        <ConnectedPrivateRoute
                            redirectPath={APP_CALLBACK_URL}
                            disableLoginProtection={DISABLE_LOGIN_PROTECTION}
                            exact={true}
                            path={LOGOUT_URL}
                            component={CustomLogout}
                        />
                        <Route exact path={APP_CALLBACK_PATH} component={CallbackComponent} />
                        <Route exact component={NotFound} />
                    </Switch>
                </LastLocationProvider>
            </div>
        </div>
    );
};

export default Routes;
