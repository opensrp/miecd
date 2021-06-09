/** stores slice information used to render mothers weight and blood pressure graphs */
import { createSelector, Store, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { keyBy, values } from 'lodash';
import { Dictionary } from '@onaio/utils';
import { inThePast24Months } from 'helpers/utils';
export const sliceName = 'motherChartReducer';

interface CommonFields {
    anc_id: string;
    base_entity_id: string;
    weight: number;
    event_date: string;
    event_id: string;
    event_type: string;
}

/** Interface for data tracking mother weight and bp to be used for charting purposes */
export interface MotherChartData extends CommonFields {
    bp: string;
    pregnancy_id: string;
}
/** describes data tracking child's weight and height to be used for charting purposes */
export interface ChildChartData extends CommonFields {
    height: number;
}

/** describes this duck's module slice's state */
export interface SliceState {
    motherChartData: Dictionary<MotherChartData>;
    childChartData: Dictionary<ChildChartData>;
}

export const defaultConfigState: SliceState = { motherChartData: {}, childChartData: {} };

export const configsSlice = createSlice({
    name: sliceName,
    initialState: defaultConfigState,
    reducers: {
        addMotherData: {
            reducer: (state, action: PayloadAction<SliceState['motherChartData']>) => {
                state.motherChartData = {
                    ...state.motherChartData,
                    ...action.payload,
                };
            },
            prepare: (events: MotherChartData[]) => {
                return { payload: keyBy(events, (x) => x.event_id) };
            },
        },
        addChildData: {
            reducer: (state, action: PayloadAction<SliceState['childChartData']>) => {
                state.childChartData = {
                    ...state.childChartData,
                    ...action.payload,
                };
            },
            prepare: (events: ChildChartData[]) => {
                return { payload: keyBy(events, (x) => x.event_id) };
            },
        },
        removeMotherData: {
            reducer: (state) => {
                state.motherChartData = {};
            },
            prepare: () => {
                return { payload: {} };
            },
        },
        removeChildData: {
            reducer: (state) => {
                state.childChartData = {};
            },
            prepare: () => {
                return { payload: {} };
            },
        },
    },
});

export const { addMotherData, addChildData, removeChildData, removeMotherData } = configsSlice.actions;
export const { reducer: chartReducer } = configsSlice;

/** options supported as filters by one of the selectors */
export interface ChartFilters {
    patientId?: string;
}

const getMotherData = (state: Partial<Store>): MotherChartData[] =>
    values((state as Dictionary)[sliceName].motherChartData);

const getChildData = (state: Partial<Store>): ChildChartData[] =>
    values((state as Dictionary)[sliceName].childChartData);

const getPatientId = (_: Partial<Store>, props: ChartFilters) => props.patientId;

/** creates selector to get mother chart data filtered by patient id */
export const getMotherChartDataById = () =>
    createSelector(getMotherData, getPatientId, (allEvents, patientId) => {
        let eventsOfInterest = [];
        if (patientId === undefined) {
            eventsOfInterest = allEvents;
        }
        eventsOfInterest = allEvents.filter((event) => event.anc_id === patientId);
        return inThePast24Months(eventsOfInterest);
    });

/** creates selector to get child chart data filtered by patient id */
export const getChildChartDataById = () =>
    createSelector(getChildData, getPatientId, (allEvents, patientId) => {
        let eventsOfInterest = [];
        if (patientId === undefined) {
            eventsOfInterest = allEvents;
        }
        eventsOfInterest = allEvents.filter((event) => event.anc_id === patientId);
        return inThePast24Months(eventsOfInterest);
    });
