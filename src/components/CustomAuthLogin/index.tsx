import { AuthorizationGrantType, ProviderLinks, Providers, useOAuthLogin } from '@onaio/gatekeeper';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.css';

/** interface for OauthLogin props */
export interface OauthLoginProps {
    ProviderLinksComponent?: React.ElementType;
    providers: Providers;
}

/** This component provides the Oauth login page - it simply presents a list of
 * links of oAuth providers.
 */
const CustomOauthLogin = (props: OauthLoginProps) => {
    const { providers, ProviderLinksComponent } = props;
    const { t } = useTranslation();
    const authorizationUris = useOAuthLogin({ authorizationGrantType: AuthorizationGrantType.IMPLICIT, providers });
    return ProviderLinksComponent && providers ? (
        <div className="row login-row">
            <div className="image col-lg col-xl" />
            <div className="col-lg col-xl login-section">
                <div className="logo">
                    <img src={require('../../assets/images/vietnam-moh.png')} alt="unicef vietnam" className="moh" />
                    <img src={require('../../assets/images/uni-vietnam.png')} alt="unicef vietnam" className="unicef" />
                </div>
                <div className="center">
                    <h3>{t('OpenSRP')}</h3>
                    {Object.entries(authorizationUris).map((item) => {
                        return (
                            /** render a link for each provider */
                            <p className="gatekeeper-p item" key={item[0]}>
                                <a className="gatekeeper-btn" href={item[1]}>
                                    {item[0]}
                                </a>
                            </p>
                        );
                    })}
                </div>
            </div>
        </div>
    ) : (
        <div className="gatekeeper-login">
            <p className="gatekeeper-p">{t('No providers')}</p>
        </div>
    );
};

CustomOauthLogin.defaultProps = {
    ProviderLinksComponent: ProviderLinks /** use the ProviderLinks component as the default */,
};

export default CustomOauthLogin;
