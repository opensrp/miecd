import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardTitle, Col, Row, Table } from 'reactstrap';
import './index.css';

export interface LabelValuePair {
    label: string;
    value: string | number;
}

interface Props {
    labelValuePairs: LabelValuePair[];
}

export default function BasicInformation({ labelValuePairs = [] }: Props) {
    const { t } = useTranslation();
    return (
        <Row id="detailsRow">
            <Card id="detailsCard">
                <CardTitle>{t('Basic Information')}</CardTitle>
                <Row>
                    <Col className="detailsColumn" sm="12" lg="6">
                        <Table borderless>
                            <tbody>
                                {labelValuePairs.map((labelValuePair: LabelValuePair, index: number) => {
                                    if (index % 2) {
                                        return (
                                            <tr key={index}>
                                                <td>{labelValuePair.label}</td>
                                                <td>{labelValuePair.value}</td>
                                            </tr>
                                        );
                                    }
                                    return null;
                                })}
                            </tbody>
                        </Table>
                    </Col>
                    <Col className="detailsColumn" sm="12" lg="6">
                        <Table borderless>
                            <tbody>
                                {labelValuePairs.map((labelValuePair: LabelValuePair, index: number) => {
                                    if (!(index % 2)) {
                                        return (
                                            <tr key={index}>
                                                <td>{labelValuePair.label}</td>
                                                <td>{labelValuePair.value}</td>
                                            </tr>
                                        );
                                    }
                                    return null;
                                })}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Card>
        </Row>
    );
}
