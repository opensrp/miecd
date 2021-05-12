import * as smsDataJson from './smsEvents.json';
import * as nbcPncReportsJson from './nbcPncReports.json';
import * as pregnancyReportJson from './pregnancyLogFaceReports.json';
import superset from '@onaio/superset-connector';
import { SmsData } from 'store/ducks/sms_events';

export const smsDataFixture = superset.processData(smsDataJson) as SmsData[];
export const nbcPncSmsFixtures = superset.processData(nbcPncReportsJson);
export const PregnancyReportFixture = superset.processData(pregnancyReportJson);
