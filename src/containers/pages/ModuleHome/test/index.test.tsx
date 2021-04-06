import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import ModuleHome from '..';
import { PREGNANCY_ANALYSIS_URL, PREGNANCY_COMPARTMENTS_URL, PREGNANCY_LOGFACE_URL } from '../../../../constants';
import { mountWithTranslations } from '../../../../helpers/testUtils';

const history = createBrowserHistory();

describe('PregnancyHome', () => {
    // eslint-disable-next-line jest/expect-expect
    it('must render without crashing', () => {
        shallow(<ModuleHome />);
    });

    it('must render correctly', () => {
        const wrapper = mountWithTranslations(
            <Router history={history}>
                <ModuleHome
                    title="Welcome to the pregnancy dashboard"
                    description={'description'}
                    logfaceUrl={PREGNANCY_LOGFACE_URL}
                    compartmentUrl={PREGNANCY_COMPARTMENTS_URL}
                    analysisUrl={PREGNANCY_ANALYSIS_URL}
                />
            </Router>,
        );
        expect(toJson(wrapper.find('.module-home-main'))).toMatchSnapshot();
        wrapper.unmount();
    });
});
