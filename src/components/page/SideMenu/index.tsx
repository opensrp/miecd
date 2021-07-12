import React from 'react';
import { withRouter } from 'react-router';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Menu from 'rc-menu';
import './index.css';
import { getActiveKey, getRoutes, Route } from './routes';
import { getExtraData } from '@opensrp/store';
import 'rc-menu/assets/index.css';
import { useSelector } from 'react-redux';

/** The Sidebar component */
export const SidebarComponent: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [openKeys, setOpenKeys] = React.useState<React.Key[]>([]);

    const extraData = useSelector((state) => getExtraData(state));
    const { roles } = extraData;

    const routes = React.useMemo(() => getRoutes(roles as string[], t), [roles, t]);

    const sidebaritems: JSX.Element[] = React.useMemo(() => {
        function mapChildren(route: Route) {
            const icon = route.otherProps?.icon;
            if (route.children) {
                const title = (
                    <>
                        {icon}&nbsp;&nbsp;&nbsp;{route.title}
                    </>
                );

                return (
                    <Menu.SubMenu key={route.key} title={title}>
                        {route.children.map(mapChildren)}
                    </Menu.SubMenu>
                );
            } else if (route.url) {
                return (
                    <Menu.Item key={route.key}>
                        <Link className="admin-link" to={route.url}>
                            {icon ? (
                                <>
                                    {icon}&nbsp;&nbsp;&nbsp;{route.title}
                                </>
                            ) : (
                                route.title
                            )}
                        </Link>
                    </Menu.Item>
                );
            } else {
                return <Menu.Item key={route.key}>{route.title}</Menu.Item>;
            }
        }

        return routes.map(mapChildren);
    }, [routes]);

    const activeLocationPaths = location.pathname.split('/').filter((locString: string) => locString.length);
    const activeKey = getActiveKey(location.pathname, routes);

    return (
        <div>
            <div className="side-menu-container">
                <Menu
                    key="main-menu"
                    selectedKeys={[activeKey ?? '']}
                    openKeys={openKeys.length ? (openKeys as string[]) : activeLocationPaths}
                    defaultOpenKeys={activeLocationPaths}
                    defaultSelectedKeys={[activeKey ?? '']}
                    onOpenChange={(keys) => setOpenKeys(keys)}
                    mode="inline"
                    className="menu-dark"
                >
                    {sidebaritems}
                </Menu>
            </div>
        </div>
    );
};

const Sidebar = withRouter(SidebarComponent);

export default Sidebar;
