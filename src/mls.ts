import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { VI_LANGUAGE_CODE, EN_LANGUAGE_CODE } from './constants';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const enJson = require('./locales/en.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const viJson = require('./locales/vi.json');

export const namespace = 'translation';

// the format to load the resource files: <languageCode>_<projectCode>. in small
const resources = {
    [EN_LANGUAGE_CODE]: {
        [namespace]: enJson,
    },
    [VI_LANGUAGE_CODE]: {
        [namespace]: viJson,
    },
};

const langDetectorOptions = {
    // order and from where user language should be detected
    order: ['cookie', 'localStorage', 'navigator'],

    // keys or params to lookup language from
    lookupCookie: 'locale',
    lookupLocalStorage: 'locale',

    // cache user language on
    caches: ['localStorage', 'cookie'],
    excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)

    // only detect languages that are in the whitelist
    checkWhitelist: true,
};

i18n.use(LanguageDetector)
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        fallbackLng: EN_LANGUAGE_CODE,
        detection: langDetectorOptions,
        resources,
        nsSeparator: ':::',
        keySeparator: '::',
        returnEmptyString: false,
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    });

export default i18n;
