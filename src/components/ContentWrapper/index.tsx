import React, { ReactNode } from 'react';
import './index.css';

export interface ContentWrapperProps {
    children: ReactNode;
}

export const ContentWrapper = (props: ContentWrapperProps) => {
    return <div className="content-wrapper">{props.children}</div>;
};
