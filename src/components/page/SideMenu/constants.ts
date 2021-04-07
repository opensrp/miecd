import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { NavigationModule, PageLink } from './SubMenu';
import { TFunction } from 'react-i18next';
import {
    ANC_URL,
    CHILD_URL,
    CLIENT_URL,
    HOME_URL,
    HOUSEHOLD_URL,
    LOCATIONS_URL,
    NBC_AND_PNC_ANALYSIS_URL,
    NBC_AND_PNC_COMPARTMENTS_URL,
    NBC_AND_PNC_LOGFACE_URL,
    NBC_AND_PNC_URL,
    NUTRITION_ANALYSIS_URL,
    NUTRITION_COMPARTMENTS_URL,
    NUTRITION_LOGFACE_URL,
    NUTRITION_URL,
    PREGNANCY_ANALYSIS_URL,
    PREGNANCY_COMPARTMENTS_URL,
    PREGNANCY_LOGFACE_URL,
    PREGNANCY_URL,
    REPORTS_URL,
    ROLE_URL,
    TEAM_URL,
    USER_URL,
} from '../../../constants';

import {
    ENABLE_ANC_PAGE,
    ENABLE_CHILD_PAGE,
    ENABLE_CLIENT_PAGE,
    ENABLE_HOUSEHOLD_PAGE,
    ENABLE_LOCATION_PAGE,
    ENABLE_ROLE_PAGE,
    ENABLE_TEAM_PAGE,
    ENABLE_USER_PAGE,
} from '../../../configs/env';
import { Dictionary } from '@onaio/utils';

export const navigationPageLinks = (t: TFunction): Dictionary<PageLink> => {
    return {
        // Page links
        CLIENT_PAGE_NAVIGATION: {
            label: t('All clients'),
            url: CLIENT_URL,
        },
        HOUSEHOLD_PAGE_NAVIGATION: {
            label: t('Household'),
            url: HOUSEHOLD_URL,
        },
        ANC_PAGE_NAVIGATION: {
            label: t('ANC'),
            url: ANC_URL,
        },
        CHILD_PAGE_NAVIGATION: {
            label: t('Child'),
            url: CHILD_URL,
        },

        USERS_PAGE_NAVIGATION: {
            label: t('Users'),
            url: USER_URL,
        },
        ROLES_PAGE_NAVIGATION: {
            label: t('Roles'),
            url: ROLE_URL,
        },
        TEAMS_PAGE_NAVIGATION: {
            label: t('Teams'),
            url: TEAM_URL,
        },
        LOCATIONS_PAGE_NAVIGATION: {
            label: t('Locations'),
            url: LOCATIONS_URL,
        },

        PREGNANCY_PAGE_NAVIGATION: {
            label: t('Pregnancy'),
            url: PREGNANCY_URL,
        },

        NUTRITION_PAGE_NAVIGATION: {
            label: t('Nutrition'),
            url: NUTRITION_URL,
        },

        NEWBORN_AND_POSTNATAL_PAGE_NAVIGATION: {
            label: t('NBC & PNC'),
            url: NBC_AND_PNC_URL,
        },

        PREGNANCY_COMPARTMENTS_PAGE_NAVIGATION: {
            label: t('Compartments'),
            url: PREGNANCY_COMPARTMENTS_URL,
        },

        NBC_AND_PNC_COMPARTMENTS_PAGE_NAVIGATION: {
            label: t('Compartments'),
            url: NBC_AND_PNC_COMPARTMENTS_URL,
        },

        NUTRITION_COMPARTMENTS_PAGE_NAVIGATION: {
            label: t('Compartments'),
            url: NUTRITION_COMPARTMENTS_URL,
        },

        NBC_AND_PNC_LOGFACE_PAGE_NAVIGATION: {
            label: t('Log face'),
            url: NBC_AND_PNC_LOGFACE_URL,
        },

        PREGNANCY_LOGFACE_PAGE_NAVIGATION: {
            label: t('Log face'),
            url: PREGNANCY_LOGFACE_URL,
        },

        NUTRITION_LOGFACE_PAGE_NAVIGATION: {
            label: t('Log face'),
            url: NUTRITION_LOGFACE_URL,
        },

        PREGNANCY_ANALYSIS_PAGE_NAVIGATION: {
            label: t('Analysis'),
            url: PREGNANCY_ANALYSIS_URL,
        },

        NBC_AND_PNC_ANALYSIS_PAGE_NAVIGATION: {
            label: t('Analysis'),
            url: NBC_AND_PNC_ANALYSIS_URL,
        },

        NUTRITION_ANALYSIS_PAGE_NAVIGATION: {
            label: t('Analysis'),
            url: NUTRITION_ANALYSIS_URL,
        },
    };
};

