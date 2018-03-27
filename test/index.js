'use strict';

const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const rulesDir = path.join(__dirname, '../lib/rules/');
const plugin = require('..');

describe('eslint-plugin-chai-assert', function () {
    let ruleFiles;

    before(function (done) {
        fs.readdir(rulesDir, function (error, files) {
            ruleFiles = files;
            done(error);
        });
    });

    it('should expose all rules', function () {
        ruleFiles.forEach(function (file) {
            const ruleName = path.basename(file, '.js');

            expect(plugin).to.have.nested.property(`rules.${ruleName}`)
                .that.equals(require(rulesDir + ruleName));
        });
    });
});
