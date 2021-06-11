import { ParsedHierarchyNode, RawHierarchyNode, RawHierarchyNodeMap, RawOpenSRPHierarchy, TreeNode } from './types';
import { cloneDeep } from 'lodash';
import cycle from 'cycle';
import TreeModel from 'tree-model';

/** Parse the raw child hierarchy node map
 *
 * @param {RawHierarchyNodeMap} rawNodeMap - Object of raw hierarchy nodes
 * @param {string} parent - node parent id
 * @returns {Array<ParsedHierarchyNode>} Array of Parsed hierarchy nodes
 */
const parseChildren = (rawNodeMap: RawHierarchyNodeMap, parent: string) => {
    // skip key when destructuring
    const rawHierarchyNode: RawHierarchyNode[] = Object.entries(rawNodeMap).map(([, value]) => value);
    return rawHierarchyNode.map((child) => {
        const parsedNode: ParsedHierarchyNode = {
            ...child,
            title: child.label,
            key: `${child.id}-${parent}`,
            children: child.children ? parseChildren(child.children, parent) : [],
        };
        return parsedNode;
    });
};

/** parses the raw opensrp hierarchy to a hierarchy that we can quickly build
 * our tree model from.
 *
 * @param {RawOpenSRPHierarchy} raw - the response we get from opensrp
 * @returns {ParsedHierarchyNode} - returns Parent node with its children
 */
const parseHierarchy = (raw: RawOpenSRPHierarchy) => {
    // clone the locationTree, we are going to be mutating a copy
    const rawClone: RawOpenSRPHierarchy = cloneDeep(raw);

    // !IMPORTANT ASSUMPTION : locationsTreeClone has a single object under map, i.e there is only one root jurisdiction
    const { map } = rawClone.locationsHierarchy;
    // !IMPORTANT ASSUMPTION : locationsTreeClone has a single object under map, i.e there is only one root jurisdiction
    // skip key when destructuring
    const rawNode: RawHierarchyNode = Object.entries(map).map(([, value]) => value)[0];
    const parsedNode: ParsedHierarchyNode = {
        ...rawNode,
        title: rawNode.label,
        key: rawNode.id,
        children: rawNode.children ? parseChildren(rawNode.children, rawNode.id) : [],
    };

    return parsedNode;
};

/** takes the raw opensrp hierarchy response and creates a tree model structure
 *
 * @param {RawOpenSRPHierarchy} apiResponse - the response we get from opensrp
 * @returns {TreeNode} - returns root node
 */
export const generateJurisdictionTree = (apiResponse: RawOpenSRPHierarchy): TreeNode => {
    const tree = new TreeModel();
    const hierarchy = parseHierarchy(apiResponse);
    const root = tree.parse<ParsedHierarchyNode>(hierarchy);
    return root;
};

/**
 * serialize tree due to circular dependencies
 *
 * @param trees - trees to be serialized
 */
export const serializeTree = (trees: (TreeNode | undefined)[]) => {
    return JSON.stringify(trees.map((tree) => JSON.stringify(cycle.decycle(tree))));
};
