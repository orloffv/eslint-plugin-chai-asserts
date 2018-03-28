'use strict';

const astUtil = require('../util/ast');
const assertEqualFunctions = [ 'equal' ];
const globalEqualFunctions = [ 'equal' ];

const ERROR_TEMPLATE_QUALIFIED = 'Unexpected {{id}}.equal. Use {{id}}.strictEqual or {{id}}.deepEqual.';
const ERROR_TEMPLATE_GLOBAL = 'Unexpected equal. Use strictEqual or deepEqual.';

function isCallToAssertEqualFunction(callee) {
    return callee.type === 'MemberExpression' &&
        callee.property.type === 'Identifier' &&
        assertEqualFunctions.indexOf(astUtil.getPropertyName(callee.property)) !== -1;
}

function isCallToGlobalEqualFunction(callee) {
    return callee.type === 'Identifier' &&
        globalEqualFunctions.indexOf(astUtil.getNodeName(callee)) !== -1;
}

function isCallToEqualFunction(callee) {
    return isCallToGlobalEqualFunction(callee) || isCallToAssertEqualFunction(callee);
}

function createGlobalAutofixFunction(callee) {
    return function (fixer) {
        return fixer.replaceText(callee, 'strictEqual');
    };
}

function createAssertAutofixFunction(callee) {
    return function (fixer) {
        return fixer.replaceText(callee.property, 'strictEqual');
    };
}

module.exports = function (context) {
    const testStack = [];

    function reportError(node) {
        const callee = node.callee;
        const message = isCallToGlobalEqualFunction(callee) ? ERROR_TEMPLATE_GLOBAL : ERROR_TEMPLATE_QUALIFIED;
        const fix = isCallToGlobalEqualFunction(callee) ?
            createGlobalAutofixFunction(callee) :
            createAssertAutofixFunction(callee);

        context.report({
            node: callee,
            message,
            fix,
            data: {
                id: astUtil.getObjectName(callee)
            }
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
