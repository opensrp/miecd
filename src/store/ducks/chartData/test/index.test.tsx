import reducerRegistry from '@onaio/redux-reducer-registry';
import store from 'store';

import {
    chartReducer,
    addMotherData,
    addChildData,
    getMotherChartDataById,
    getChildChartDataById,
    sliceName,
    removeChildData,
    removeMotherData,
} from '..';
import { childChartFixture, motherChartFixture } from './fixtures';
import MockDate from 'mockdate';

MockDate.set('2021-06-04T11:51:37.190Z');

reducerRegistry.register(sliceName, chartReducer);

const selectMotherDataById = getMotherChartDataById();
const selectChildDataById = getChildChartDataById();

describe('store/ducks/chartReducer', () => {
    afterEach(() => {
        store.dispatch(removeMotherData());
        store.dispatch(removeChildData());
    });
    it('works with initial state', () => {
        const state = store.getState();
        expect(selectMotherDataById(state, {})).toEqual([]);
        expect(selectChildDataById(state, {})).toEqual([]);
        expect(selectMotherDataById(state, { patientId: 'id' })).toEqual([]);
        expect(selectChildDataById(state, { patientId: 'id' })).toEqual([]);
    });

    it('retrieves the correct data', () => {
        store.dispatch(addMotherData(motherChartFixture));
        store.dispatch(addChildData(childChartFixture));

        const state = store.getState();
        expect(selectMotherDataById(state, {})).toHaveLength(motherChartFixture.length);
        expect(selectChildDataById(state, {})).toHaveLength(childChartFixture.length);

        expect(selectMotherDataById(state, { patientId: 'unexistent' })).toEqual([]);
        expect(selectChildDataById(state, { patientId: 'unexistent' })).toEqual([]);
        const motherId = '1002KL';
        const childId = '100TTG';
        const expectedMotherData = motherChartFixture.filter((dt) => dt.anc_id === motherId);
        const expectedChildData = childChartFixture.filter((dt) => dt.anc_id === childId);

        expect(selectMotherDataById(state, { patientId: motherId })).toEqual(expectedMotherData);
        expect(selectChildDataById(state, { patientId: childId })).toEqual(expectedChildData);
    });

    it('should not override', () => {
        store.dispatch(addMotherData([motherChartFixture[0]]));
        store.dispatch(addChildData([childChartFixture[0]]));
        let state = store.getState();

        expect(selectMotherDataById(state, {})).toHaveLength(1);
        expect(selectChildDataById(state, {})).toHaveLength(1);

        store.dispatch(addMotherData([motherChartFixture[1]]));
        store.dispatch(addChildData([childChartFixture[1]]));

        state = store.getState();
        expect(selectMotherDataById(state, {})).toHaveLength(2);
        expect(selectChildDataById(state, {})).toHaveLength(2);
    });
});
