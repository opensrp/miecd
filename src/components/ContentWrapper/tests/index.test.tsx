import React from 'react';
import { mount } from 'enzyme';
import { ContentWrapper } from '..';
import toJson from 'enzyme-to-json';

const MockComponent = () => <div>I love oov!</div>;

describe('components content wrapper', () => {
    it('default props', () => {
        const wrapper = mount(
            <ContentWrapper>
                <MockComponent />
            </ContentWrapper>,
        );

        expect(wrapper.text()).toMatchInlineSnapshot(`"I love oov!"`);
    });

    it('add className', () => {
        const wrapper = mount(
            <ContentWrapper className="sample-class">
                <MockComponent />
            </ContentWrapper>,
        );

        expect(toJson(wrapper.find('div'))).toMatchInlineSnapshot(`
            Array [
              <div
                className="content-wrapper sample-class"
              >
                <MockComponent>
                  <div>
                    I love oov!
                  </div>
                </MockComponent>
              </div>,
              <div>
                I love oov!
              </div>,
            ]
        `);
    });
});
