import { SmsData, CompartmentSmsTypes } from './store/ducks/sms_events';

// typings
export type SmsFilterFunction = (smsData: SmsData) => boolean;
export type CompartmentsSmsFilterFunction = (CompartmentSmsData: CompartmentSmsTypes) => boolean;
