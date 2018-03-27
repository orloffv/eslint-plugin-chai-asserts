'use strict';

const RuleTester = require('eslint').RuleTester;
const rules = require('../../').rules;
const ruleTester = new RuleTester();

const ERROR_TEMPLATE_QUALIFIED = 'Unexpected {{id}}.equal. Use {{id}}.strictEqual or {{id}}.deepEqual.';
const ERROR_TEMPLATE_GLOBAL = 'Unexpected equal. Use strictEqual or deepEqual.';

function getErrorMessage(identifier) {
    return ERROR_TEMPLATE_QUALIFIED.replace(/\{\{id\}\}/g, identifier);
}

ruleTester.run('no-assert-equal', rules['no-assert-equal'], {

    valid: [
        'it(function() {assert.strictEqual(a, b);})',
        'it(function() {assert.deepEqual(a, b);})',
        'it(function() {foo.strictEqual(a, b);})',
        'it(function() {foo.deepEqual(a, b);})',
        'it(function() {strictEqual(a, b);})',
        'it(function() {deepEqual(a, b);})'
    ],
    invalid: [
        {
            code: 'it(function() {equal(a, b);})',
            errors: [ { message: ERROR_TEMPLATE_GLOBAL, column: 16, line: 1 } ]
        },
        {
            code: 'it(function() {assert.equal(a, b);})',
            errors: [ { message: getErrorMessage('assert'), column: 16, line: 1 } ]
        }
    ]
});