// icons
export const homeNavIcon: IconProp = ['fas', 'home'];
export const pregancyNavIcon: IconProp = ['far', 'user'];
export const nbcandpncNavIcon: IconProp = ['far', 'user'];
export const nutritionNavIcon: IconProp = ['far', 'user'];
export const newbornAndPostnatalNavIcon: IconProp = ['far', 'user'];
export const clientModuleNavIcon: IconProp = ['far', 'user'];
export const reportModuleNavIcon: IconProp = ['fas', 'chart-line'];
export const adminModuleNavIcon: IconProp = ['fas', 'cog'];

// Navigation links for navigation module. collapses when clicked to display the pageLinks
export const modulePageLinks = (t: TFunction) => {
    const links = {
        HOME_PARENT_NAV: {
            icon: homeNavIcon,
            label: t('Home'),
            url: HOME_URL,
        },
        NBC_AND_PNC_PARENT_NAV: {
            icon: nbcandpncNavIcon,
            label: t('NBC & PNC'),
            url: NBC_AND_PNC_URL,
        },
        NUTRITION_PARENT_NAVIGATION: {
            icon: nutritionNavIcon,
            label: t('Nutrition'),
            url: NUTRITION_URL,
        },
        PREGNANCY_MODULE_PARENT_NAV: {
            icon: pregancyNavIcon,
            label: t('Pregnancy'),
            url: PREGNANCY_URL,
        },
        CLIENT_MODULE_PARENT_NAV: {
            icon: clientModuleNavIcon,
            label: t('Client Records'),
        },
        REPORT_MODULE_PARENT_NAV: {
            icon: reportModuleNavIcon,
            label: t('Reports'),
            url: REPORTS_URL,
        },
        ADMIN_MODULE_PARENT_NAV: {
            icon: adminModuleNavIcon,
            label: t('Admin'),
        },
    };
    return links;
};

