import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardTitle, Row, Table } from 'reactstrap';
import { NBC_AND_PNC_CHILD, NUTRITION, PREGNANCY } from '../../constants';
import { getModuleLink, getNumberOfDaysSinceDate } from '../../helpers/utils';
import { SmsData } from '../../store/ducks/sms_events';
import { PaginationData, Paginator, PaginatorProps } from '../Paginator';
import RiskColoring from '../RiskColoring';
import './index.css';

export interface Props {
    current_level: number;
    smsData: SmsData[];
    module: string;
}

interface State {
    currentPage: number;
}

const defaultProps: Props = {
    current_level: 0,
    module: '',
    smsData: [],
};

export type VillageDataPropsType = Props & WithTranslation;

class VillageData extends React.Component<VillageDataPropsType, State> {
    public static defaultProps = defaultProps;

    constructor(props: VillageDataPropsType) {
        super(props);
        this.state = {
            currentPage: 1,
        };
    }

    public render() {
        const { t } = this.props;

        const routePaginatorProps: PaginatorProps = {
            endLabel: t('last'),
            nextLabel: t('next'),
            onPageChange: (paginationData: PaginationData) => {
                this.setState({
                    currentPage: paginationData.currentPage,
                });
            },
            pageLimit: 5,
            pageNeighbours: 3,
            previousLabel: t('previous'),
            startLabel: t('first'),
            totalRecords: this.props.smsData.length,
        };

        return (
            <>
                {this.props.current_level >= 3 ? (
                    <>
                        <Row className="village villageDataRow">
                            <Card className="table-card">
                                <CardTitle>{t('Selected Commune')}</CardTitle>
                                <CardBody>
                                    <Table striped borderless>
                                        <thead id="header">
                                            {this.props.module === PREGNANCY ? (
                                                <tr>
                                                    <th className="default-width">{t('Patient ID')}</th>
                                                    <th className="default-width">{t('Gravidity')}</th>
                                                    <th className="default-width">{t('Parity')}</th>
                                                    <th className="default-width">{t('Location')}</th>
                                                    <th className="default-width">{t('EDD')}</th>
                                                    <th className="default-width">{t('Previous Pregnancy Risk')}</th>
                                                    <th className="default-width">{t('Risk category')}</th>
                                                </tr>
                                            ) : this.props.module === NUTRITION ? (
                                                <tr>
                                                    <th className="default-width">{t('Patient ID')}</th>
                                                    <th className="default-width">{t('Days since birth')}</th>
                                                    <th className="default-width">{t('Location of Residence')}</th>
                                                    <th className="default-width">{t('Current weight')}</th>
                                                    <th className="default-width">{t('Location of birth')}</th>
                                                    <th className="default-width">{t('Risk category')}</th>
                                                </tr>
                                            ) : (
                                                <tr>
                                                    <th className="default-width">{t('Patient ID')}</th>
                                                    <th className="default-width">{t('Days since birth')}</th>
                                                    <th className="default-width">{t('Location of Residence')}</th>
                                                    <th className="default-width">{t('Current symptoms')}</th>
                                                    <th className="default-width">{t('Location of birth')}</th>
                                                    <th className="default-width">{t('Risk category')}</th>
                                                </tr>
                                            )}
                                        </thead>
                                        <tbody id="body">
                                            {this.props.smsData.length
                                                ? this.props.smsData
                                                      .slice(
                                                          (this.state.currentPage - 1) * routePaginatorProps.pageLimit,
                                                          (this.state.currentPage - 1) * routePaginatorProps.pageLimit +
                                                              routePaginatorProps.pageLimit,
                                                      )
                                                      .map(
                                                          this.props.module === PREGNANCY
                                                              ? this.pregnancyMapFunction
                                                              : this.props.module === NBC_AND_PNC_CHILD
                                                              ? this.nbcAndPncChildMapFunction
                                                              : this.props.module === NUTRITION
                                                              ? this.nutritionMapFunction
                                                              : this.nbcAndPncMotherMapFunction,
                                                      )
                                                : null}
                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </Row>
                        <Row id="navrow" className="villageDataRow">
                            <Paginator {...routePaginatorProps} />
                        </Row>
                    </>
                ) : null}
            </>
        );
    }

