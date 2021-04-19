import { replace, split, trim } from 'lodash';
import React from 'react';

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
