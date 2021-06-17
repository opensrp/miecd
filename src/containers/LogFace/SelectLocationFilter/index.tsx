/** select dropdown that allows user to filter by location,
 * some constraints applied:
 * - user can only filter for locations that they have been allowed access to,
 * we determine this by using the locationHierarchy of the user returned from security authenticate
 */
import { TreeNode } from 'helpers/locationHierarchy/types';
import { serializeTree } from 'helpers/locationHierarchy/utils';
import React, { useEffect, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { components } from 'react-select';

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

    const initialSelectOptions = getOptions(userLocationTree, userLocationId);
    const [options, setOptions] = useState(initialSelectOptions);
    const [hierarchy, setHierarchy] = useState<TreeNode[]>([]);
    const [selectedNode, setSelectedNode] = useState<TreeNode | undefined>();
    const [closeMenuOnSelect, setMenuToClose] = useState<boolean>(false);

    useEffect(() => {
        // update options on prop changes
        const updateOptions = getOptions(userLocationTree, userLocationId);
        setOptions(updateOptions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLocationId, serializeTree([userLocationTree])]);

    useEffect(() => {
        // don't close dropdown after user makes selection if selected node has children
        if (selectedNode) {
            const hasChildren: boolean | undefined = selectedNode.hasChildren();
            setMenuToClose(!hasChildren);
        } else {
            setMenuToClose(false);
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
                const nextOptions = (
                    selectedNode?.hasChildren() ? selectedNode?.children : selectedNode?.parent?.children ?? []
                ).map((node: TreeNode) => ({
                    value: node.model.id,
                    label: node.model.label,
                }));
                setOptions(nextOptions);
            } else {
                const updateOptions = getOptions(userLocationTree, userLocationId);
                setOptions(updateOptions);
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

/** generates options from user location hierarchy
 * @param userLocationTree - the user hierarchy tree
 * @param userLocationId - the locationId where this user is assigned
 */
const getOptions = (userLocationTree: TreeNode | undefined, userLocationId: string) => {
    // find the treeNode this user is assigned to
    const userLocationNode = userLocationTree?.first((node) => node.model.id === userLocationId);

    const immediateDescendants: TreeNode[] = userLocationNode?.hasChildren() ? userLocationNode.children : [] ?? [];
    const options = immediateDescendants.map((node) => ({
        value: node.model.id,
        label: node.model.label,
    }));
    return options;
};
