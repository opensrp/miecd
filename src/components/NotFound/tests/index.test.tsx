import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import NotFound from '..';

describe('NotFound', () => {
    it('renders correclty', () => {
        const wrapper = mount(<NotFound />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
