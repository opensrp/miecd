import { Store } from 'redux';
import NoRecord from 'components/NoRecord';
import { connect } from 'react-redux';
import React from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import supersetFetch from 'services/superset';
import { chartReducer, MotherChartData, sliceName, addMotherData, getMotherChartDataById } from 'store/ducks/chartData';
import { RouteComponentProps } from 'react-router';
import reducerRegistry from '@onaio/redux-reducer-registry';
import {
    BrokenLoadingChartPage,
    chartFormDataFilters,
    chartSupersetCall,
    getBloodPSeriesForChart,
    getWeightDataSeries,
} from '../utils';
import { useHandleBrokenPage } from 'helpers/utils';
import { Chart } from 'components/WeightAndHeightChart';
import { MOTHER_CHART_SLICE } from 'configs/env';

reducerRegistry.register(sliceName, chartReducer);

interface MotherChartProps {
    motherChartData: MotherChartData[];
    supersetService: typeof supersetFetch;
    addMotherDataCreator: typeof addMotherData;
}

const defaultProps = {
    motherChartData: [],
    supersetService: supersetFetch,
    addMotherDataCreator: addMotherData,
};

export type MotherChartTypes = MotherChartProps & RouteComponentProps<{ patient_id: string }>;

/** renders chart that has the mothers weight and blood pressure  */
function MotherChart(props: MotherChartTypes) {
    const { supersetService, addMotherDataCreator, motherChartData } = props;
    const { error, handleBrokenPage, broken } = useHandleBrokenPage();
    const [loading, setLoading] = React.useState<boolean>(motherChartData.length === 0);
    const { t } = useTranslation();

    useEffect(() => {
        const patientId = props.match.params.patient_id;
        chartSupersetCall(MOTHER_CHART_SLICE, addMotherDataCreator, supersetService, chartFormDataFilters(patientId))
            .catch((e) => handleBrokenPage(e))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addMotherDataCreator, props.match.params.patient_id, supersetService]);

    if (loading || broken) {
        return <BrokenLoadingChartPage error={error} broken={broken} loading={loading} />;
    }

    return (
        <>
            {motherChartData.length > 0 ? (
                <>
                    <Chart
                        dataArray={getWeightDataSeries(motherChartData, t)}
                        chartWrapperId="weight-chart-1"
                        title={t('Mother’s weight tracking ')}
                        legendString={t('Weight')}
                        units={t('kg')}
                        yAxisLabel={t('Weight')}
                    />

                    <Chart
                        dataArray={getBloodPSeriesForChart(motherChartData, t)}
                        chartWrapperId="blood-pressure"
                        title={t('Mother’s Blood pressure tracking')}
                        legendString={t('Blood pressure')}
                        units=""
                        yAxisLabel={t('Blood pressure')}
                    />
                </>
            ) : (
                <NoRecord message={t('No chart data found')} />
            )}
        </>
    );
}

MotherChart.defaultProps = defaultProps;

export type MapStateToProps = Pick<MotherChartTypes, 'motherChartData'>;
export type MapDispatchToProps = Pick<MotherChartTypes, 'addMotherDataCreator'>;

const chartEventSelector = getMotherChartDataById();

const mapStateToProps = (state: Partial<Store>, ownProps: MotherChartTypes) => {
    const motherChartData = chartEventSelector(state, {
        patientId: ownProps.match.params.patient_id,
    });
    return { motherChartData };
};

const mapDispatchToProps: MapDispatchToProps = {
    addMotherDataCreator: addMotherData,
};

export const ConnectedMotherChart = connect(mapStateToProps, mapDispatchToProps)(MotherChart);
