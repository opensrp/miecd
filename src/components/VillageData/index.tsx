import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardTitle, Row, Table } from 'reactstrap';
import { NBC_AND_PNC_CHILD, NBC_AND_PNC_WOMAN, NUTRITION, PREGNANCY } from '../../constants';
import { getModuleLink, getNumberOfDaysSinceDate } from '../../helpers/utils';
import { CompartmentSmsTypes, PregnancySmsData, NutritionSmsData, NbcPncSmsData } from '../../store/ducks/sms_events';
import { PaginationData, Paginator, PaginatorProps } from '../Paginator';
import RiskColoring from '../RiskColoring';
import './index.css';

export interface Props {
    current_level: number;
    smsData: CompartmentSmsTypes[];
    module: typeof PREGNANCY | typeof NBC_AND_PNC_CHILD | typeof NBC_AND_PNC_WOMAN | typeof NUTRITION;
    communeName: string;
}

interface State {
    currentPage: number;
}

const defaultProps: Props = {
    current_level: 0,
    module: PREGNANCY,
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
                                                  (this.state.currentPage - 1) * routePaginatorProps.pageLimit,
                                                  (this.state.currentPage - 1) * routePaginatorProps.pageLimit +
                                                      routePaginatorProps.pageLimit,
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
                <Row id="navrow" className="villageDataRow">
                    <Paginator {...routePaginatorProps} />
                </Row>
            </>
        );
    }

    /**
     * Returns a <tr></tr> for an CompartmentSmsTypes object passed to it
     * which is used to build the table above.
     * for the PREGNANCY module
     * @param {CompartmentSmsTypes} dataItem - an CompartmentSmsTypes object used to generate a table row
     * @return {JSX.Element} table row
     */
    public pregnancyMapFunction = (dataItem: CompartmentSmsTypes): JSX.Element => {
        return (
            <tr key={(dataItem as PregnancySmsData).event_id}>
                <td className="default-width">
                    <Link
                        to={`${getModuleLink(this.props.module)}/patient_detail/${
                            (dataItem as PregnancySmsData).anc_id
                        }`}
                    >
                        {(dataItem as PregnancySmsData).anc_id}
                    </Link>
                </td>
                <td className="default-width">{(dataItem as PregnancySmsData).age}</td>
                <td className="default-width">{(dataItem as PregnancySmsData).location_name}</td>
                <td className="default-width">{(dataItem as PregnancySmsData).mother_symptoms}</td>
                <td className="default-width">{(dataItem as PregnancySmsData).previous_risks}</td>
                <td className="default-width">{(dataItem as PregnancySmsData).lmp_edd}</td>
                <td className="default-width">{(dataItem as PregnancySmsData).planned_delivery_location}</td>
                <td className="default-width">
                    <RiskColoring {...{ risk: (dataItem as PregnancySmsData).risk_level }} />
                </td>
            </tr>
        );
    };

    /**
     * Returns a <tr></tr> for an CompartmentSmsTypes object passed to it
     * which is used to build the table above.
     * for the NUTRITION module
     * @param {CompartmentSmsTypes} dataItem - an CompartmentSmsTypes object used to generate a table row
     * @return {JSX.Element} table row
     */
    public nutritionMapFunction = (dataItem: CompartmentSmsTypes): JSX.Element => {
        return (
            <tr key={(dataItem as NutritionSmsData).event_id}>
                <td className="default-width">
                    <Link
                        to={`${getModuleLink(this.props.module)}/child_patient_detail/${
                            (dataItem as NutritionSmsData).anc_id
                        }`}
                    >
                        {(dataItem as NutritionSmsData).anc_id}
                    </Link>
                </td>
                <td className="default-width">{(dataItem as NutritionSmsData).age}</td>
                <td className="default-width">{(dataItem as NutritionSmsData).location_name}</td>
                <td className="default-width">
                    <RiskColoring {...{ risk: (dataItem as NutritionSmsData).nutrition_status }} />
                </td>
            </tr>
        );
    };

    /**
     * Returns a <tr></tr> for an CompartmentSmsTypes object passed to it
     * which is used to build the table above.
     * for the NBC & PNC_CHILD module
     * @param {CompartmentSmsTypes} dataItem - an CompartmentSmsTypes object used to generate a table row
     * @return {JSX.Element} table row
     */
    public nbcAndPncChildMapFunction = (dataItem: CompartmentSmsTypes): JSX.Element => {
        return (
            <tr key={(dataItem as NbcPncSmsData).event_id}>
                <td className="default-width">
                    <Link
                        to={`${getModuleLink(this.props.module)}/child_patient_detail/${
                            (dataItem as NbcPncSmsData).anc_id
                        }`}
                    >
                        {(dataItem as NbcPncSmsData).anc_id}
                    </Link>
                </td>
                <td className="default-width">{getNumberOfDaysSinceDate((dataItem as NbcPncSmsData).dob)}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).location_name}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).child_symptoms}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).delivery_location}</td>
                <td className="default-width">
                    <RiskColoring {...{ risk: (dataItem as NbcPncSmsData).risk_level }} />
                </td>
            </tr>
        );
    };

    /**
     * Returns a <tr></tr> for an CompartmentSmsTypes object passed to it
     * which is used to build the table above.
     * for the NBC & PNC_MOTHER module
     * @param {CompartmentSmsTypes} dataItem - an CompartmentSmsTypes object used to generate a table row
     * @return {JSX.Element} table row
     */
    public nbcAndPncMotherMapFunction = (dataItem: CompartmentSmsTypes): JSX.Element => {
        return (
            <tr key={(dataItem as NbcPncSmsData).event_id}>
                <td className="default-width">
                    <Link
                        to={`${getModuleLink(this.props.module)}/patient_detail/${(dataItem as NbcPncSmsData).anc_id}`}
                    >
                        {(dataItem as NbcPncSmsData).anc_id}
                    </Link>
                </td>
                <td className="default-width">{(dataItem as NbcPncSmsData).age}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).location_name}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).mother_symptoms}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).previous_risks}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).delivery_location}</td>
                <td className="default-width">
                    <RiskColoring {...{ risk: (dataItem as NbcPncSmsData).risk_level }} />
                </td>
            </tr>
        );
    };
}

export default withTranslation()(VillageData);
