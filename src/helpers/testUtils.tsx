import { mount, MountRendererProps } from 'enzyme';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../mls';
import { act } from 'react-dom/test-utils';

export const mountWithTranslations: typeof mount = (component: React.ReactNode, options?: MountRendererProps) => {
    return mount(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>, options);
};

/**
 * Utility to await promises to resolve in tests
 * @param ms time in ms
 */
export async function waitForPromises(ms = 0) {
    await act(() => {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    });
}
