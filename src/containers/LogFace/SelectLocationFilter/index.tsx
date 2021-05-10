/** select dropdown that allows user to filter by location,
 * some constraints applied:
 * - user can only filter for locations that they have been allowed access to,
 * we determine this by using the locationHierarchy of the user returned from security authenticate
 */
import React, { useEffect, useState, Fragment } from 'react';
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
    const [selectedNode, setSelectedNode] = useState<TreeNode | undefined>();
    const [closeMenuOnSelect, setMenuToClose] = useState<boolean>(false);

    useEffect(() => {
        if (selectedNode) {
            // don't close dropdown after user makes selection if selected node has children
            const hasChildren: boolean = selectedNode.hasChildren();
            setMenuToClose(!hasChildren);
        }
    }, [selectedNode]);

    /** handles a location selection */
    const changeHandler = (value: string) => {
        if (value) {
            // update parentNode and hierarchy
            const thisNode = userLocationTree?.first((node) => node.model.id === value);
            setSelectedNode(thisNode);
            // set options to be children of currently selected node, where selected node is a leaf node, the siblings will be the options
            const nextOptions = (thisNode?.hasChildren() ? thisNode?.children : thisNode?.parent?.children ?? []).map(
                (node: TreeNode) => ({
                    value: node.model.id,
                    label: node.model.label,
                }),
            );
            setOptions(nextOptions);
            const path: TreeNode[] = thisNode?.getPath() as TreeNode[];
            path.pop();
            setHierarchy(path);
        } else {
            //reset node selection-related state variables
            setHierarchy([]);
            setSelectedNode(undefined);
        }

        onLocationChange(value);
    };

    /** Defines filter/search behavior as user types a location name  */
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
            if (selectedNode) {
                // set options to be children of currently selected node, where selected node is a leaf node, the siblings will be the options
                const nextOptions = (selectedNode?.hasChildren()
                    ? selectedNode?.children
                    : selectedNode?.parent?.children ?? []
                ).map((node: TreeNode) => ({
                    value: node.model.id,
                    label: node.model.label,
                }));
                setOptions(nextOptions);
            } else {
                setOptions(initialSelectOptions);
            }
        }
    };

    /** render a breadCrumb-ish text showing a hierarchy of the current selected node */
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
