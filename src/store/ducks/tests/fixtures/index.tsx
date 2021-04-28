import * as smsDataJson from './smsEvents.json';
import superset from '@onaio/superset-connector';

export const smsDataFixture = superset.processData(smsDataJson);