export const navigationModulesFactory = (t: TFunction) => {
    const {
        PREGNANCY_MODULE_PARENT_NAV,
        NBC_AND_PNC_PARENT_NAV,
        NUTRITION_PARENT_NAVIGATION,
        CLIENT_MODULE_PARENT_NAV,
        HOME_PARENT_NAV,
        ADMIN_MODULE_PARENT_NAV,
        REPORT_MODULE_PARENT_NAV,
    } = modulePageLinks(t);
    const {
        PREGNANCY_COMPARTMENTS_PAGE_NAVIGATION,
        PREGNANCY_ANALYSIS_PAGE_NAVIGATION,
        PREGNANCY_LOGFACE_PAGE_NAVIGATION,
        NBC_AND_PNC_LOGFACE_PAGE_NAVIGATION,
        NBC_AND_PNC_COMPARTMENTS_PAGE_NAVIGATION,
        NBC_AND_PNC_ANALYSIS_PAGE_NAVIGATION,
        NUTRITION_LOGFACE_PAGE_NAVIGATION,
        NUTRITION_COMPARTMENTS_PAGE_NAVIGATION,
        NUTRITION_ANALYSIS_PAGE_NAVIGATION,
        CLIENT_PAGE_NAVIGATION,
        HOUSEHOLD_PAGE_NAVIGATION,
        ANC_PAGE_NAVIGATION,
        CHILD_PAGE_NAVIGATION,
        USERS_PAGE_NAVIGATION,
        ROLES_PAGE_NAVIGATION,
        TEAMS_PAGE_NAVIGATION,
        LOCATIONS_PAGE_NAVIGATION,
    } = navigationPageLinks(t);
    // nav module objects
    const navigationModules: Dictionary<NavigationModule> = {
        HOME_NAVIGATION_MODULE: {
            childNavs: [],
            parentNav: HOME_PARENT_NAV,
        },

        PREGNANCY_NAVIGATION_MODULE: {
            childNavs: [
                PREGNANCY_LOGFACE_PAGE_NAVIGATION,
                PREGNANCY_COMPARTMENTS_PAGE_NAVIGATION,
                PREGNANCY_ANALYSIS_PAGE_NAVIGATION,
            ].filter((childNav): childNav is PageLink => typeof childNav !== 'boolean'),
            parentNav: PREGNANCY_MODULE_PARENT_NAV,
        },

        NBC_AND_PNC_NAVIGATION_MODULE: {
            childNavs: [
                NBC_AND_PNC_LOGFACE_PAGE_NAVIGATION,
                NBC_AND_PNC_COMPARTMENTS_PAGE_NAVIGATION,
                NBC_AND_PNC_ANALYSIS_PAGE_NAVIGATION,
            ],
            parentNav: NBC_AND_PNC_PARENT_NAV,
        },

        NUTRITION_MODULE: {
            childNavs: [
                NUTRITION_LOGFACE_PAGE_NAVIGATION,
                NUTRITION_COMPARTMENTS_PAGE_NAVIGATION,
                NUTRITION_ANALYSIS_PAGE_NAVIGATION,
            ],
            parentNav: NUTRITION_PARENT_NAVIGATION,
        },

        CLIENT_NAVIGATION_MODULE: {
            childNavs: [
                ENABLE_CLIENT_PAGE && CLIENT_PAGE_NAVIGATION,
                ENABLE_HOUSEHOLD_PAGE && HOUSEHOLD_PAGE_NAVIGATION,
                ENABLE_ANC_PAGE && ANC_PAGE_NAVIGATION,
                ENABLE_CHILD_PAGE && CHILD_PAGE_NAVIGATION,
            ].filter((childNav): childNav is PageLink => typeof childNav !== 'boolean'),
            parentNav: CLIENT_MODULE_PARENT_NAV,
        },
        REPORT_NAVIGATION_MODULE: {
            childNavs: [],
            parentNav: REPORT_MODULE_PARENT_NAV,
        },
        ADMIN_NAVIGATION_MODULE: {
            childNavs: [
                ENABLE_USER_PAGE && USERS_PAGE_NAVIGATION,
                ENABLE_ROLE_PAGE && ROLES_PAGE_NAVIGATION,
                ENABLE_TEAM_PAGE && TEAMS_PAGE_NAVIGATION,
                ENABLE_LOCATION_PAGE && LOCATIONS_PAGE_NAVIGATION,
            ].filter<PageLink>((childNav: PageLink | boolean): childNav is PageLink => typeof childNav !== 'boolean'),
            parentNav: ADMIN_MODULE_PARENT_NAV,
        },
    };
    return navigationModules;
};

/** Enable Clients Module from its child pages */
export const ENABLE_CLIENT_RECORDS_MODULE =
    ENABLE_ANC_PAGE || ENABLE_CLIENT_PAGE || ENABLE_HOUSEHOLD_PAGE || ENABLE_HOUSEHOLD_PAGE;
export type ENABLE_CLIENT_RECORDS_MODULE = typeof ENABLE_CLIENT_RECORDS_MODULE;

/** Enable Admin Module from its child pages */
export const ENABLE_ADMIN_MODULE = ENABLE_USER_PAGE || ENABLE_ROLE_PAGE || ENABLE_TEAM_PAGE || ENABLE_LOCATION_PAGE;
export type ENABLE_ADMIN_MODULE = typeof ENABLE_ADMIN_MODULE;
