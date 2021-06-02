import { ClientType } from 'store/ducks/sms_events';

export const pregnancyReport1 = {
    event_id: '1619019296551',
    EventDate: '2021-04-21',
    health_worker_location_name: '\u0110\u0103k T\u1edd Re',
    sms_type: 'Home ANC Visit',
    anc_id: '10063H',
    patient_name: 'PENNY TAH',
    age: '47y ',
    message:
        'Blood Pressure = 118/78 \nWeight = 70 \nCurrent Symptoms = Bu00ecnh thu01b0u1eddng \nSupplements = Micronutrients Supplement: No \nRisk = low \nContact = 3',
    logface_risk: 'low',
    health_worker_name: 'Husna Hariz',
    event_date: '2021-04-21T15:12:56.335000',
    risk_level: 'low',
    location_id: '9d239bd7-179f-40c5-884b-8a1533038da1',
    message_vietnamese: 0,
    client_type: 'ec_woman' as ClientType,
    pregnancy_id: '1618905587899',
};
export const pregnancyReport2 = {
    event_id: '1619015963834',
    EventDate: '2021-04-21',
    health_worker_location_name: '\u0110\u0103k T\u1edd Re',
    sms_type: 'ANC Visit',
    anc_id: '10063H',
    patient_name: 'PENNY TAH',
    age: '47y ',
    message:
        'Blood Pressure = 118/78\nWeight = 60\nCurrent Symptoms = Bu00ecnh thu01b0u1eddng\nSupplements = Micronutrients Supplement: No\nRisk = low\nContact = 2',
    logface_risk: 'low',
    health_worker_name: 'Husna Hariz',
    event_date: '2021-04-21T14:37:08.328000',
    risk_level: 'low',
    location_id: '9d239bd7-179f-40c5-884b-8a1533038da1',
    message_vietnamese: 0,
    client_type: 'ec_woman' as ClientType,
    pregnancy_id: '1618905587899',
};

export const pregnancyReports = [pregnancyReport1, pregnancyReport2];
