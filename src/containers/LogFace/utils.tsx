import { replace, split, trim, trimStart } from 'lodash';
import React from 'react';
import queryString from 'querystring';
import { RouteComponentProps } from 'react-router';

/** convert the smsData message field from prose to more easily readable
 * point format
 *
 * @param message - the message prose.
 */
export const parseMessage = (message: string) => {
    const propValues = split(message, '\n');
    const replacedEquals = propValues.map(trim).map((entry) => replace(entry, / =\s*/, ' : '));
    return (
        <ul>
            {replacedEquals.map((value, index) => {
                return <li key={`${value}-${index}`}>{value}</li>;
            })}
        </ul>
    );
};

/** Get query params from URL
 *
 * @param {Location} location from props
 */
export const getQueryParams = (location: RouteComponentProps['location']) => {
    return queryString.parse(trimStart(location.search, '?'));
};

/** A callback helper to add filter text to url
 *
 * @param queryParam - the string to be used as the key when constructing searchParams
 * @param props - the component props; should include RouteComponentProps
 */
export const updateUrlWithFilter = <T extends RouteComponentProps>(queryParam: string, props: T, newValue?: string) => {
    const allQueryParams = getQueryParams(props.location);
    if (newValue) {
        allQueryParams[queryParam] = newValue;
    } else {
        delete allQueryParams[queryParam];
    }

    props.history.push(`${props.match.url}?${queryString.stringify(allQueryParams)}`);
};
