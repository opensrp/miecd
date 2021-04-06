import { useTranslation } from 'react-i18next';
import { HIGH, LOW, NO_RISK, NOT_SET_LOWERCASE, RED } from '../../constants';
import './index.css';

interface RiskColoringProps {
    risk: string;
}

const riskColoringDefaultProps: RiskColoringProps = {
    risk: 'red-alert',
};

/** Colour codes risk levels */
const RiskColoring = (props: RiskColoringProps) => {
    const { risk } = props;
    const { t } = useTranslation();

    switch (risk.toLowerCase().trim()) {
        case NO_RISK:
        case 'no risk':
        case 'null':
            return (
                <span className="badge badge-success" id="default-width">
                    <div>
                        <p>{t('No Risk')}</p>
                    </div>
                </span>
            );
        case LOW:
            return (
                <span className="badge badge-warning" id="default-width">
                    <div>
                        <p>{t('Low Risk')}</p>
                    </div>
                </span>
            );
        case HIGH:
            return (
                <span className="badge badge-danger" id="default-width">
                    <div>
                        <p>{t('High Risk')}</p>
                    </div>
                </span>
            );
        case RED:
            return (
                <span className="badge badge-danger" id="default-width">
                    <div>
                        <p>{t('Red Alert')}</p>
                    </div>
                </span>
            );
        case NOT_SET_LOWERCASE:
            return (
                <span className="badge badge-info" id="default-width">
                    <div>
                        <p>{t('Not Set')}</p>
                    </div>
                </span>
            );
        default:
            return (
                <span className="badge badge-info" id="default-width">
                    {risk}
                </span>
            );
    }
};

RiskColoring.defaultProps = riskColoringDefaultProps;

export default RiskColoring;
