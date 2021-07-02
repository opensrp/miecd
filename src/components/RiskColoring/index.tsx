import { useTranslation } from 'react-i18next';
import { LogFaceModules, riskCategories } from 'configs/settings';
import { GREY } from 'configs/colors';
import React from 'react';
import './index.css';
import { NBC_AND_PNC_MODULE, NUTRITION_MODULE } from '../../constants';
import { NutritionLogFaceSms, PregnancySmsData } from 'store/ducks/sms_events';

export type DataObj =
    | Pick<NutritionLogFaceSms, 'growth_status' | 'nutrition_status' | 'feeding_category'>
    | Pick<PregnancySmsData, 'risk_level'>;

interface RiskColoringProps<T extends DataObj> {
    module: LogFaceModules;
    dataObject: T;
}

const riskColoringDefaultProps = {
    module: NBC_AND_PNC_MODULE,
};

/** Colour codes risk levels */
const RiskColoring = <T extends DataObj>(props: RiskColoringProps<T>) => {
    const { module, dataObject } = props;
    const { t } = useTranslation();

    const categoriesByModules = riskCategories(t);
    /** risk levels in nutrition module are not mutually exclusively, they can also rely on more than a single
     * accessor in the dataObj, sms records in nutrition will potentially have more than one risk badge
     */
    const categories = categoriesByModules[module];

    const accessorsOfInterest =
        module === NUTRITION_MODULE ? ['growth_status', 'nutrition_status', 'feeding_category'] : ['risk_level'];

    return (
        <>
            {accessorsOfInterest.map((accessor) => {
                // risk categories that uses this accessor e.g risk_level for pregnancy modules
                const riskCategories = categories.filter((cat) => cat.accessor === accessor);
                // check if dataObj[accessor] value is handled by our known risk categories in settings
                const categoryOfInterest = riskCategories.filter((c) => {
                    return c.filterValue.includes(dataObject[accessor as keyof DataObj]);
                });
                if (!categoryOfInterest.length) {
                    return null;
                }

                const first = categoryOfInterest[0];
                const color = first.color ?? GREY;
                const label = first.label ?? '';

                return (
                    <span key={`RiskColoring-${accessor}`} style={{ backgroundColor: color }} className="badge m-1">
                        <div>
                            <p>{label}</p>
                        </div>
                    </span>
                );
            })}
        </>
    );
};

RiskColoring.defaultProps = riskColoringDefaultProps;

export default RiskColoring;
