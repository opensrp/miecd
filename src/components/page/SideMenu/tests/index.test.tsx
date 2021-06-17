import { filterFalsyRoutes } from '../routes';

describe('routes', () => {
    it('Test routes only return enabled values', () => {
        const routes = filterFalsyRoutes([
            {
                children: [
                    { key: 'child-x-a', title: 'a', url: '/child-x/a' },
                    { key: 'child-x-t', title: 't', url: '/child-x/t' },
                ],
                key: 'child-x',
                title: 'child-x',
            },
            {
                children: [
                    {
                        children: [
                            { key: 'childs-y', title: 'childs-y', url: '/admin/childs-y' },
                            { key: 'childs-y-r', title: 'childs-y', url: '/admin/childs-y/r' },
                        ],
                        enabled: true,
                        key: 'childs-y',
                        title: 'childs-y',
                    },
                    {
                        children: [
                            { key: 'child-z-u', title: 'child-z-u', url: '/admin/child-z/u' },
                            { key: 'child-z-g', title: 'child-z-g', url: '/admin/child-z/g' },
                        ],
                        enabled: undefined,
                        key: 'child-z',
                        title: 'child-z',
                    },
                    {
                        enabled: false,
                        key: 'child-i',
                        title: 'child-i',
                        url: '/admin/child-i',
                        children: [
                            { key: 'child-i-u', enabled: true, title: 'child-i-u', url: '/admin/child-i/u' },
                            { key: 'child-i-g', enabled: true, title: 'child-i-g', url: '/admin/child-i/g' },
                        ],
                    },
                ],
                enabled: true,
                key: 'admin',
                title: 'Admin',
                url: '/admin',
            },
        ]);

        expect(routes).toMatchObject([
            {
                children: [
                    { key: 'child-x-a', title: 'a', url: '/child-x/a' },
                    { key: 'child-x-t', title: 't', url: '/child-x/t' },
                ],
                key: 'child-x',
                title: 'child-x',
            },
            {
                children: [
                    {
                        children: [
                            { key: 'childs-y', title: 'childs-y', url: '/admin/childs-y' },
                            { key: 'childs-y-r', title: 'childs-y', url: '/admin/childs-y/r' },
                        ],
                        enabled: true,
                        key: 'childs-y',
                        title: 'childs-y',
                    },
                ],
                enabled: true,
                key: 'admin',
                title: 'Admin',
                url: '/admin',
            },
        ]);
    });
});
