// this is the home page component
import * as React from 'react';
import { Link } from 'react-router-dom';
import pregnancyAvatar from '../../../assets/images/pregnancy.jpg';
import nbcPncAvatar from '../../../assets/images/carrying-baby.svg';
import nutritionAvatar from '../../../assets/images/baby-feeding.svg';
import { NBC_AND_PNC_URL, NUTRITION_URL, PREGNANCY_URL } from '../../../constants';
import './index.css';

class Home extends React.Component {
    public render() {
        return (
            <div className="home-main">
                <div className="welcome-text">
                    <h1>Welcome to the MIECD dashboard</h1>
                </div>
                <div className="components-list">
                    <div className="spacer">
                        <img src={pregnancyAvatar} id="pregnancyAvatar" alt="pregnancy module avatar" />
                        <div className="sub-container-message">
                            <div id="cont-size">
                                <h1>Pregnancy</h1>
                            </div>
                            <div id="cont-size">
                                <h4>View the latest message updates about your patients.</h4>
                            </div>
                            <div id="cont-sized">
                                <Link to={PREGNANCY_URL}>
                                    <button className="button-style default">View</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="spacer">
                        <img src={nbcPncAvatar} id="nbcPncAvatar" alt="NBC &#38; PNC module avatar" />

                        <div className="sub-container-message">
                            <div id="cont-size">
                                <h1>NBC &#38; PNC</h1>
                            </div>
                            <div id="cont-size">
                                <h4>View the latest message updates about your patients.</h4>
                            </div>
                            <div id="cont-sized">
                                <Link to={NBC_AND_PNC_URL}>
                                    <button className="button-style default">View</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="spacer">
                        <img src={nutritionAvatar} id="nutritionAvatar" alt="nutrition module avatar" />

                        <div className="sub-container-message">
                            <div id="cont-size">
                                <h1>Nutrition</h1>
                            </div>
                            <div id="cont-size">
                                <h4>View the latest message updates about your patients.</h4>
                            </div>
                            <div id="cont-sized">
                                <Link to={NUTRITION_URL}>
                                    <button className="button-style default">View</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;
