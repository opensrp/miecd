import reducerRegistry from '@onaio/redux-reducer-registry';
import { SmsFilterFunction } from 'types';
import { smsDataFixtures } from '../../../containers/Compartments/test/fixtures';
import store from '../../index';
import reducer, {
    addFilterArgs,
    fetchSms,
    getFilterArgs,
    getFilteredSmsData,
    getSmsData,
    reducerName,
    removeFilterArgs,
    removeSms,
    SmsData,
    smsDataFetched,
} from '../sms_events';
import { expectedSmsData } from './fixures/smsEvents';

reducerRegistry.register(reducerName, reducer);

describe('reducers/sms_events/store', () => {
    it('must have initial state', () => {
        expect(getSmsData(store.getState())).toEqual([]);
        expect(smsDataFetched(store.getState())).toEqual(false);
    });
});

describe('reducers/sms_events/fetchSms action creator and selector', () => {
    it('must work correctly', () => {
        store.dispatch(fetchSms(smsDataFixtures));
        expect(getSmsData(store.getState())).toEqual(expectedSmsData);
        expect(smsDataFetched(store.getState())).toEqual(true);
        store.dispatch(removeSms);
    });

    it('must not overwrite data in the store', () => {
        store.dispatch(fetchSms(smsDataFixtures.slice(0, 2)));
        expect(getSmsData(store.getState())).toEqual(expectedSmsData.slice(0, 2));
        expect(smsDataFetched(store.getState())).toEqual(true);
        store.dispatch(fetchSms(smsDataFixtures.slice(2, 5)));
        expect(getSmsData(store.getState())).toEqual(expectedSmsData.slice(0, 5));
    });
});

describe('reducers/sms_events/addFilterArgs action creator and selector', () => {
    it('must work correctly', () => {
        const filterArgs: SmsFilterFunction[] = [
            (smsData: SmsData) => {
                return smsData.height !== 48;
            },
        ] as SmsFilterFunction[];
        store.dispatch(addFilterArgs(filterArgs));
        expect(getFilterArgs(store.getState())).toEqual(filterArgs);
        store.dispatch(removeFilterArgs());
        expect(getFilterArgs(store.getState())).toEqual([]);
    });
});

describe('reducers/sms_events/removeSms action', () => {
    it('must work correctly', () => {
        store.dispatch(fetchSms(smsDataFixtures));
        expect(getSmsData(store.getState())).toEqual(expectedSmsData);
        expect(smsDataFetched(store.getState())).toEqual(true);
        store.dispatch(removeSms);
        expect(getSmsData(store.getState())).toEqual([]);
        expect(smsDataFetched(store.getState())).toEqual(false);
    });
});

describe('reducers/sms_events/getFilteredSmsData', () => {
    beforeAll(() => {
        // put all the fixtures in the store
        store.dispatch(fetchSms(smsDataFixtures));
    });
    it("must works correctly with '==='", () => {
        expect(
            getFilteredSmsData(store.getState(), [
                (smsData: SmsData) => {
                    return smsData.height === 48;
                },
            ] as SmsFilterFunction[]),
        ).toEqual(
            expectedSmsData.filter((element: SmsData) => {
                return element.height === 48;
            }),
        );
    });
    it("must works correctly with '<='", () => {
        expect(
            getFilteredSmsData(store.getState(), [
                (smsData: SmsData) => {
                    return smsData.height <= 48;
                },
            ] as SmsFilterFunction[]),
        ).toEqual(
            expectedSmsData.filter((element: SmsData) => {
                return element.height <= 48;
            }),
        );
    });
    it("must works correctly with '>='", () => {
        expect(
            getFilteredSmsData(store.getState(), [
                (smsData: SmsData) => {
                    return smsData.height >= 48;
                },
                (smsData: SmsData) => {
                    return smsData.height < 56;
                },
            ] as SmsFilterFunction[]),
        ).toEqual(
            expectedSmsData.filter((element: SmsData) => {
                return element.height >= 48 && element.height < 56;
            }),
        );
    });
    it("must works correctly with '!=='", () => {
        expect(
            getFilteredSmsData(store.getState(), [
                (smsData: SmsData) => {
                    return smsData.height !== 48;
                },
            ] as SmsFilterFunction[]),
        ).toEqual(
            expectedSmsData.filter((element: SmsData) => {
                return element.height !== 48;
            }),
        );
    });
    it("must works correctly with '>'", () => {
        expect(
            getFilteredSmsData(store.getState(), [
                (smsData: SmsData) => {
                    return smsData.height > 48;
                },
            ] as SmsFilterFunction[]),
        ).toEqual(
            expectedSmsData.filter((element: SmsData) => {
                return element.height > 48;
            }),
        );
    });
    it("must works correctly with '<'", () => {
        expect(
            getFilteredSmsData(store.getState(), [
                (smsData: SmsData) => {
                    return smsData.height < 48;
                },
            ] as SmsFilterFunction[]),
        ).toEqual(
            expectedSmsData.filter((element: SmsData) => {
                return element.height < 48;
            }),
        );
    });
});
