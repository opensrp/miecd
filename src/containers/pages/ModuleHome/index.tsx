// this is the home page component
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './index.css';

interface Props {
    title: string;
    description: React.ReactChild;
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
                <div className="module-home-cards">
                    <div className="card">
                        <h5 className="card-header">{t('Log face')}</h5>
                        <div className="card-body">
                            <p>{t('Display of all messages received from MIECD in chronological order')}</p>
                            <Link to={this.props.logFaceUrl}>
                                <button className="button-style ">{t('View')}</button>
                            </Link>
                        </div>
                    </div>

                    <div className="card">
                        <h5 className="card-header">{t('Compartments')}</h5>
                        <div className="card-body">
                            <p>{t('This is the aggregation and categorization of patients data')}</p>
                            <Link to={this.props.compartmentUrl}>
                                <button className={`button-style ${this.props.deactivateLinks ? 'deactivated' : ''}`}>
                                    {t('View')}
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="card">
                        <h5 className="card-header">{t('Analysis')}</h5>
                        <div className="card-body">
                            <p>{t('Important analysis and indicators generated from collected data')}</p>
                            <Link to={this.props.analysisUrl}>
                                <button className={`button-style ${this.props.deactivateLinks ? 'deactivated' : ''}`}>
                                    {t('View')}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation()(ModuleHome);
