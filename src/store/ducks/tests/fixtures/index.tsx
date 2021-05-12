import * as smsDataJson from './smsEvents.json';
import * as nutritionReportsJson from './nutritionReports.json';
import * as pregnancyReportJson from './pregnancyLogFaceReports.json';
import superset from '@onaio/superset-connector';
import { SmsData } from 'store/ducks/sms_events';

export const smsDataFixture = superset.processData(smsDataJson) as SmsData[];
export const nutritionSmsFixtures = superset.processData(nutritionReportsJson);
export const PregnancyReportFixture = superset.processData(pregnancyReportJson);
