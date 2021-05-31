import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import ReactPaginate from 'react-paginate';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardTitle, Row, Table } from 'reactstrap';
import { DEFAULT_PAGINATION_SIZE, NBC_AND_PNC_CHILD, NBC_AND_PNC_WOMAN, NUTRITION, PREGNANCY } from '../../constants';
import { getCommonPaginationProps, getModuleLink, getNumberOfDaysSinceDate } from '../../helpers/utils';
import { SmsData } from '../../store/ducks/sms_events';
import RiskColoring from '../RiskColoring';
import './index.css';

export interface Props {
    current_level: number;
    smsData: SmsData[];
    module: string;
    communeName: string;
}

interface State {
    currentPage: number;
}

const defaultProps: Props = {
    current_level: 0,
    module: '',
    smsData: [],
    communeName: '',
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

        const pageLimit = DEFAULT_PAGINATION_SIZE;
        const totalPageCount = Math.ceil(this.props.smsData.length / pageLimit);

        const paginatorProps = {
            ...getCommonPaginationProps(t),
            pageCount: totalPageCount,
            onPageChange: (data: { selected: number }) => {
                this.setState({
                    currentPage: data.selected,
                });
            },
        };

        return (
            <>
                <Row className="village villageDataRow">
                    <Card className="table-card">
                        <CardTitle className="commune-name">{t(this.props.communeName)}</CardTitle>
                        <CardBody>
                            <Table striped borderless>
                                <thead id="header">
                                    {/* For pregnancy */}
                                    {this.props.module === PREGNANCY ? (
                                        <tr>
                                            <th className="default-width">{t('Patient ID')}</th>
                                            <th className="default-width">{t('Age')}</th>
                                            <th className="default-width">{t('Location Of Residence')}</th>
                                            <th className="default-width">{t('Current Symptoms')}</th>
                                            <th className="default-width">
                                                {t('Previous Risks / Existing Medical Conditions')}
                                            </th>
                                            <th className="default-width">{t('EDD')}</th>
                                            <th className="default-width">{t('Planned Delivery Location')}</th>
                                            <th className="default-width">{t('Risk Category')}</th>
                                        </tr>
                                    ) : null}

                                    {/* For nutrition */}
                                    {this.props.module === NUTRITION ? (
                                        <tr>
                                            <th className="default-width">{t('Patient ID')}</th>
                                            <th className="default-width">{t('Age')}</th>
                                            <th className="default-width">{t('Location Of Residence')}</th>
                                            <th className="default-width">{t('Risk Category')}</th>
                                        </tr>
                                    ) : null}

                                    {/* For NBC */}
                                    {this.props.module === NBC_AND_PNC_CHILD ? (
                                        <tr>
                                            <th className="default-width">{t('Patient ID')}</th>
                                            <th className="default-width">{t('Days Since Birth')}</th>
                                            <th className="default-width">{t('Location Of Residence')}</th>
                                            <th className="default-width">{t('Current Symptoms')}</th>
                                            <th className="default-width">{t('Location Of Birth')}</th>
                                            <th className="default-width">{t('Risk Category')}</th>
                                        </tr>
                                    ) : null}

                                    {/* For PNC */}
                                    {this.props.module === NBC_AND_PNC_WOMAN ? (
                                        <tr>
                                            <th className="default-width">{t('Patient ID')}</th>
                                            <th className="default-width">{t('Age')}</th>
                                            <th className="default-width">{t('Location Of Residence')}</th>
                                            <th className="default-width">{t('Current Symptoms')}</th>
                                            <th className="default-width">
                                                {t('Previous Risks / Existing Medical Conditions')}
                                            </th>
                                            <th className="default-width">{t('Location Of Birth')}</th>
                                            <th className="default-width">{t('Risk Category')}</th>
                                        </tr>
                                    ) : null}
                                </thead>
                                <tbody id="body">
                                    {this.props.smsData.length
                                        ? this.props.smsData
                                              .slice(
                                                  (this.state.currentPage - 1) * pageLimit,
                                                  (this.state.currentPage - 1) * pageLimit + pageLimit,
                                              )
                                              .map(
                                                  this.props.module === PREGNANCY
                                                      ? this.pregnancyMapFunction
                                                      : this.props.module === NUTRITION
                                                      ? this.nutritionMapFunction
                                                      : this.props.module === NBC_AND_PNC_CHILD
                                                      ? this.nbcAndPncChildMapFunction
                                                      : this.nbcAndPncMotherMapFunction,
                                              )
                                        : null}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </Row>
                <nav className="pagination-container" aria-label="Page navigation">
                    <ReactPaginate {...paginatorProps} />
                </nav>
            </>
        );
    }

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
                <td className="default-width">{dataItem.age}</td>
                <td className="default-width">{dataItem.location}</td>
                <td className="default-width">{dataItem.mother_symptoms}</td>
                <td className="default-width">{dataItem.previous_risks}</td>
                <td className="default-width">{dataItem.lmp_edd}</td>
                <td className="default-width">{dataItem.planned_delivery_location}</td>
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
                <td className="default-width">{dataItem.age}</td>
                <td className="default-width">{dataItem.location}</td>
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
                <td className="default-width">{getNumberOfDaysSinceDate(dataItem.date_of_birth)}</td>
                <td className="default-width">{dataItem.location}</td>
                <td className="default-width">{dataItem.child_symptoms}</td>
                <td className="default-width">{dataItem.delivery_location}</td>
                <td className="default-width">
                    <RiskColoring {...{ risk: dataItem.logface_risk }} />
                </td>
            </tr>
        );
    };

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
                <td className="default-width">{dataItem.age}</td>
                <td className="default-width">{dataItem.location}</td>
                <td className="default-width">{dataItem.mother_symptoms}</td>
                <td className="default-width">{dataItem.previous_risks}</td>
                <td className="default-width">{dataItem.delivery_location}</td>
                <td className="default-width">
                    <RiskColoring {...{ risk: dataItem.logface_risk }} />
                </td>
            </tr>
        );
    };
}

export default withTranslation()(VillageData);
