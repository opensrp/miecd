import * as Highcharts from 'highcharts';
import * as React from 'react';
import { Card, CardTitle } from 'reactstrap';
import { Dictionary } from '../../helpers/utils';
import './index.css';

interface CustomSeriesData {
    categories: string[];
    dataSeries: { data: unknown[]; name: string }[];
}

interface Props {
    chartWrapperId: string;
    title: string;
    units: string;
    legendString: string;
    yAxisLabel: string;
    dataArray?: CustomSeriesData;
}

const defaultProps: Props = {
    chartWrapperId: '',
    legendString: '',
    title: '',
    units: '',
    yAxisLabel: '',
};

function Chart(props: Props) {
    const { units, yAxisLabel, chartWrapperId, title, dataArray } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function calcChartWidth(chart: any) {
        if (chart && chart.series) {
            chart.setSize(0.8 * window.innerWidth, null);
            return chart;
        }
    }

    React.useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let chart: any;
        if (chart) {
            chart.destroy();
        }
        const timeout = setTimeout(() => {
            chart = Highcharts.chart(`${chartWrapperId}`, {
                chart: {
                    type: 'line',
                    width: 0.8 * window.innerWidth,
                    style: {
                        fontSize: '1.2rem',
                    },
                },
                legend: {
                    align: 'right',
                    layout: 'vertical',
                    verticalAlign: 'middle',
                    itemStyle: { 'font-size': '1.2rem' },
                },
                title: {
                    text: '',
                },
                // tslint:disable-next-line: object-literal-sort-keys
                tooltip: {
                    backgroundColor: 'white',
                    borderColor: '#DADCE0',
                    borderRadius: 10,
                    borderWidth: 1,
                    shadow: {
                        color: '#D7D7E0',
                        offsetX: 0,
                        offsetY: 2,
                        opacity: 0.2,
                        width: 8,
                    },
                    formatter() {
                        const { index: thisIndex } = this.point as Dictionary;
                        const { data } = this.point.series;
                        let change = '+0';
                        const previousDataIndex = thisIndex - 1;
                        if (previousDataIndex >= 0) {
                            const previousY = data[previousDataIndex].options.y ?? 0;
                            let changeSign = '+';
                            if (this.y < previousY) {
                                changeSign = '-';
                            }
                            //toFixed; try to deal with e.g 3.3 - 2.2 != 1.1
                            change = `${changeSign}${Number(Math.abs(previousY - this.y)).toFixed(1)}`;
                        }

                        return `${this.x}: <b>${this.y}</b> ${units} (${change})`;
                    },
                },

                subtitle: {
                    text: '',
                },

                yAxis: {
                    labels: {
                        style: {
                            fontSize: '1rem',
                        },
                    },
                    title: {
                        text: yAxisLabel,
                    },
                },

                xAxis: {
                    labels: {
                        autoRotationLimit: 120,
                        style: {
                            fontSize: '1rem',
                        },
                    },
                    categories: dataArray?.categories,
                },

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                series: dataArray?.dataSeries as any,

                responsive: {
                    rules: [
                        {
                            chartOptions: {
                                legend: {
                                    align: 'center',
                                    layout: 'horizontal',
                                    verticalAlign: 'bottom',
                                },
                            },
                            condition: {
                                maxWidth: 5000,
                            },
                        },
                    ],
                },
            });
        }, 300);
        window.addEventListener('resize', () => calcChartWidth(chart));
        return () => {
            if (chart) {
                window.removeEventListener('resize', () => calcChartWidth(chart));
                clearTimeout(timeout);
            }
        };
    }, [chartWrapperId, dataArray, units, yAxisLabel]);

    return (
        <Card className="chart-card">
            <CardTitle>{title}</CardTitle>
            <div id={chartWrapperId} />
        </Card>
    );
}

Chart.defaultProps = defaultProps;

export { Chart };
