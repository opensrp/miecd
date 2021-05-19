import { Store } from 'redux';
import NoRecord from 'components/NoRecord';
import { connect } from 'react-redux';
import React from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import supersetFetch from 'services/superset';
import { addChildData, chartReducer, ChildChartData, sliceName, getChildChartDataById } from 'store/ducks/chartData';
import { CHILD_CHART_SLICE } from 'configs/env';
import { RouteComponentProps } from 'react-router';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { BrokenLoadingChartPage, chartFormDataFilters, chartSupersetCall, getWeightHeightDataSeries } from '../utils';
import { useHandleBrokenPage } from 'helpers/utils';
import { Chart } from 'components/WeightAndHeightChart';

reducerRegistry.register(sliceName, chartReducer);

interface ChildChartProps {
    childChartData: ChildChartData[];
    supersetService: typeof supersetFetch;
    addChildDataCreator: typeof addChildData;
}

const defaultProps = {
    childChartData: [],
    supersetService: supersetFetch,
    addChildDataCreator: addChildData,
};

export type ChildChartTypes = ChildChartProps & RouteComponentProps<{ patient_id: string }>;

/** renders chart that has the child weight and height  */
function ChildChart(props: ChildChartTypes) {
    const { supersetService, addChildDataCreator, childChartData } = props;
    const { error, handleBrokenPage, broken } = useHandleBrokenPage();
    const [loading, setLoading] = React.useState<boolean>(childChartData.length === 0);
    const { t } = useTranslation();

    useEffect(() => {
        const patientId = props.match.params.patient_id;
        chartSupersetCall(CHILD_CHART_SLICE, addChildDataCreator, supersetService, chartFormDataFilters(patientId))
            .then(() => {
                setLoading(false);
            })
            .catch((e) => {
                handleBrokenPage(e);
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addChildDataCreator, props.match.params.patient_id, supersetService]);

    if (loading || broken) {
        return <BrokenLoadingChartPage error={error} broken={broken} loading={loading} />;
    }

    return (
        <>
            {childChartData.length > 0 ? (
                <div id="chart">
                    <Chart
                        dataArray={getWeightHeightDataSeries(childChartData, t)}
                        chartWrapperId="child-nutrition-chart-1"
                        title={t('Weight Height Monitoring')}
                        legendString={t('Weight Height')}
                        units={t('cm')}
                        yAxisLabel={t('weight and height')}
                    />
                </div>
            ) : (
                <NoRecord message={t('No chart data found')} />
            )}
        </>
    );
}

ChildChart.defaultProps = defaultProps;

export type MapStateToProps = Pick<ChildChartTypes, 'childChartData'>;
export type MapDispatchToProps = Pick<ChildChartTypes, 'addChildDataCreator'>;

const childCHartEventSelector = getChildChartDataById();

const mapStateToProps = (state: Partial<Store>, ownProps: ChildChartTypes) => {
    const childChartData = childCHartEventSelector(state, {
        patientId: ownProps.match.params.patient_id,
    });
    return { childChartData };
};

const mapDispatchToProps: MapDispatchToProps = {
    addChildDataCreator: addChildData,
};

export const ConnectedChildChart = connect(mapStateToProps, mapDispatchToProps)(ChildChart);
