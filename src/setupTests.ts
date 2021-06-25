import Adapter from 'enzyme-adapter-react-16';
import Enzyme from 'enzyme';
import { setAllConfigs } from '@opensrp/pkg-config';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const configuredLanguage = `en_core`;

i18n.use(initReactI18next)
    .init({
        lng: configuredLanguage,
        fallbackLng: configuredLanguage,
        interpolation: { escapeValue: false },
        returnEmptyString: false,
        nsSeparator: '::',
        keySeparator: false,
        react: {
            useSuspense: false,
        },
    })
    .catch((err) => err);

setAllConfigs({
    i18n: i18n,
    projectLanguageCode: 'core',
});

global.fetch = require('jest-fetch-mock');

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => void 0,
        addListener: () => void 0,
        dispatchEvent: () => void 0,
        removeEventListener: () => void 0,
        removeListener: () => void 0,
    })),
});

Enzyme.configure({ adapter: new Adapter() });
