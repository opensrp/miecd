import { getAnalysisDashboardEndpoint, LogFaceModules } from 'configs/settings';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Ripple from '../../../components/page/Loading';
import './index.css';

interface AnalysisProps {
    module: LogFaceModules;
}

const Analysis = (props: AnalysisProps) => {
    const { module } = props;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { t } = useTranslation();
    const analysisDashboardEndpoint = getAnalysisDashboardEndpoint(module);

    const hideSpinner = () => setIsLoading(false);

    return (
        <div className="analysis">
            <div>
                <h2 className="analysis-title">{`${module} - ${t('Analysis')}`}</h2>
            </div>
            <div className="analysis-wrapper">
                {isLoading ? <Ripple /> : null}
                <iframe
                    seamless
                    scrolling="yes"
                    frameBorder="0"
                    onLoad={hideSpinner}
                    src={analysisDashboardEndpoint}
                    title="pregnancy sms events analysis"
                    className="analysis-iframe"
                />
            </div>
        </div>
    );
};

export default Analysis;
