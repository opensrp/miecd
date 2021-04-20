/** select dropdown that allows user to filter by location,
 * some constraints applied:
 * - user can only filter for locations that they have jurisdiction in,
 * we determine this by using the locationHierarchy of the user returned from security authenticate
 */
import React, { useState } from 'react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { components } from 'react-select';
import { TreeNode } from 'store/ducks/locationHierarchy/types';

interface SelectLocationFilterProps {
    userLocationTree?: TreeNode;
    userLocationId: string;
    disabled: boolean;
    onLocationChange: (value: string) => void;
}

const defaultProps = {
    disabled: false,
    onLocationChange: () => void 0,
    userLocationId: '',
};

const SelectLocationFilter = (props: SelectLocationFilterProps) => {
    const { t } = useTranslation();
    const { userLocationTree, userLocationId, disabled, onLocationChange } = props;

    // find the treeNode this user is assigned to
    const userLocationNode = userLocationTree?.first((node) => node.model.id === userLocationId);

    const immediateDescendants: TreeNode[] = userLocationNode?.hasChildren() ? userLocationNode.children : [] ?? [];
    const initialSelectOptions = immediateDescendants.map((node) => ({
        value: node.model.id,
        label: node.model.label,
    }));
    const [options, setOptions] = useState(initialSelectOptions);
    const [hierarchy, setHierarchy] = useState<TreeNode[]>([]);
    const [parentNode, setParentNode] = useState<TreeNode | undefined>();
    const [closeMenuOnSelect, setMenuToClose] = useState<boolean>(false);

    const changeHandler = (value: string) => {
        // update parentNode and hierarchy
        if (value) {
            const thisNode = userLocationTree?.first((node) => node.model.id === value);
            // selected value, need to update the currentNode
            setParentNode(thisNode);
            setOptions(
                (thisNode?.hasChildren() ? thisNode?.children : thisNode?.parent?.children ?? []).map(
                    (node: TreeNode) => ({
                        value: node.model.id,
                        label: node.model.label,
                    }),
                ),
            );
            if (thisNode?.hasChildren()) {
                setMenuToClose(false);
            } else {
                setMenuToClose(true);
            }
            const path: TreeNode[] = thisNode?.getPath() as TreeNode[];
            path.pop();
            setHierarchy(path);
        } else {
            setHierarchy([]);
            setParentNode(undefined);
        }

        onLocationChange(value);
    };

    const customOnInputFilter = (input: string) => {
        if (input) {
            const matchedLocations = userLocationTree?.all((node) =>
                node.model.label.toLowerCase().includes(input.toLowerCase()),
            );
            // create options from the matched locations
            const matchedOptions =
                matchedLocations?.map((node) => {
                    return {
                        value: node.model.id,
                        label: node
                            .getPath()
                            .map((node) => node.model.label)
                            .join(' > '),
                    };
                }) ?? [];

            setOptions(matchedOptions);
        } else {
            if (parentNode) {
                setOptions(
                    (parentNode?.hasChildren() ? parentNode?.children : parentNode?.parent?.children ?? []).map(
                        (node: TreeNode) => ({
                            value: node.model.id,
                            label: node.model.label,
                        }),
                    ),
                );
            } else {
                setOptions(initialSelectOptions);
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Menu = (props: any) => {
        return (
            <Fragment>
                <components.Menu {...props}>
                    <div>
                        {hierarchy.length ? (
                            <div className="hierarchy-actions">
                                <small>
                                    {hierarchy && hierarchy.map((node: TreeNode) => node.model.label).join(' > ')}
                                </small>
                            </div>
                        ) : null}
                        <div>{props.children}</div>
                    </div>
                </components.Menu>
            </Fragment>
        );
    };

    return (
        <Select
            placeholder={t('Select location')}
            options={options}
            components={{ Menu }}
            onChange={(val) => changeHandler(val?.value ?? '')}
            disabled={disabled}
            classNamePrefix={'logface-filters'}
            isSearchable={true}
            isClearable={true}
            onInputChange={customOnInputFilter}
            closeMenuOnSelect={closeMenuOnSelect}
        />
    );
};

SelectLocationFilter.defaultProps = defaultProps;

export { SelectLocationFilter };
