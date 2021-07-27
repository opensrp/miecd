import { ConnectedAPICallback, RouteParams } from '@onaio/gatekeeper';
import { getUser } from '@onaio/session-reducer';
import { trimStart } from 'lodash';
import querystring from 'querystring';
import React from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router';
import { HOME_URL, LOGOUT_URL, EXPRESS_LOGIN_URL } from '../../constants';
import { toastToSuccess, translateFormat } from 'helpers/utils';
import Ripple from 'components/page/Loading';
import store from 'store';
import { EXPRESS_OAUTH_GET_STATE_URL } from 'configs/env';
import { useTranslation } from 'react-i18next';
import { format } from 'util';

/** checks if the value of next in searchParam is blacklisted
 *
 * @param {RouteComponentProps} props - the props should contain the routing state.
 * @returns {boolean} return the response
 */
export const nextIsValid = (props: RouteComponentProps): boolean => {
    let response = true;
    const indirectionURLs = [LOGOUT_URL];
    /** we should probably sieve some routes from being passed on.
     * For instance we don't need to redirect to logout since we are already in
     * the Unsuccessful Login component, meaning we are already logged out.
     */
    const stringifiedUrls = indirectionURLs.map((url) => querystring.stringify({ next: url }));
    for (const url of stringifiedUrls) {
        if (props.location.search.includes(url)) {
            response = false;
            break;
        }
    }
    return response;
};

export const BaseSuccessfulLoginComponent: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
    let pathToRedirectTo = HOME_URL;
    const { t } = useTranslation();

    if (nextIsValid(props)) {
        const searchString = trimStart(props.location.search, '?');
        const searchParams = querystring.parse(searchString);
        const nextPath = searchParams.next as string | undefined;

        if (nextPath) {
            pathToRedirectTo = nextPath;
        }
        if (nextPath === '/') {
            const user = getUser(store.getState());
            toastToSuccess(translateFormat(t('Welcome back, {0}'), user.username));
        }
    }
    return <Redirect to={pathToRedirectTo} />;
};

export const SuccessfulLoginComponent = withRouter(BaseSuccessfulLoginComponent);

const BaseUnsuccessfulLogin: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
    let redirectTo = `${EXPRESS_LOGIN_URL}${props.location.search}`;
    if (!nextIsValid(props)) {
        redirectTo = EXPRESS_LOGIN_URL;
    }

    window.location.href = redirectTo;
    return <></>;
};

export const UnSuccessfulLogin = withRouter(BaseUnsuccessfulLogin);

const CustomConnectedAPICallBack: React.FC<RouteComponentProps<RouteParams>> = (props) => {
    return (
        <ConnectedAPICallback
            LoadingComponent={Ripple}
            UnSuccessfulLoginComponent={UnSuccessfulLogin}
            SuccessfulLoginComponent={SuccessfulLoginComponent}
            apiURL={EXPRESS_OAUTH_GET_STATE_URL}
            {...props}
        />
    );
};

export default CustomConnectedAPICallBack;