    /**
     * Returns a <tr></tr> for an SmsData object passed to it
     * which is used to build the table above.
     * for the NBC & PNC_MOTHER module
     * @param {SmsData} dataItem - an SmsData object used to generate a table row
     * @return {JSX.Element} table row
     */
    public nbcAndPncMotherMapFunction = (dataItem: SmsData): JSX.Element => {
        return (
            <tr key={dataItem.event_id}>
                <td className="default-width">
                    <Link to={`${getModuleLink(this.props.module)}/patient_detail/${dataItem.anc_id}`}>
                        {dataItem.anc_id}
                    </Link>
                </td>
                <td className="default-width">{getNumberOfDaysSinceDate(dataItem.EventDate)}</td>
                <td className="default-width">{dataItem.health_worker_location_name}</td>
                <td className="default-width">{dataItem.mother_symptoms}</td>
                <td className="default-width">{dataItem.health_worker_location_name}</td>
                <td className="default-width">
                    <RiskColoring {...{ risk: dataItem.logface_risk }} />
                </td>
            </tr>
        );
    };

    /**
     * Returns a <tr></tr> for an SmsData object passed to it
     * which is used to build the table above.
     * for the NBC & PNC_CHILD module
     * @param {SmsData} dataItem - an SmsData object used to generate a table row
     * @return {JSX.Element} table row
     */
    public nbcAndPncChildMapFunction = (dataItem: SmsData): JSX.Element => {
        return (
            <tr key={dataItem.event_id}>
                <td className="default-width">
                    <Link to={`${getModuleLink(this.props.module)}/child_patient_detail/${dataItem.anc_id}`}>
                        {dataItem.anc_id}
                    </Link>
                </td>
                <td className="default-width">{getNumberOfDaysSinceDate(dataItem.EventDate)}</td>
                <td className="default-width">{dataItem.health_worker_location_name}</td>
                <td className="default-width">{dataItem.child_symptoms}</td>
                <td className="default-width">{dataItem.health_worker_location_name}</td>
                <td className="default-width">
                    <RiskColoring {...{ risk: dataItem.logface_risk }} />
                </td>
            </tr>
        );
    };

    /**
     * Returns a <tr></tr> for an SmsData object passed to it
     * which is used to build the table above.
     * for the PREGNANCY module
     * @param {SmsData} dataItem - an SmsData object used to generate a table row
     * @return {JSX.Element} table row
     */
    public pregnancyMapFunction = (dataItem: SmsData): JSX.Element => {
        return (
            <tr key={dataItem.event_id}>
                <td className="default-width">
                    <Link to={`${getModuleLink(this.props.module)}/patient_detail/${dataItem.anc_id}`}>
                        {dataItem.anc_id}
                    </Link>
                </td>
                <td className="default-width">{dataItem.gravidity}</td>
                <td className="default-width">{dataItem.parity}</td>
                <td className="default-width">{dataItem.health_worker_location_name}</td>
                <td className="default-width">{dataItem.lmp_edd}</td>
                <td className="default-width">{dataItem.previous_risks}</td>
                <td className="default-width">
                    <RiskColoring {...{ risk: dataItem.logface_risk }} />
                </td>
            </tr>
        );
    };

    /**
     * Returns a <tr></tr> for an SmsData object passed to it
     * which is used to build the table above.
     * for the NUTRITION module
     * @param {SmsData} dataItem - an SmsData object used to generate a table row
     * @return {JSX.Element} table row
     */
    public nutritionMapFunction = (dataItem: SmsData): JSX.Element => {
        return (
            <tr key={dataItem.event_id}>
                <td className="default-width">
                    <Link to={`${getModuleLink(this.props.module)}/child_patient_detail/${dataItem.anc_id}`}>
                        {dataItem.anc_id}
                    </Link>
                </td>
                <td className="default-width">{getNumberOfDaysSinceDate(dataItem.EventDate)}</td>
                <td className="default-width">{dataItem.health_worker_location_name}</td>
                <td className="default-width">{dataItem.weight}</td>
                <td className="default-width">{dataItem.health_worker_location_name}</td>
                <td className="default-width">
                    <RiskColoring {...{ risk: dataItem.logface_risk }} />
                </td>
            </tr>
        );
    };
}

export default withTranslation()(VillageData);
