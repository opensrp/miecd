import Adapter from 'enzyme-adapter-react-16';
import Enzyme from 'enzyme';
import { GlobalWithFetchMock } from 'jest-fetch-mock';

const customGlobal: GlobalWithFetchMock = (global as unknown) as GlobalWithFetchMock;
/* tslint:disable-next-line no-var-requires */
customGlobal.fetch = require('jest-fetch-mock');

customGlobal.fetchMock = customGlobal.fetch;

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
