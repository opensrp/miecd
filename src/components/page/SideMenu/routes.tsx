import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { TFunction } from 'react-i18next';
import {
    HOME_URL,
    NBC_AND_PNC_ANALYSIS_URL,
    NBC_AND_PNC_COMPARTMENTS_URL,
    NBC_AND_PNC_LOGFACE_URL,
    NUTRITION_ANALYSIS_URL,
    NUTRITION_COMPARTMENTS_URL,
    NUTRITION_LOGFACE_URL,
    PREGNANCY_ANALYSIS_URL,
    PREGNANCY_COMPARTMENTS_URL,
    PREGNANCY_LOGFACE_URL,
    URL_LOCATION_UNIT,
    URL_LOCATION_UNIT_GROUP,
    URL_TEAMS,
    URL_TEAM_ASSIGNMENT,
    URL_USER,
    URL_USER_GROUPS,
    URL_USER_ROLES,
} from '../../../constants';

import {
    ENABLE_LOCATIONS,
    ENABLE_TEAMS,
    ENABLE_TEAMS_ASSIGNMENT_MODULE,
    ENABLE_USERS,
    OPENSRP_ROLES,
} from '../../../configs/env';
import { isAuthorized } from '@opensrp/react-utils';
import { ReactComponent as HomeLogo } from '../../../assets/menuIcons/home.svg';
import { ReactComponent as NbcAndPncLogo } from '../../../assets/menuIcons/nbcandpnc.svg';
import { ReactComponent as NutritionLogo } from '../../../assets/menuIcons/nutrition.svg';
import { ReactComponent as PregnancyLogo } from '../../../assets/menuIcons/pregnancy.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';

/** Interface for menu items */
export interface Route {
    key: string;
    enabled?: boolean;
    url?: string;
    title: string;
    otherProps?: {
        icon?: ReactNode;
    };
    children?: Route[];
}

// icons
export const adminModuleNavIconString: IconProp = ['fas', 'cog'];
export const adminModuleNavIcon = <FontAwesomeIcon icon={adminModuleNavIconString} />;

/** Gets Routes For Application
 *
 * @param roles User's roles
 * @returns {Route[]} returns generated routes
 */
export function getRoutes(roles: string[], t: TFunction): Route[] {
    const activeRoles = OPENSRP_ROLES;

    const routes: Route[] = [
        {
            otherProps: { icon: <HomeLogo /> },
            title: t('Home'),
            key: 'home',
            enabled: true,
            url: HOME_URL,
        },
        {
            otherProps: { icon: <PregnancyLogo /> },
            title: t('Pregnancy'),
            key: 'pregnancy',
            enabled: true,
            children: [
                {
                    title: t('Log face'),
                    key: 'pregnancyLogFace',
                    url: PREGNANCY_LOGFACE_URL,
                },
                {
                    title: t('Compartments'),
                    key: 'pregnancyCompartments',
                    url: PREGNANCY_COMPARTMENTS_URL,
                },
                {
                    title: t('Analysis'),
                    key: 'pregnancyAnalysis',
                    url: PREGNANCY_ANALYSIS_URL,
                },
            ],
        },
        {
            otherProps: { icon: <NbcAndPncLogo /> },
            title: t('NBC & PNC'),
            key: 'nbcPnc',
            enabled: true,
            children: [
                {
                    title: t('Log face'),
                    key: 'nbcPncLogFace',
                    url: NBC_AND_PNC_LOGFACE_URL,
                },
                {
                    title: t('Compartments'),
                    key: 'nbcPncCompartments',
                    url: NBC_AND_PNC_COMPARTMENTS_URL,
                },
                {
                    title: t('Analysis'),
                    key: 'nbcPncAnalysis',
                    url: NBC_AND_PNC_ANALYSIS_URL,
                },
            ],
        },
        {
            otherProps: { icon: <NutritionLogo /> },
            title: t('Nutrition'),
            key: 'nutrition',
            enabled: true,
            children: [
                {
                    title: t('Log face'),
                    key: 'nutritionLogFace',
                    url: NUTRITION_LOGFACE_URL,
                },
                {
                    title: t('Compartments'),
                    key: 'nutritionCompartments',
                    url: NUTRITION_COMPARTMENTS_URL,
                },
                {
                    title: t('Analysis'),
                    key: 'nutritionAnalysis',
                    url: NUTRITION_ANALYSIS_URL,
                },
            ],
        },
        {
            otherProps: { icon: adminModuleNavIcon },
            title: t('admin'),
            key: 'admin',
            enabled: true,
            url: '/admin',
            children: [
                {
                    title: t('User Management'),
                    key: 'users',
                    enabled:
                        ENABLE_USERS && roles && activeRoles.USERS && isAuthorized(roles, activeRoles.USERS.split(',')),
                    children: [
                        { title: t('Users'), key: 'user', url: URL_USER },
                        { title: t('User groups'), key: 'user-groups', url: URL_USER_GROUPS },
                        { title: t('User roles'), key: 'user-roles', url: URL_USER_ROLES },
                    ],
                },
                {
                    title: 'Locations',
                    key: 'location',
                    enabled: ENABLE_LOCATIONS,
                    children: [
                        { title: t('Location unit'), url: URL_LOCATION_UNIT, key: 'location-unit' },
                        {
                            title: t('Location unit group'),
                            url: URL_LOCATION_UNIT_GROUP,
                            key: 'location-group',
                        },
                    ],
                },
                {
                    title: t('Team management'),
                    key: 'teams',
                    enabled: ENABLE_TEAMS,
                    children: [
                        { title: t('Teams'), url: URL_TEAMS, key: 'teams-list' },
                        {
                            title: t('Teams assignment'),
                            url: URL_TEAM_ASSIGNMENT,
                            key: 'team-assignment',
                            enabled: ENABLE_TEAMS_ASSIGNMENT_MODULE,
                        },
                    ],
                },
            ],
        },
    ];

    return filterFalsyRoutes(routes);
}

/** Removes the disabled Routes from
 *
 * @param routes all routes
 * @returns {Route[]} returns only enabled routes
 */
export function filterFalsyRoutes(routes: Route[]): Route[] {
    return routes
        .filter((e) => !e.hasOwnProperty('enabled') || (e.hasOwnProperty('enabled') && e.enabled === true))
        .map((e) => {
            return e.children ? { ...e, children: filterFalsyRoutes(e.children) } : e;
        });
}

/** Gets Active key for menu based on path from routes
 *
 * @param routes - The routes to get search the active route from
 * @param path - an array of menu location path
 */
export function getActiveKey(path: string, routes: Route[]) {
    let activeKey: string | undefined;

    function mapMenus(menu: Route) {
        // Matching Url
        if (menu.url && path.includes(menu.url)) activeKey = menu.key;

        // Exact Match
        if (path === menu.url) activeKey = menu.key;
        // Trying to Match with Children
        else if (menu.children && path !== menu.url) menu.children.forEach(mapMenus);
    }
    routes.forEach(mapMenus);

    return activeKey;
}
