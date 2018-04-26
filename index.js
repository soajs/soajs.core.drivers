"use strict";

const fs = require('fs');
const path = require('path');
const errorFile = require('./lib/utils/errors.js');
const utils = require('./lib/utils/utils.js');
let cache = {};

function checkIfSupported(options, cb, fcb) {
    let isSupported = ((options.strategy[options.function] && typeof (options.strategy[options.function]) === 'function') ? true : false);

    if (isSupported) return fcb();
    else return cb({
        "source": "driver",
        "error": "error",
        "code": 519,
        "msg": errorFile[519]
    });
}

function getStrategy(options, cb) {
	let strategyName = options.type.toLowerCase();
	
	if(!strategyName){
		return cb(new Error(`No driver type specified!`));
	}
	
	if(options.driver){
		strategyName += "_" + options.driver.toLowerCase();
	}
	
	if(options.technology){
		strategyName += "_" + options.technology.toLowerCase();
	}
	
    checkCache((strategy) => {
        if (strategy) return cb(null, strategy);
	
	    let onePath = [];
	    onePath.push(__dirname);
	    for(let i in options){ onePath.push(options[i]); }
	    onePath.push("index.js");
	
        let pathToUse = path.join.apply(null, onePath);

        checkStrategy(pathToUse, (error) => {
            if (error) return cb(error);

            try {
            	fs.exists(pathToUse, (exists) => {
            		if(!exists){
            			throw new Error(`Driver not found: ${pathToUse} !!!`);
		            }
		            else{
		                cache[strategyName] = require(pathToUse);
		            }
	            });
            }
            catch (e) {
                console.log("Error:", e);
                return cb(e);
            }

            return cb(null, cache[strategyName]);
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
				checkIfSupported({strategy: strategy, function: method }, cb, () => {
					strategy[method](methodOptions, cb);
				});
			});
		});
	}
};
