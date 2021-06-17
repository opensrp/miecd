import { DEFAULT_PLAN_ID, KEYCLOAK_API_BASE_URL, KEYCLOAK_USERS_PAGE_SIZE, OPENSRP_API_BASE_URL } from 'configs/env';
import { URL_LOCATION_UNIT } from '../constants';

const openSrpRestBase = OPENSRP_API_BASE_URL + '/rest/';

export const baseProps = {
    baseURL: openSrpRestBase,
    opensrpBaseURL: openSrpRestBase,
    keycloakBaseURL: KEYCLOAK_API_BASE_URL,
};

export const locationUnitProps = {
    ...baseProps,
    filterByParentId: false,
};

export const newLocationUnitProps = {
    ...locationUnitProps,
    successURLGenerator: () => URL_LOCATION_UNIT,
    cancelURLGenerator: () => URL_LOCATION_UNIT,
    hidden: ['serviceType', 'latitude', 'longitude'],
};

export const editLocationProps = {
    ...newLocationUnitProps,
    ...locationUnitProps,
};

export const usersListProps = {
    ...baseProps,
    usersPageSize: KEYCLOAK_USERS_PAGE_SIZE,
};

export const teamAssignmentProps = {
    ...baseProps,
    defaultPlanId: DEFAULT_PLAN_ID,
};

export const createEditUserProps = {
    ...baseProps,
    userFormHidden: [],
};
