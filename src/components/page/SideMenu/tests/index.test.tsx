import { filterFalsyRoutes, getRoutes, Route } from '../routes';
jest.mock('../../../../configs/env');

/** checks if a route with a certain key is enabled */
const routesHasKey = (key: string, routes: Route[]): boolean => {
    let result = false;

    const iterator = (key: string, routes: Route[]) => {
        for (const route of routes) {
            if (route.key === key) {
                result = true;
                return;
            } else if (route?.children?.length) {
                iterator(key, route.children ?? []);
            }
        }
    };
    iterator(key, routes);
    return result;
};

describe('routes', () => {
    it('Test routes only return enabled values', () => {
        const routes = filterFalsyRoutes([
            {
                children: [
                    { key: 'child-x-a', title: 'a', url: '/child-x/a' },
                    { key: 'child-x-t', title: 't', url: '/child-x/t' },
                ],
                key: 'child-x',
                title: 'child-x',
            },
            {
                children: [
                    {
                        children: [
                            { key: 'childs-y', title: 'childs-y', url: '/admin/childs-y' },
                            { key: 'childs-y-r', title: 'childs-y', url: '/admin/childs-y/r' },
                        ],
                        enabled: true,
                        key: 'childs-y',
                        title: 'childs-y',
                    },
                    {
                        children: [
                            { key: 'child-z-u', title: 'child-z-u', url: '/admin/child-z/u' },
                            { key: 'child-z-g', title: 'child-z-g', url: '/admin/child-z/g' },
                        ],
                        enabled: undefined,
                        key: 'child-z',
                        title: 'child-z',
                    },
                    {
                        enabled: false,
                        key: 'child-i',
                        title: 'child-i',
                        url: '/admin/child-i',
                        children: [
                            { key: 'child-i-u', enabled: true, title: 'child-i-u', url: '/admin/child-i/u' },
                            { key: 'child-i-g', enabled: true, title: 'child-i-g', url: '/admin/child-i/g' },
                        ],
                    },
                ],
                enabled: true,
                key: 'admin',
                title: 'Admin',
                url: '/admin',
            },
        ]);

        expect(routes).toMatchObject([
            {
                children: [
                    {
                        children: [],
                        enabled: true,
                        key: 'childs-y',
                        title: 'childs-y',
                    },
                ],
                enabled: true,
                key: 'admin',
                title: 'Admin',
                url: '/admin',
            },
        ]);
    });

    it('enables routes when configured so', () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const envModule = require('../../../../configs/env');
        envModule.OPENSRP_ROLES = {
            USERS: 'ROLE_EDIT_KEYCLOAK_USERS',
            ADMIN: 'ROLE_EDIT_KEYCLOAK_USERS',
            PLANS: 'ROLE_VIEW_KEYCLOAK_USERS',
            CARD_SUPPORT: 'ROLE_VIEW_KEYCLOAK_USERS',
            PRODUCT_CATALOGUE: 'ROLE_VIEW_KEYCLOAK_USERS',
            FORM_CONFIGURATION: 'ROLE_VIEW_KEYCLOAK_USERS',
            LOCATIONS: 'ROLE_VIEW_KEYCLOAK_USERS',
            INVENTORY: 'ROLE_VIEW_KEYCLOAK_USERS',
            TEAMS: 'ROLE_VIEW_KEYCLOAK_USERS',
        };
        envModule.ENABLE_USERS = true;
        envModule.ENABLE_TEAMS = true;
        envModule.ENABLE_LOCATIONS = true;

        const customT = (text: string) => text;
        const routes = getRoutes(['ROLE_VIEW_KEYCLOAK_USERS', 'ROLE_EDIT_KEYCLOAK_USERS'], customT);

        // find route with key user
        expect(routesHasKey('admin', routes)).toBeTruthy();
        expect(routesHasKey('users', routes)).toBeTruthy();
        expect(routesHasKey('locations', routes)).toBeTruthy();
        expect(routesHasKey('teams', routes)).toBeTruthy();
    });

    it('disables routes when configured so', () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const envModule = require('../../../../configs/env');
        envModule.OPENSRP_ROLES = {
            USERS: 'ROLE_EDIT_KEYCLOAK_USERS',
            ADMIN: 'ROLE_EDIT_KEYCLOAK_USERS',
            PLANS: 'ROLE_VIEW_KEYCLOAK_USERS',
            CARD_SUPPORT: 'ROLE_VIEW_KEYCLOAK_USERS',
            PRODUCT_CATALOGUE: 'ROLE_VIEW_KEYCLOAK_USERS',
            FORM_CONFIGURATION: 'ROLE_VIEW_KEYCLOAK_USERS',
            LOCATIONS: 'ROLE_VIEW_KEYCLOAK_USERS',
            INVENTORY: 'ROLE_VIEW_KEYCLOAK_USERS',
            TEAMS: 'ROLE_VIEW_KEYCLOAK_USERS',
        };
        envModule.ENABLE_USERS = false;
        envModule.ENABLE_TEAMS = false;
        envModule.ENABLE_LOCATIONS = false;

        const customT = (text: string) => text;
        const routes = getRoutes(['ROLE_VIEW_KEYCLOAK_USERS', 'ROLE_EDIT_KEYCLOAK_USERS'], customT);

        // find route with key user
        expect(routesHasKey('admin', routes)).toBeFalsy();
        expect(routesHasKey('users', routes)).toBeFalsy();
        expect(routesHasKey('locations', routes)).toBeFalsy();
        expect(routesHasKey('teams', routes)).toBeFalsy();
    });

    it('disables routes when user roles not authorized so', () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const envModule = require('../../../../configs/env');
        envModule.OPENSRP_ROLES = {
            USERS: 'ROLE_EDIT_KEYCLOAK_USERS',
            ADMIN: 'ROLE_EDIT_KEYCLOAK_USERS',
            PLANS: 'ROLE_VIEW_KEYCLOAK_USERS',
            CARD_SUPPORT: 'ROLE_VIEW_KEYCLOAK_USERS',
            PRODUCT_CATALOGUE: 'ROLE_VIEW_KEYCLOAK_USERS',
            FORM_CONFIGURATION: 'ROLE_VIEW_KEYCLOAK_USERS',
            LOCATIONS: 'ROLE_VIEW_KEYCLOAK_USERS',
            INVENTORY: 'ROLE_VIEW_KEYCLOAK_USERS',
            TEAMS: 'ROLE_VIEW_KEYCLOAK_USERS',
        };
        envModule.ENABLE_USERS = false;
        envModule.ENABLE_TEAMS = false;
        envModule.ENABLE_LOCATIONS = false;

        const customT = (text: string) => text;
        const routes = getRoutes([], customT);

        // find route with key user
        expect(routesHasKey('admin', routes)).toBeFalsy();
        expect(routesHasKey('users', routes)).toBeFalsy();
        expect(routesHasKey('locations', routes)).toBeFalsy();
        expect(routesHasKey('teams', routes)).toBeFalsy();
    });
});
