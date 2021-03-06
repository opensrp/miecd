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
    NORMAL,
} from '../../constants';
import { getLinkToHierarchicalDataTable, Dictionary } from '../../helpers/utils';
import reducer, { reducerName, addFilterArgs } from '../../store/ducks/sms_events';
import { CompartmentsSmsFilterFunction } from '../../types';
import './index.css';
import { useTranslation } from 'react-i18next';
import reducerRegistry from '@onaio/redux-reducer-registry';

reducerRegistry.register(reducerName, reducer);

/**
 * interface for props to be passed to DataCircleCard component.
 */
interface Props extends RouteComponentProps {
    redAlert?: number;
    risk?: number;
    noRisk?: number;
    stunting?: number;
    wasting?: number;
    overweight?: number;
    inappropriateFeeding?: number;
    normal?: number;
    title: string;
    addFilterArgsActionCreator?: typeof addFilterArgs;
    filterArgs?: CompartmentsSmsFilterFunction[];
    module: typeof PREGNANCY | typeof NBC_AND_PNC_CHILD | typeof NBC_AND_PNC_WOMAN | typeof NUTRITION;
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
    normal,
    title,
    addFilterArgsActionCreator = addFilterArgs,
    filterArgs,
    module,
    userLocationId,
    permissionLevel,
}: Props) {
    const { t } = useTranslation();
    const pregnancyAndPncCircleSpec: CircleSpecProps[] = [
        {
            class: 'red',
            riskLabel: t('Red alert'),
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
            riskLabel: t('No risk'),
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
        {
            class: 'normal',
            riskLabel: t('Normal'),
            riskType: NORMAL,
            riskValue: normal,
        },
    ];

    return (
        <Card className="dataCircleCard">
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
                    <h5 className="card_title">{title}</h5>
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
