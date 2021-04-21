import { trimStart } from 'lodash';
import queryString from 'querystring';
import { RouteComponentProps } from 'react-router';

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
