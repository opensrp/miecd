// this is the home page component
import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import pregnancyAvatar from '../../../assets/images/pregnancy.jpeg';
import nbcPncAvatar from '../../../assets/images/pnc_nbc.jpeg';
import nutritionAvatar from '../../../assets/images/nutrition.jpeg';
import { NBC_AND_PNC_URL, NUTRITION_URL, PREGNANCY_URL } from '../../../constants';
import './index.css';

class Home extends React.Component<WithTranslation> {
    public render() {
        const { t } = this.props;
        return (
            <div className="home-main">
                <div className="welcome-text">
                    <h1>{t('Welcome to the MIECD dashboard')}</h1>
                </div>
                <div className="center-vertically">
                    <div className="components-list">
                        <div className="spacer">
                            <img src={pregnancyAvatar} id="pregnancyAvatar" alt="pregnancy module avatar" />
                            <div className="sub-container-message">
                                <div id="cont-size">
                                    <h1>{t('Pregnancy')}</h1>
                                </div>
                                <div id="cont-size">
                                    <h4>{t('View the latest message updates about your patients.')}</h4>
                                </div>
                                <div id="cont-sized">
                                    <Link to={PREGNANCY_URL}>
                                        <button className="button-style default">{t('View')}</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="spacer">
                            <img src={nbcPncAvatar} id="nbcPncAvatar" alt="NBC &#38; PNC module avatar" />

                            <div className="sub-container-message">
                                <div id="cont-size">
                                    <h1>{t('NBC & PNC')}</h1>
                                </div>
                                <div id="cont-size">
                                    <h4>{t('View the latest message updates about your patients.')}</h4>
                                </div>
                                <div id="cont-sized">
                                    <Link to={NBC_AND_PNC_URL}>
                                        <button className="button-style default">{t('View')}</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="spacer">
                            <img src={nutritionAvatar} id="nutritionAvatar" alt="nutrition module avatar" />

                            <div className="sub-container-message">
                                <div id="cont-size">
                                    <h1>{t('Nutrition')}</h1>
                                </div>
                                <div id="cont-size">
                                    <h4>{t('View the latest message updates about your patients.')}</h4>
                                </div>
                                <div id="cont-sized">
                                    <Link to={NUTRITION_URL}>
                                        <button className="button-style default">{t('View')}</button>
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

export default withTranslation()(Home);
