'use strict';

const R = require('ramda');
const isDefined = R.complement(R.isNil);
const isCallExpression = R.both(isDefined, R.propEq('type', 'CallExpression'));
const describeAliases = [ 'describe', 'xdescribe', 'describe.only', 'describe.skip',
    'context', 'xcontext', 'context.only', 'context.skip',
    'suite', 'xsuite', 'suite.only', 'suite.skip' ];
const hooks = [ 'before', 'after', 'beforeEach', 'afterEach' ];
const testCaseNames = [ 'it', 'it.only', 'it.skip', 'xit',
    'test', 'test.only', 'test.skip',
    'specify', 'specify.only', 'specify.skip', 'xspecify' ];

function getPropertyName(property) {
    return property.name || property.value;
}

function getNodeName(node) {
    if (node.type === 'MemberExpression') {
        return `${getNodeName(node.object)}.${getPropertyName(node.property)}`;
    }
    return node.name;
}

function getObjectName(node) {
    if (node.type === 'MemberExpression') {
        return getNodeName(node.object);
    }

    return null;
}

function isDescribe(node, additionalSuiteNames) {
    return isCallExpression(node) &&
        describeAliases.concat(additionalSuiteNames).indexOf(getNodeName(node.callee)) > -1;
}

function isHookIdentifier(node) {
    return node && node.type === 'Identifier' && hooks.indexOf(node.name) !== -1;
}

function isHookCall(node) {
    return isCallExpression(node) && isHookIdentifier(node.callee);
}

function isTestCase(node) {
    return isCallExpression(node) && testCaseNames.indexOf(getNodeName(node.callee)) > -1;
}

function isStringLiteral(node) {
    return node && node.type === 'Literal' && typeof node.value === 'string';
}

module.exports = {
    isDescribe,
    isHookIdentifier,
    isTestCase,
    getPropertyName,
    getNodeName,
    getObjectName,
    isHookCall,
    isStringLiteral
};
