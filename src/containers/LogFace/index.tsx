/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-use-before-define */
import reducerRegistry from '@onaio/redux-reducer-registry';
import { map } from 'lodash';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Table } from 'reactstrap';
import Ripple from '../../components/page/Loading';
import RiskColoring from '../../components/RiskColoring';
import {
    LogFaceModules,
    LogFaceSliceByModule,
    riskCategories,
    SmsTypes,
    supersetPregnancyDataExportUrl,
} from '../../configs/settings';
import {
    DEFAULT_PAGINATION_SIZE,
    LOCATION_FILTER_PARAM,
    NBC_AND_PNC,
    NBC_AND_PNC_LOGFACE_URL,
    NUTRITION,
    NUTRITION_LOGFACE_URL,
    PREGNANCY,
    PREGNANCY_LOGFACE_URL,
    PREGNANCY_MODULE,
    RISK_CATEGORY_FILTER_PARAM,
    SEARCH_FILTER_PARAM,
    SMS_TYPE_FILTER_PARAM,
} from '../../constants';
import {
    getLinkToPatientDetail,
    useHandleBrokenPage,
    parseMessage,
    formatAge,
    logFaceSupersetCall,
    getCommonPaginationProps,
    translatedModuleLabel,
} from '../../helpers/utils';
import supersetFetch from '../../services/superset';
import locationsReducer, { reducerName as locationReducerName } from '../../store/ducks/locations';
import { fetchLogFaceSms } from '../../store/ducks/sms_events';
import smsReducer, { reducerName as smsReducerName } from '../../store/ducks/sms_events';
import './index.css';
import { useTranslation, withTranslation } from 'react-i18next';
import { ErrorPage } from 'components/ErrorPage';
import Select from 'react-select';
import { updateUrlWithFilter } from './utils';
import { SelectLocationFilter } from './SelectLocationFilter';
import { Dictionary } from '@onaio/utils';
import ReactPaginate from 'react-paginate';
import { useGetLogFaceFilteredSms, useUserAssignment } from 'helpers/dataHooks';

reducerRegistry.register(smsReducerName, smsReducer);
reducerRegistry.register(locationReducerName, locationsReducer);

/**
 * Interface representing Logface props
 */
export interface LogFaceProps {
    module: LogFaceModules;
    fetchLogFaceSmsCreator: typeof fetchLogFaceSms;
    numberOfRows: number;
    supersetService: typeof supersetFetch;
}

const defaultProps: LogFaceProps = {
    fetchLogFaceSmsCreator: fetchLogFaceSms,
    module: PREGNANCY_MODULE,
    numberOfRows: DEFAULT_PAGINATION_SIZE,
    supersetService: supersetFetch,
};

export type LogFacePropsType = LogFaceProps & RouteComponentProps;

/**
 * The LogFace component
 * @param {LogFaceProps} props
 */
