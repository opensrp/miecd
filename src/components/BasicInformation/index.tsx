import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardTitle } from 'reactstrap';
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
        <div id="detailsRow">
            <Card id="detailsCard">
                <CardTitle>{t('Basic Information')}</CardTitle>
                <div className="d-flex justify-content-between p-3 flex-wrap information__card_body">
                    {labelValuePairs.map((pair) => {
                        return (
                            <div
                                key={`${pair.label}-${pair.value}`}
                                className="flex-fill d-flex flex-wrap information__card_body_cell p-1"
                            >
                                <span className="prop"> {pair.label}:</span>
                                <span className="value">{pair.value}</span>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
