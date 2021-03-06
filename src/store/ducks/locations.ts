import { LocationState } from 'history';
import { keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import { COMMUNE, DISTRICT, PROVINCE, VILLAGE } from '../../constants';
import { Dictionary } from '@onaio/utils';

/** the reducer name */
export const reducerName = 'LocationReducer';

/** Interface for Location object received from discover */
export interface Location {
    location_id: string;
    location_name: string;
    level: typeof VILLAGE | typeof COMMUNE | typeof DISTRICT | typeof PROVINCE;
    parent_id: string;
}

/**
 * Object representing the user location returned from
 * the OpenSRP authentication endpoint
 */
export interface UserLocation {
    provider_name: string;
    provider_contact: string;
    provider_id: string;
    location_name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    location_id: string | any;
    team_name?: string;
    team_id?: string;
    openmrs_identifier?: string;
}

// actions

/** FETCH_USER_LOCATION action type */
export const FETCHED_USER_LOCATION = 'opensrp/reducer/FETCH_USER_LOCATION';

/** FETCH_USER_LOCATION_ID action type */
export const FETCHED_USER_ID = 'opensrp/reducer/FETCH_USER_ID';

/** FETCH_LOCATION action type */
export const FETCHED_LOCATION = 'opensrp/reducer/FETCH_LOCATION';

/** REMOVE_LOCATION action type */
export const REMOVE_LOCATIONS = 'opensrp/reducer/REMOVE_LOCATIONS';

/** Clear this whole slice */
export const CLEAR_LOCATIONS_SLICE = 'opensrp/reducer/CLEAR_LOCATIONS';

/** Interface for FetchLocationAction */
export interface FetchLocationsAction extends AnyAction {
    locations: { [key: string]: Location };
    type: typeof FETCHED_LOCATION;
}

/** Interface for FetchUserIdAction */
export interface FetchUserIdAction extends AnyAction {
    userId: string;
    type: typeof FETCHED_USER_ID;
}

/** Interface for FetchUserLocationAction */
export interface FetchUserLocationsAction extends AnyAction {
    userLocations: { [key: string]: UserLocation };
    type: typeof FETCHED_USER_LOCATION;
}

/** describes action to clear all data from this slice */
export interface ClearLocationSLice extends AnyAction {
    type: typeof CLEAR_LOCATIONS_SLICE;
}

/** action of type REMOVE_LOCATIONS */
export const removeLocations = {
    locations: [],
    type: REMOVE_LOCATIONS,
};

/** Location action types */
export type LocationActionTypes = FetchLocationsAction | FetchUserLocationsAction | FetchUserIdAction | AnyAction;

// action creators

/**
 * FETCH_LOCATION_ACTION creator
 * @param {Location[]} - Location array to add to store
 * @return {FetchLocationAction} - an action to add Location array to store
 */
export const fetchLocations = (locations: Location[] = []): FetchLocationsAction => {
    return {
        locations: keyBy(locations, (location: Location) => location.location_id),
        type: FETCHED_LOCATION as typeof FETCHED_LOCATION,
    };
};

/** FETCH_USER_LOCATION action creator */
export const fetchUserLocations = (userLocations: UserLocation[] = []): FetchUserLocationsAction => {
    const fetchUserLocationsAction = {
        type: FETCHED_USER_LOCATION as typeof FETCHED_USER_LOCATION,
        userLocations: keyBy(userLocations, (userLocation: UserLocation) => userLocation.provider_id),
    };
    return fetchUserLocationsAction;
};

/** FETCH_USER_ID action creator */
export const fetchUserId = (userId: string): FetchUserIdAction => {
    const fetchUserIdAction = {
        type: FETCHED_USER_ID as typeof FETCHED_USER_ID,
        userId,
    };
    return fetchUserIdAction;
};

/** action to clear the full slice */
export const clearLocationSlice = (): ClearLocationSLice => {
    return {
        type: CLEAR_LOCATIONS_SLICE,
    };
};

/** interface for locations state in redux store */
interface LocationsState {
    locations: { [key: string]: Location };
    userLocations: { [key: string]: UserLocation };
    userLocationsFetched: boolean;
    userId: string;
    userIdFetched: boolean;
    userLocationId: string;
    userLocationIdFetched: boolean;
}

/** Initial location-state state */
const initialState: LocationsState = {
    locations: {},
    userId: '',
    userIdFetched: false,
    userLocationId: '',
    userLocationIdFetched: false,
    userLocations: {},
    userLocationsFetched: false,
};

/**
 * This is the reducer. takes in the current state, an an action as arguments.
 * an action contains instructions on how to modify the store state.
 * Returns the new store state based on the action an the stores former state.
 * @param state the store state
 * @param action an action object
 */
export default function locationsReducer(
    state: LocationsState = initialState,
    action: LocationActionTypes,
): LocationState {
    switch (action.type) {
        case FETCHED_LOCATION:
            return {
                ...state,
                locations: { ...state.locations, ...action.locations },
            };
        case FETCHED_USER_LOCATION:
            return {
                ...state,
                userLocations: { ...state.userLocations, ...action.userLocations },
                userLocationsFetched: true,
            };
        case FETCHED_USER_ID: {
            return {
                ...state,
                userId: action.userId,
                userIdFetched: true,
            };
        }
        case REMOVE_LOCATIONS:
            return {
                ...state,
                locations: action.locations,
            };
        case CLEAR_LOCATIONS_SLICE:
            return initialState;
        default:
            return state;
    }
}

// Selectors

/** Return all Location data in the store as values whose
 * keys are their respective ids
 * @param {Partial<store>} state - the redux store
 * @return {Location[]}} - an array of Location objects
 */
export function getLocations(state: Partial<Store>): Location[] {
    return values((state as Dictionary)[reducerName].locations);
}

/** Return all User Location data in the store as values whose
 * keys are their respective provider ids
 * @param {Partial<store>} state - the redux store
 * @return {UserLocation[]}} - an array of User Location objects
 */
export function getUserLocations(state: Partial<Store>): UserLocation[] {
    return values((state as Dictionary)[reducerName].userLocations);
}

/** Returns the user UUID that was obtained from OpenSRP
 * @param {Partial<store>} state - the redux store
 * @return {string} the user's UUID obtained from opensrp
 */
export function getUserId(state: Partial<Store>): string {
    return (state as Dictionary)[reducerName].userId;
}

/** Returns the locationId of user
 * @param {Partial<store>} state - the redux store
 * @return {string} the user location id
 */
export function getUserLocationId(state: Partial<Store>): string {
    return (state as Dictionary)[reducerName].userLocationId;
}

/**
 * Return locations of a certain level/administrative unit
 * @param {Partial<store>} state - the redux store
 * @param {String} level - the level/aministrative unit we would like to get from the store
 * @return {Location[]} - an array of location objects
 */
export function getLocationsOfLevel(state: Partial<Store>, level: string): Location[] {
    return values((state as Dictionary)[reducerName].locations).filter((location: Location) => {
        return location.level === level;
    });
}

/** Returns true if user location details has been fetched from superset
 * and false otherwise
 * @param {Partial<store>} state - the redux store
 * @return {boolean} indicates if user locations have been fetched
 * or not
 */
export function userLocationDataFetched(state: Partial<Store>): boolean {
    return (state as Dictionary)[reducerName].userLocationsFetched;
}

/**
 * returns true if userIdFetched is set to true in the store and false otherwise.
 * @param state the store state
 * @return {boolean} indicates if the user UUID obtained from OpenSRP has been fetched.
 */
export function userIdFetched(state: Partial<Store>): boolean {
    return (state as Dictionary)[reducerName].userIdFetched;
}
