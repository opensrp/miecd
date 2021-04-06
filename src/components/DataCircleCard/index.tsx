import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Card, CardBody, CardTitle } from 'reactstrap';
import './index.css';
import {
    RED,
    PREGNANCY,
    NBC_AND_PNC_CHILD,
    NBC_AND_PNC_WOMAN,
    NUTRITION,
    ALL,
    INAPPROPRIATELY_FED,
    NO,
    OVERWEIGHT,
    RISK,
    SEVERE_WASTING,
    STUNTED,
} from '../../constants';
import { getLinkToHierarchicalDataTable, Dictionary } from '../../helpers/utils';
import { addFilterArgs } from '../../store/ducks/sms_events';
import { SmsFilterFunction } from '../../types';
import './index.css';
import { useTranslation } from 'react-i18next';

/**
 * interface for props to be passed to DataCircleCard component.
 */
interface Props extends RouteComponentProps {
    redAlert?: number;
    risk?: number;
    noRisk?: number;
    totalChildren?: number;
    stunting?: number;
    wasting?: number;
    overweight?: number;
    inappropriateFeeding?: number;
    title: string;
    addFilterArgsActionCreator?: typeof addFilterArgs;
    filterArgs?: SmsFilterFunction[];
    module: PREGNANCY | NBC_AND_PNC_CHILD | NBC_AND_PNC_WOMAN | NUTRITION | '';
    className?: string;
    userLocationId: string;
    permissionLevel: number;
}

/**
 * functional component that takes in props
 */
interface CircleSpecProps {
    class: string;
    riskLabel: string;
    riskType: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    riskValue: any;
}

function DataCircleCard({
    redAlert,
    risk,
    noRisk,
    stunting,
    wasting,
    overweight,
    inappropriateFeeding,
    title,
    addFilterArgsActionCreator = addFilterArgs,
    filterArgs,
    module,
    className = '',
    userLocationId,
    permissionLevel,
}: Props) {
    const { t } = useTranslation();
    const pregnancyAndPncCircleSpec: CircleSpecProps[] = [
        {
            class: 'red',
            riskLabel: t('Red Alert'),
            riskType: RED,
            riskValue: redAlert,
        },
        {
            class: 'yellow',
            riskLabel: t('risk'),
            riskType: RISK,
            riskValue: risk,
        },
        {
            class: 'green',
            riskLabel: t('No Risk'),
            riskType: NO,
            riskValue: noRisk,
        },
    ];

    const nutritionCircleSpec: CircleSpecProps[] = [
        {
            class: 'stunting',
            riskLabel: t('Stunting'),
            riskType: STUNTED,
            riskValue: stunting,
        },
        {
            class: 'wasting',
            riskLabel: t('Wasting'),
            riskType: SEVERE_WASTING,
            riskValue: wasting,
        },
        {
            class: 'overweight',
            riskLabel: t('Overweight'),
            riskType: OVERWEIGHT,
            riskValue: overweight,
        },
        {
            class: 'inappropriate-feeding',
            riskLabel: t('Inappropriate Feeding'),
            riskType: INAPPROPRIATELY_FED,
            riskValue: inappropriateFeeding,
        },
    ];

    return (
        <Card className={`dataCircleCard ${className}`}>
            <CardTitle>
                <Link
                    to={getLinkToHierarchicalDataTable(ALL, module, title, permissionLevel, userLocationId)}
                    // tslint:disable-next-line: jsx-no-lambda
                    onClick={() => {
                        if (filterArgs) {
                            addFilterArgsActionCreator(filterArgs);
                        }
                    }}
                >
                    {title}
                </Link>
            </CardTitle>
            <CardBody className="circlesRow">
                {(module !== NUTRITION ? pregnancyAndPncCircleSpec : nutritionCircleSpec).map(
                    (spec: Dictionary, i: number) => (
                        <Link
                            className={`${spec.class} circle`}
                            key={i}
                            // tslint:disable-next-line: jsx-no-lambda
                            onClick={() => {
                                if (filterArgs) {
                                    addFilterArgsActionCreator(filterArgs);
                                }
                            }}
                            to={getLinkToHierarchicalDataTable(
                                spec.riskType,
                                module,
                                title,
                                permissionLevel,
                                userLocationId,
                            )}
                        >
                            <span className="number">{spec.riskValue}</span>
                            <span className="risk-level">{spec.riskLabel}</span>
                        </Link>
                    ),
                )}
            </CardBody>
        </Card>
    );
}

const mapDispatchToProps = { addFilterArgsActionCreator: addFilterArgs };

const ConnectedDataCircleCard = connect(null, mapDispatchToProps)(withRouter(DataCircleCard));

export default ConnectedDataCircleCard;
