/* jshint esversion: 6 */
"use strict";
const util = require('util'); //NOTE: util is a native package in node, no need to include it in package.json
const errorFile = require('../utils/errors.js');
const coreLibs = require('soajs.core.libs');

var utils = {
    "checkError": function (error, code, cb, scb) {
        if(error) {
            util.log(error);

            return cb({
	            source: 'driver',
	            value: error,
	            code: code,
	            msg: errorFile[code]
            });
        }
        else {
            return scb();
        }
    },
    'cloneObj': coreLibs.utils.cloneObj,

    'validProperty': function (object, propertyName) {
        return !(
            !Object.hasOwnProperty.call(object, propertyName) || object[propertyName] === undefined || object[propertyName] === null ||
            ( typeof object[propertyName] === "string" && object[propertyName].length === 0 ) ||
            ( typeof object[propertyName] === "object" && Object.keys(object[propertyName]).length === 0 )
        );
    }
};

module.exports = utils;
