// this is the home page component
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './index.css';

interface Props {
    title: string;
    description: string;
    deactivateLinks: boolean;
    logFaceUrl: string;
    compartmentUrl: string;
    analysisUrl: string;
}

const defaultProps: Props = {
    analysisUrl: '#',
    compartmentUrl: '#',
    deactivateLinks: false,
    description: '',
    logFaceUrl: '#',
    title: '',
};
class ModuleHome extends React.Component<Props & WithTranslation> {
    public static defaultProps = defaultProps;

    public render() {
        const { t } = this.props;
        return (
            <div className="module-home-main">
                <div className="welcome-text">
                    <h1>{this.props.title}</h1>
                    <p>{this.props.description}</p>
                </div>
                <div className="components-list">
                    <div className="spacer">
                        <div className="home-sub-containers">
                            <div className="sub-container-heading">
                                <p>{t('Log face')}</p>
                            </div>
                            <hr />
                            <div className="sub-container-message">
                                <div id="cont-size">
                                    <p>{t('Display of all messages received from MIECD in chronological order')}</p>
                                </div>
                                <div id="cont-sized">
                                    <Link to={this.props.logFaceUrl}>
                                        <button className="button-style ">{t('View')}</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="spacer">
                        <div className="home-sub-containers">
                            <div className="sub-container-heading">
                                <p>{t('Compartments')}</p>
                            </div>
                            <hr />
                            <div className="sub-container-message">
                                <div id="cont-size">
                                    <p>{t('This is the aggregation and categorization of patients data')}</p>
                                </div>
                                <div id="cont-sized">
                                    <Link to={this.props.compartmentUrl}>
                                        <button
                                            className={`button-style ${
                                                this.props.deactivateLinks ? 'deactivated' : ''
                                            }`}
                                        >
                                            {t('View')}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="spacer">
                        <div className="home-sub-containers">
                            <div className="sub-container-heading">
                                <p>{t('Analysis')}</p>
                            </div>
                            <hr />
                            <div className="sub-container-message">
                                <div id="cont-size">
                                    <p>{t('Important analysis and indicators generated from collected data')}</p>
                                </div>
                                <div id="cont-sized">
                                    <Link to={this.props.analysisUrl}>
                                        <button
                                            className={`button-style ${
                                                this.props.deactivateLinks ? 'deactivated' : ''
                                            }`}
                                        >
                                            {t('View')}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation()(ModuleHome);