const LogFace = (props: LogFacePropsType) => {
    const { module, numberOfRows, fetchLogFaceSmsCreator, supersetService } = props;
    const { error, handleBrokenPage, broken } = useHandleBrokenPage();
    const [loading, setLoading] = React.useState<boolean>(true);
    const supersetSlice = LogFaceSliceByModule[module];

    useEffect(() => {
        logFaceSupersetCall(module, supersetSlice, fetchLogFaceSmsCreator, supersetService)
            .catch((err) => {
                handleBrokenPage(err);
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchLogFaceSmsCreator, module, supersetService, supersetSlice]);

    const [currentPage, setCurrentPage] = useState<number>(0);
    const { t } = useTranslation();

    const { data: userAssignment } = useUserAssignment(t);
    const smsData = useGetLogFaceFilteredSms(props.location, module, userAssignment?.userHierarchy);

    if (broken) {
        return <ErrorPage title={error?.name} message={error?.message} />;
    }

    if (loading) {
        return <Ripple />;
    }

    const handleTermChange = (event: React.FormEvent<HTMLInputElement>) => {
        updateUrlWithFilter(SEARCH_FILTER_PARAM, props, (event.target as HTMLInputElement).value);
    };

    const onPageChangeHandler = (page: { selected: number }) => {
        setCurrentPage(page.selected);
    };

    const totalPageCount = Math.ceil(smsData.length / numberOfRows);
    const paginationProps = {
        ...getCommonPaginationProps(t),
        pageCount: totalPageCount,
        onPageChange: onPageChangeHandler,
    };

    return (
        <div className="logface-content">
            <div>
                <h2 id="logface_title">{`${t('Log Face')} - ${translatedModuleLabel(t)[module]}`}</h2>
            </div>
            <div className="filter-panel">
                <div className="filters">
                    <input
                        type="text"
                        name="input"
                        id="search"
                        placeholder={t('Search ID, Reporter, Patients')}
                        className={`form-control logface-search`}
                        onChange={handleTermChange}
                    />

                    <div className="logface-page-filter">
                        <span>{t('Risk Level')}</span>
                        <Select
                            placeholder={t('Select risk')}
                            options={(riskCategories(t) as Dictionary)[module].map((item: Dictionary) => ({
                                value: item.value,
                                label: item.label,
                            }))}
                            onChange={(val) => updateUrlWithFilter(RISK_CATEGORY_FILTER_PARAM, props, val?.value)}
                            classNamePrefix="logface-filters"
                            isClearable={true}
                            id="risk-filter"
                        />
                    </div>
                    <div className="logface-page-filter">
                        <span>{t('Select Location')}</span>
                        <SelectLocationFilter
                            userLocationTree={userAssignment?.userHierarchy}
                            userLocationId={userAssignment?.location?.uuid}
                            onLocationChange={(value) => updateUrlWithFilter(LOCATION_FILTER_PARAM, props, value)}
                        />
                    </div>
                    <div className="logface-page-filter">
                        <span>{t('Type')}</span>
                        <Select
                            placeholder={t('Select type')}
                            options={SmsTypes.map((value) => ({ value, label: value }))}
                            onChange={(val) => updateUrlWithFilter(SMS_TYPE_FILTER_PARAM, props, val?.value)}
                            classNamePrefix="logface-filters"
                            isClearable={true}
                            id="sms-type-filter"
                        />
                    </div>
                    <a id="export-button" href={supersetPregnancyDataExportUrl(supersetSlice)} download={true}>
                        {t('Export data')}
                    </a>
                </div>
            </div>

            <div className="table-container">
                {smsData.length ? (
                    <Table striped={true} borderless={true}>
                        <thead id="header">
                            <tr>
                                <th className="default-width">{t('Event Date')}</th>
                                <th className="default-width">{t('Location')}</th>
                                <th className="default-width">{t('SMS Type')}</th>
                                <th className="default-width">{t('Reporter')}</th>
                                <th className="default-width">{t('Patient')}</th>
                                <th className="small-width">{t('Age')}</th>
                                <th className="large-width">{t('Message')}</th>
                                <th className="default-width">{t('Risk Level')}</th>
                            </tr>
                        </thead>
                        <tbody id="body">
                            {map(
                                smsData.slice(currentPage * numberOfRows, currentPage * numberOfRows + numberOfRows),
                                (dataObj) => {
                                    return (
                                        <tr key={dataObj.event_id}>
                                            <td className="default-width">{dataObj.EventDate}</td>
                                            <td className="default-width">{dataObj.health_worker_location_name}</td>
                                            <td className="default-width">{dataObj.sms_type}</td>
                                            <td className="default-width">{dataObj.health_worker_name}</td>
                                            <td className="default-width">
                                                <Link
                                                    to={getLinkToPatientDetail(
                                                        dataObj,
                                                        getModuleLogFaceUrlLink(module),
                                                        module,
                                                    )}
                                                >
                                                    {dataObj.patient_id}
                                                </Link>
                                            </td>
                                            <td className="small-width">{formatAge(dataObj.age, t)}</td>
                                            <td className="large-width">{parseMessage(dataObj.message)}</td>
                                            <td className="default-width">
                                                <Link
                                                    to={getLinkToPatientDetail(
                                                        dataObj,
                                                        getModuleLogFaceUrlLink(module),
                                                        module,
                                                    )}
                                                >
                                                    <RiskColoring module={module} dataObject={dataObj} />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                },
                            )}
                        </tbody>
                    </Table>
                ) : (
                    <div className="card">
                        <div className="card-body">{t('No data found')}</div>
                    </div>
                )}
            </div>

            <nav aria-label="Page navigation" className="pagination-container">
                <ReactPaginate {...paginationProps} />
            </nav>
        </div>
    );
};

LogFace.defaultProps = defaultProps;

export { LogFace };

/**
 * @param {string} module a string representing the module this logface is being used for.
 * @return {string} the logface url for the module passed in. empty string if the module is invalid.
 */
function getModuleLogFaceUrlLink(module: string) {
    switch (module) {
        case PREGNANCY:
            return PREGNANCY_LOGFACE_URL;
        case NUTRITION:
            return NUTRITION_LOGFACE_URL;
        case NBC_AND_PNC:
            return NBC_AND_PNC_LOGFACE_URL;
        default:
            return '';
    }
}

export type MapDispatch = Pick<LogFaceProps, 'fetchLogFaceSmsCreator'>;

const mapPropsToActions: MapDispatch = {
    fetchLogFaceSmsCreator: fetchLogFaceSms,
};

const ConnectedLogFace = connect(undefined, mapPropsToActions)(LogFace);

export default withTranslation()(ConnectedLogFace);
