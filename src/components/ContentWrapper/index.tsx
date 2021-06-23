import React, { ReactNode } from 'react';
import './index.css';

export interface ContentWrapperProps {
    children: ReactNode;
    className?: string;
}

export const ContentWrapper = (props: ContentWrapperProps) => {
    const { className } = props;
    return <div className={`content-wrapper ${className ? className : ''}`}>{props.children}</div>;
};
