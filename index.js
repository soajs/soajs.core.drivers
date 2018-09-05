"use strict";

const fs = require('fs');
const path = require('path');
const errorFile = require('./lib/utils/errors.js');
const utils = require('./lib/utils/utils.js');
let cache = {};

function checkIfSupported(options, cb) {
    let isSupported = ((options.strategy[options.function] && typeof (options.strategy[options.function]) === 'function') ? true : false);
    if (!isSupported) {
	    return cb({
		    "source": "driver",
		    "error": "error",
		    "code": 519,
		    "msg": errorFile[519]
	    });
    }

	return cb(null, true);
}

function getStrategy(options, cb) {
	let strategyName = options.type.toLowerCase();
	if(!strategyName){
		return cb(new Error(`No driver type specified!`));
	}

	let onePath = [];
	onePath.push(__dirname);
	onePath.push(options.type);

	//added fallback support
	if(!options.driver && options.name){
		options.driver = options.name;
	}

	if(options.driver){
		strategyName += "_" + options.driver.toLowerCase();
		onePath.push(options.driver);
	}

	onePath.push("index.js");

    checkCache((strategy) => {
        if (strategy) return cb(null, strategy);

        let pathToUse = '';

        try {
            pathToUse = path.join.apply(null, onePath);
        }
        catch (e) {
            return cb(new Error("Invalid Driver Path detected!"));
        }

        checkStrategy(pathToUse, (error) => {
            if (error) return cb(error);

            try {
            	fs.exists(pathToUse, (exists) => {
            		if(!exists){
            			throw new Error(`Driver not found: ${pathToUse} !!!`);
		            }
		            else{
		                cache[strategyName] = require(pathToUse);
			            return cb(null, cache[strategyName]);
		            }
	            });
            }
            catch (e) {
                console.log("Error:", e);
                return cb(e);
            }
        });
    });

    function checkCache(cb) {
        if (cache[strategyName]) {
            return cb(cache[strategyName]);
        }
        return cb(null);
    }

    function checkStrategy(path, cb) {
        fs.access(path, fs.constants.F_OK | fs.constants.R_OK, cb);
    }
}

/*
	let driverOptionsSamples = [
		{
			type: "infra",
			name: "aws",
			technology: "cluster"
		},
		{
			type: "infra",
			name: "aws",
			technology: "vm"
		},
		{
			type: "infra",
			name: "aws",
			technology: "container",
			driver: "docker"
		},
		{
			type: "ci",
			name: "travis"
		},
		{
			type: "git",
			name: "github"
		}
	];
*/

module.exports = {

	/**
	 * Generic method that loads the requested driver and execute the method requested in it
	 * @param driverOptions
	 * @param method
	 * @param methodOptions
	 * @param cb
	 *
	 * @Ex:
	 *
	 * {type: 'infra', driver: 'aws', technology: 'vm'}, 'listServices', { Object containing listServices Arguments }, () => {}
	 */
	"execute": function(driverOptions, method, methodOptions, cb){
		getStrategy(driverOptions, (error, strategy) => {
			utils.checkError(error, 518, cb, () => {
                if(!methodOptions.technology && driverOptions.technology) {
                    methodOptions.technology = driverOptions.technology;
                }
				checkIfSupported({strategy: strategy, function: method }, (error) => {
					if(error && error.code === 519){
						strategy.executeDriver(method, methodOptions, cb);
					}
					else if(strategy && strategy[method]){
						strategy[method](methodOptions, cb);
					}
					else{
						return cb({
							"source": "driver",
							"error": "error",
							"code": 500,
							"msg": errorFile[500]
						})
					}
				});
			});
		});
	},

    "validateInputs": function (options, section, method, cb) {
        utils.validateInputs(options, section, method, (error, response) => {
            utils.checkError(error, (error && error.code) ? error.code : 761, cb, () => {
                return cb(null, true);
            });
        });
    }
};
