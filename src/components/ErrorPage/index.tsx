import * as React from 'react';
import { useTranslation } from 'react-i18next';
import './index.css';

interface ErrorPageProps {
    title: string;
    message: string;
}

const defaultProps = {
    title: '',
    message: '',
};

/** Error page component shown in pages that experience unrecoverable errors */
const ErrorPage = (props: ErrorPageProps) => {
    const { title, message } = props;
    const { t } = useTranslation();
    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="error-template">
                        <h1>{t('An error occurred')}</h1>
                        <h2>{title}</h2>
                        <div className="error-details">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ErrorPage.defaultProps = defaultProps;

export { ErrorPage };
