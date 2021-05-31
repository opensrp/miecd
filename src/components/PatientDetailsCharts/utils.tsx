import NoRecord from 'components/NoRecord';
import Ripple from 'components/page/Loading';
import { TFunction, useTranslation } from 'react-i18next';
import supersetFetch from 'services/superset';
import { getMonthNames } from '../../constants';
import { sortByEventDate } from '../../helpers/utils';
import { ChildChartData, MotherChartData } from 'store/ducks/chartData';
import superset, { SupersetFormData } from '@onaio/superset-connector';
import { ActionCreator } from 'redux';
import { GET_FORM_DATA_ROW_LIMIT } from 'configs/env';
import React from 'react';

/** factory for form data filters for chart pages */
export const chartFormDataFilters = (patientId: string) =>
    superset.getFormData(GET_FORM_DATA_ROW_LIMIT, [
        {
            comparator: patientId,
            operator: '==',
            subject: 'patient_id',
        },
    ]);

/** abstracts code that actually makes the superset Call since it is quite similar
 * @param supersetSlice - slice string
 * @param actionCreator - redux action creator
 * @param supersetService - the supersetService
 * @param supersetOptions - adhoc filters for superset call
 */
export async function chartSupersetCall<TAction, TResponse>(
    supersetSlice: string,
    actionCreator: ActionCreator<TAction>,
    supersetService: typeof supersetFetch = supersetFetch,
    supersetOptions: SupersetFormData | null = null,
) {
    const asyncOperation = supersetOptions
        ? supersetService(supersetSlice, supersetOptions)
        : supersetService(supersetSlice);
    return asyncOperation
        .then((result: TResponse[] | undefined) => {
            if (result) {
                actionCreator(result);
            }
        })
        .catch((error) => {
            throw error;
        });
}

/** props for BrokenLoading chart */
export interface BrokenLoadingChartPageProps {
    error?: Error;
    loading: boolean;
    broken: boolean;
}

/** dry component for showing loader or broken page */
export const BrokenLoadingChartPage = ({ error, loading, broken }: BrokenLoadingChartPageProps) => {
    const { t } = useTranslation();
    if (loading) {
        return <Ripple></Ripple>;
    }

    if (broken) {
        return <NoRecord message={t(`Chart could not load, an error occurred. ${error?.message ?? ''}`)} />;
    }
    return null;
};

/** create a chart data series containing the weight and height data series from smsEvents */
export const getWeightHeightDataSeries = (smsEvents: ChildChartData[], t: TFunction) => {
    const categories: string[] = [];
    const dataSeries: { data: (number | undefined)[]; name: string }[] = [
        { data: [], name: 'weight' },
        { data: [], name: 'height' },
    ];
    // make sure events are sorted from oldest to latest
    const sortedSmsEvents = sortByEventDate(smsEvents).reverse();

    for (const data of sortedSmsEvents) {
        const calendarCategoryObj = {
            month: new Date(data.event_date).getMonth(),
            year: new Date(data.event_date).getFullYear(),
        };
        if (data.weight && data.height) {
            categories.push(`${getMonthNames(t)[calendarCategoryObj.month]}/${calendarCategoryObj.year}`);
            dataSeries[0].data.push(data.weight);
            dataSeries[1].data.push(data.height);
        }
    }
    return {
        categories,
        dataSeries,
    };
};

/** create a chart data series containing the weight data series from smsEvents */
export const getWeightDataSeries = (smsEvents: MotherChartData[], t: TFunction) => {
    const categories: string[] = [];
    const dataSeries: { data: (number | undefined)[]; name: string }[] = [{ data: [], name: 'weight' }];
    // make sure events are sorted from oldest to latest
    const sortedSmsEvents = sortByEventDate(smsEvents).reverse();

    for (const data of sortedSmsEvents) {
        const calendarCategoryObj = {
            month: new Date(data.event_date).getMonth(),
            year: new Date(data.event_date).getFullYear(),
        };
        if (data.weight) {
            categories.push(`${getMonthNames(t)[calendarCategoryObj.month]}/${calendarCategoryObj.year}`);
            dataSeries[0].data.push(data.weight);
        }
    }
    return {
        categories,
        dataSeries,
    };
};

/** create a data series containing the diastolic and systolic data series from smsEvents */
export const getBloodPSeriesForChart = (smsEvents: MotherChartData[], t: TFunction) => {
    const categories: string[] = [];
    const dataSeries: { data: (number | undefined)[]; name: string }[] = [
        { data: [], name: 'systolic' },
        { data: [], name: 'diastolic' },
    ];
    // make sure events are sorted from oldest to latest
    const sortedSmsEvents = sortByEventDate(smsEvents).reverse();

    const regex = /\d{2,3}\S{0,3}\d{2,3}/;
    const singleBpValueRegex = /\d{2,3}/g;

    for (const data of sortedSmsEvents) {
        const calendarCategoryObj = {
            month: new Date(data.event_date).getMonth(),
            year: new Date(data.event_date).getFullYear(),
        };
        const hasValidBp = regex.test(data.bp);
        if (!hasValidBp) {
            continue;
        }
        categories.push(`${getMonthNames(t)[calendarCategoryObj.month]}/${calendarCategoryObj.year}`);
        const matchedValues = [...Array.from(data.bp.matchAll(singleBpValueRegex))];

        dataSeries[0].data.push(Number(matchedValues[0]));
        dataSeries[1].data.push(Number(matchedValues[1]));
    }
    return {
        categories,
        dataSeries,
    };
};
