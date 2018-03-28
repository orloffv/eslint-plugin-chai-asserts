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
            code: 'it(function() {var a = 1; b = 1; equal(a, b);})',
            errors: [ { message: ERROR_TEMPLATE_GLOBAL, column: 34, line: 1 } ],
            output: 'it(function() {var a = 1; b = 1; strictEqual(a, b);})'
        },
        {
            code: 'it(function() {var a = 1; b = 1; assert.equal(a, b);})',
            errors: [ { message: getErrorMessage('assert'), column: 34, line: 1 } ],
            output: 'it(function() {var a = 1; b = 1; assert.strictEqual(a, b);})'
        },
        {
            code: 'it(function() {assert.equal(\'b\', \'b\');})',
            errors: [ { message: getErrorMessage('assert'), column: 16, line: 1 } ],
            output: 'it(function() {assert.strictEqual(\'b\', \'b\');})'
        }
    ]
});
