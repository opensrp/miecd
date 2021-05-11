import * as smsDataJson from './smsEvents.json';
import superset from '@onaio/superset-connector';
import { SmsData } from 'store/ducks/sms_events';

export const smsDataFixture = superset.processData(smsDataJson) as SmsData[];
