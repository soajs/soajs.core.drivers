/* jshint esversion: 6 */
"use strict";
const fs = require('fs');
const util = require('util'); //NOTE: util is a native package in node, no need to include it in package.json
const path = require('path');
const errorFile = require('./errors.js');
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
    },
	
	"runCorrespondingDriver" : function(method, options, defaultDriver, cb){
		let driverName = (options.infra && options.infra.stack && options.infra.stack.technology) ? options.infra.stack.technology : defaultDriver;
		if(!driverName){
			driverName = (options.params && options.params.technology) ? options.params.technology : driverName;
		}
		
		if(options.infra && options.infra.name === 'local' && driverName === 'dockerlocal'){
			driverName = 'docker';
		}
		
		try{
			let filePath = path.join(__dirname + "/../../infra", options.infra.name, driverName, "index.js");
			fs.exists(filePath, (exists) => {
				if (!exists) {
					return cb(new Error("Requested Driver does not exist!"));
				}
				
				let driver = require(filePath);
				if(!driver[method]){
					return cb({
						"source": "driver",
						"error": "error",
						"code": 519,
						"msg": errorFile[519]
					});
				}
				driver[method](options, cb);
			});
		}
		catch(e){
			options.soajs.log.error(e);
			return cb({
				"source": "driver",
				"error": "error",
				"code": 505,
				"msg": e.message
			});
		}
	}
};

module.exports = utils;
