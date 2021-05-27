import superset from '@onaio/superset-connector';
import * as motherChartJson from './motherChart.json';
import * as childChartJson from './childChart.json';
import { ChildChartData, MotherChartData } from '../..';

export const motherChartFixture = superset.processData(motherChartJson) as MotherChartData[];
export const childChartFixture = superset.processData(childChartJson) as ChildChartData[];
