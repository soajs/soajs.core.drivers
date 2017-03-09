/* jshint esversion: 6 */
"use strict";
const util = require('util'); //NOTE: util is a native package in node, no need to include it in package.json
const errorFile = require('../utils/errors.js');

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
    'cloneObj': function (obj) {
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }

        if (obj instanceof RegExp) {
            return new RegExp(obj);
        }

        if (obj instanceof Array && Object.keys(obj).every(function (k) {
                return !isNaN(k);
            })) {
            return obj.slice(0);
        }
        var _obj = {};
        for (var attr in obj) {
            if (Object.hasOwnProperty.call(obj, attr)) {
                _obj[attr] = utils.cloneObj(obj[attr]);
            }
        }
        return _obj;
    },

    'validProperty': function (object, propertyName) {
        return !(
            !Object.hasOwnProperty.call(object, propertyName) || object[propertyName] === undefined || object[propertyName] === null ||
            ( typeof object[propertyName] === "string" && object[propertyName].length === 0 ) ||
            ( typeof object[propertyName] === "object" && Object.keys(object[propertyName]).length === 0 )
        );
    }
};

module.exports = utils;
