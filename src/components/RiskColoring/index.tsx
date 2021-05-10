import { useTranslation } from 'react-i18next';
import { PREGNANCY_MODULE } from '../../constants';
import { riskCategories } from 'configs/settings';
import { keyBy } from 'lodash';
import { GREY } from 'configs/colors';
import React from 'react';
import './index.css';

interface RiskColoringProps {
    risk: string;
}

const riskColoringDefaultProps: RiskColoringProps = {
    risk: '',
};

/** Colour codes risk levels */
const RiskColoring = (props: RiskColoringProps) => {
    const { risk } = props;
    const { t } = useTranslation();

    const module = PREGNANCY_MODULE;
    const categories = riskCategories(t)[module];
    const categoriesByRisk = keyBy(categories, (item) => item.value);

    return (
        <span style={{ backgroundColor: categoriesByRisk[risk]?.color ?? GREY }} className="badge">
            <div>
                <p>{categoriesByRisk[risk]?.label ?? t('Not set')}</p>
            </div>
        </span>
    );
};

RiskColoring.defaultProps = riskColoringDefaultProps;

export default RiskColoring;
