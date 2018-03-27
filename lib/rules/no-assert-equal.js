'use strict';

const astUtil = require('../util/ast');
const assertEqualFunctions = [ 'equal' ];
const globalEqualFunctions = [ 'equal' ];

const ERROR_TEMPLATE_QUALIFIED = 'Unexpected {{id}}.equal. Use {{id}}.strictEqual or {{id}}.deepEqual.';
const ERROR_TEMPLATE_GLOBAL = 'Unexpected equal. Use strictEqual or deepEqual.';

function isCallToAssertEqualFunction(callee) {
    return callee.type === 'MemberExpression' &&
        callee.property.type === 'Identifier' &&
        assertEqualFunctions.indexOf(callee.property.name) !== -1;
}

function isCallToGlobalEqualFunction(callee) {
    return callee.type === 'Identifier' &&
        globalEqualFunctions.indexOf(callee.name) !== -1;
}

function isCallToEqualFunction(callee) {
    return isCallToGlobalEqualFunction(callee) || isCallToAssertEqualFunction(callee);
}

module.exports = function (context) {
    const testStack = [];

    function reportError(node) {
        const message = isCallToGlobalEqualFunction(node.callee) ? ERROR_TEMPLATE_GLOBAL : ERROR_TEMPLATE_QUALIFIED;
        context.report(node, message, {
            id: node.callee.object && astUtil.getNodeName(node.callee.object)
        });
    }

    return {
        CallExpression(node) {
            const callee = node.callee;
            if (astUtil.isTestCase(node)) {
                testStack.push(node);
            } else if (testStack.length && isCallToEqualFunction(callee)) {
                reportError(node);
            }
        },
        'CallExpression:exit'(node) {
            if (astUtil.isTestCase(node)) {
                testStack.pop();
            }
        }
    };
};
