import { mount, MountRendererProps } from 'enzyme';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../mls';
import { act } from 'react-dom/test-utils';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export const mountWithTranslations: typeof mount = (component: React.ReactNode, options?: MountRendererProps) => {
    return mount(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>, options);
};

/**
 * Utility to await promises to resolve in tests
 * @param ms time in ms
 */
export async function waitForPromises() {
    await act(async () => {
        await new Promise((res) => setImmediate(res));
    });
}

/** wrapper to add providers when mounting components with tests */
export const mountWithProviders: typeof mount = (component: React.ReactNode, options?: MountRendererProps) => {
    return mount(
        <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18n}>{component}</I18nextProvider>
        </QueryClientProvider>,
        options,
    );
};
