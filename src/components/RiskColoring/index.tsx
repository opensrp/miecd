import { useTranslation } from 'react-i18next';
import { pregnancyModuleRiskFilterLookup } from 'configs/settings';
import { values } from 'lodash';
import { GREY } from 'configs/colors';
import React from 'react';
import './index.css';

interface RiskColoringProps {
    risk: string;
    displayValue: string;
}

const riskColoringDefaultProps: RiskColoringProps = {
    risk: '',
    displayValue: '',
};

/** Colour codes risk levels */
const RiskColoring = (props: RiskColoringProps) => {
    const { risk, displayValue } = props;
    const { t } = useTranslation();

    const categories = pregnancyModuleRiskFilterLookup(t);
    const thisCategory = values(categories).filter((cat) => cat.filterValue.includes(riskLevel));
    let color = GREY;
    if (thisCategory.length) {
        const first = thisCategory[0];
        color = first.color;
    }

    return (
        <span style={{ backgroundColor: color }} className="badge">
            <div>
                <p>{displayValue ? displayValue : risk}</p>
            </div>
        </span>
    );
};

RiskColoring.defaultProps = riskColoringDefaultProps;

export default RiskColoring;
