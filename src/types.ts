import { SmsData } from './store/ducks/sms_events';

// typings
export type SmsFilterFunction = (smsData: SmsData) => boolean;
