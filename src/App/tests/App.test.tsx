import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Router } from 'react-router';
import store from '../../store';
import App from '../App';

const history = createBrowserHistory();

jest.mock('../../configs/env');

describe('App', () => {
    const ActualWindowLocation = window.location;
    afterAll(() => {
        window.location = ActualWindowLocation;
    });
    delete window.location;
    const applyHrefMock = (mock: jest.Mock) => {
        (window.location as any) = {
            set href(url: string) {
                mock(url);
            },
        };
    };
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // eslint-disable-next-line jest/expect-expect
    it('renders without crashing', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const hrefMock = jest.fn();
        applyHrefMock(hrefMock);

        const wrapper = mount(
            <Provider store={store}>
                <Router history={history}>
                    <App />
                </Router>
            </Provider>,
            { attachTo: div },
        );
        wrapper.unmount();
    });

    it('login inits correctly', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const hrefMock = jest.fn();
        applyHrefMock(hrefMock);
        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter
                    initialEntries={[
                        {
                            hash: '',
                            pathname: `/login`,
                            search: '',
                            state: {},
                        },
                    ]}
                >
                    <App />
                </MemoryRouter>
            </Provider>,
            { attachTo: div },
        );
        wrapper.unmount();
        expect(hrefMock).toBeCalledWith(
            'https://test-stage.smartregister.org/opensrp/oauth/authorize?client_id=hunter1&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth%2Fcallback%2FOpenSRP%2F&response_type=token&state=opensrp&scope=read%20write',
        );
    });
});
