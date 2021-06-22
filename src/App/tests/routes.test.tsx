import { authenticateUser } from '@onaio/session-reducer';
import { PREGNANCY_ANALYSIS_URL, NBC_AND_PNC_ANALYSIS_URL, NUTRITION_ANALYSIS_URL } from '../../constants';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter, RouteComponentProps } from 'react-router';
import store from '../../store';
import App from '../App';
import toJson from 'enzyme-to-json';
import React from 'react';

jest.mock('containers/pages/Analysis', () => {
    const Analysis = () => {
        return <div>This is Analysis</div>;
    };
    return Analysis;
});

jest.mock('../../configs/env');

describe('App', () => {
    beforeAll(() => {
        store.dispatch(
            authenticateUser(
                true,
                {
                    email: 'test@gmail.com',
                    name: 'This Name',
                    username: 'tHat Part',
                },
                {
                    roles: ['ROLE_VIEW_KEYCLOAK_USERS'],
                    username: 'superset-user',
                    user_id: 'cab07278-c77b-4bc7-b154-bcbf01b7d35b',
                },
            ),
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('Analysis routes are correctly registered', async () => {
        // redirecting to certain routes renders the correct page
        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter initialEntries={[{ pathname: PREGNANCY_ANALYSIS_URL }]}>
                    <App />
                </MemoryRouter>
            </Provider>,
        );
        await act(async () => {
            await new Promise<unknown>((resolve) => setImmediate(resolve));
            wrapper.update();
        });

        expect(toJson(wrapper.find('Analysis'))).toMatchSnapshot('pregnancy module');

        // go to new product page
        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(NBC_AND_PNC_ANALYSIS_URL);
        wrapper.update();
        expect(toJson(wrapper.find('Analysis'))).toMatchSnapshot('nbc and pnc module');

        // go to edit product page
        (wrapper.find('Router').prop('history') as RouteComponentProps['history']).push(NUTRITION_ANALYSIS_URL);
        wrapper.update();
        expect(toJson(wrapper.find('Analysis'))).toMatchSnapshot('nutrition module');
        wrapper.unmount();
    });
});
