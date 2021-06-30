import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import ReactPaginate from 'react-paginate';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardTitle, Row, Table } from 'reactstrap';
import { CompartmentSmsTypes, PregnancySmsData, NutritionSmsData, NbcPncSmsData } from '../../store/ducks/sms_events';
import {
    DEFAULT_PAGINATION_SIZE,
    NBC_AND_PNC_CHILD,
    NBC_AND_PNC_MODULE,
    NBC_AND_PNC_WOMAN,
    NUTRITION,
    NUTRITION_MODULE,
    PREGNANCY,
    PREGNANCY_MODULE,
} from '../../constants';
import { getCommonPaginationProps, getModuleLink, getNumberOfDaysSinceDate } from '../../helpers/utils';
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
            currentPage: 0,
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
                        <CardTitle className="commune-name">{this.props.communeName}</CardTitle>
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
                                                  this.state.currentPage * pageLimit,
                                                  this.state.currentPage * pageLimit + pageLimit,
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
                            (dataItem as PregnancySmsData).patient_id
                        }`}
                    >
                        {(dataItem as PregnancySmsData).patient_id}
                    </Link>
                </td>
                <td className="default-width">{(dataItem as PregnancySmsData).age}</td>
                <td className="default-width">{(dataItem as PregnancySmsData).location_name}</td>
                <td className="default-width">{(dataItem as PregnancySmsData).mother_symptoms}</td>
                <td className="default-width">{(dataItem as PregnancySmsData).previous_risks}</td>
                <td className="default-width">{(dataItem as PregnancySmsData).lmp_edd}</td>
                <td className="default-width">{(dataItem as PregnancySmsData).planned_delivery_location}</td>
                <td className="default-width">
                    <RiskColoring dataObject={dataItem} module={PREGNANCY_MODULE} />
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
                            (dataItem as NutritionSmsData).patient_id
                        }`}
                    >
                        {(dataItem as NutritionSmsData).patient_id}
                    </Link>
                </td>
                <td className="default-width">{(dataItem as NutritionSmsData).age}</td>
                <td className="default-width">{(dataItem as NutritionSmsData).location_name}</td>
                <td className="default-width">
                    <RiskColoring dataObject={dataItem} module={NUTRITION_MODULE} />
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
                            (dataItem as NbcPncSmsData).patient_id
                        }`}
                    >
                        {(dataItem as NbcPncSmsData).patient_id}
                    </Link>
                </td>
                <td className="default-width">{getNumberOfDaysSinceDate((dataItem as NbcPncSmsData).dob)}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).location_name}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).child_symptoms}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).delivery_location}</td>
                <td className="default-width">
                    <RiskColoring dataObject={dataItem} module={NBC_AND_PNC_MODULE} />
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
                        to={`${getModuleLink(this.props.module)}/patient_detail/${
                            (dataItem as NbcPncSmsData).patient_id
                        }`}
                    >
                        {(dataItem as NbcPncSmsData).patient_id}
                    </Link>
                </td>
                <td className="default-width">{(dataItem as NbcPncSmsData).age}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).location_name}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).mother_symptoms}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).previous_risks}</td>
                <td className="default-width">{(dataItem as NbcPncSmsData).delivery_location}</td>
                <td className="default-width">
                    <RiskColoring dataObject={dataItem} module={NBC_AND_PNC_MODULE} />
                </td>
            </tr>
        );
    };
}

export default withTranslation()(VillageData);
