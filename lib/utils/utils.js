/* jshint esversion: 6 */
"use strict";
const fs = require('fs');
const path = require('path');
const async = require('async');
const request = require("request");

const config = require('../../config');
const errorFile = require('./errors.js');
const coreLibs = require('soajs.core.libs');

const utils = {
	/**
	 * Method that checks and formulates an error and return it in cb else triggers scb if no error
	 * @param {Object} error
	 * @param {Integer} code
	 * @param {Function} cb
	 * @param {Function} scb
	 * @returns {*}
	 */
	"checkError": function (error, code, cb, scb) {
		if (error) {
			let value = (error && error.message) ? error.message : error.msg;
			if(!value) {
				value = error;
			}
			return cb({
				source: 'driver',
				value: value,
				code: code,
				msg: errorFile[code]
			});
		}
		else {
			return scb();
		}
	},
	
	/**
	 * Method that maps to the clone object method provided by the SOAJS framework
	 */
	'cloneObj': coreLibs.utils.cloneObj,
	
	/**
	 * Method that validates that the property requested is part of the object supplied
	 * @param {Object} object
	 * @param {String} propertyName
	 * @returns {Boolean}
	 */
	'validProperty': function (object, propertyName) {
		return !(
			!Object.hasOwnProperty.call(object, propertyName) || object[propertyName] === undefined || object[propertyName] === null ||
			(typeof object[propertyName] === "string" && object[propertyName].length === 0) ||
			(typeof object[propertyName] === "object" && Object.keys(object[propertyName]).length === 0)
		);
	},
	
	/**
	 * Method that validates that the requested driver exists, the method requested is also available in this driver
	 * It executes the method if all is found or returns an error
	 * @param {String} method
	 * @param {Object} options
	 * @param {String} defaultDriver
	 * @param {Function} cb
	 * @returns {*}
	 */
	"runCorrespondingDriver": function (method, options, defaultDriver, cb) {
		let driverName;
		if (options.infra && options.infra.stack && options.infra.stack.technology) {
			driverName =  options.infra.stack.technology;
		}
		if (!driverName) {
			driverName = (options.params && options.params.technology) ? options.params.technology : defaultDriver;
		}
		
		if (options.infra && options.infra.name === 'local' && driverName === 'dockerlocal') {
			driverName = 'docker';
		}
		
		try {
			let filePath = path.join(__dirname + "/../../infra", options.infra.name, driverName, "index.js");
			fs.exists(filePath, (exists) => {
				if (!exists) {
					return cb(new Error("Requested Driver does not exist!"));
				}
				
				let driver = require(filePath);
				if (!driver[method]) {
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
		catch (e) {
			options.soajs.log.error(e);
			return cb({
				"source": "driver",
				"error": "error",
				"code": 505,
				"msg": e.message
			});
		}
	},
	
	/**
	 * Method that validates the schema of exposed ports and that they are in range
	 * If all is ok, it overrides their value with the calculated result under options.params.data.ports
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	"checkPorts": function (options, cb) {
		
		if(!options || !options.params){
			return cb();
		}
		
		if (options && options.params &&
			(
				(
					!options.params.catalog && !options.params.catalog.recipe && !options.params.catalog.recipe.deployOptions && !options.params.catalog.recipe.deployOptions.ports
					&& !Array.isArray(options.params.catalog.recipe.deployOptions.ports) && options.params.catalog.recipe.deployOptions.ports.length === 0
				)
				||
				(
					!options.params.inputmaskData && !options.params.inputmaskData.custom && !options.params.inputmaskData.custom.ports
				)
			)
		) {
			return cb();
		}
		
		let type;
		//ports can be from catalog or inputmaskData.custom
		
		let ports = [];
		if(options.params.catalog && options.params.catalog.deployOptions && options.params.catalog.recipe.deployOptions.ports){
			ports = options.params.catalog.recipe.deployOptions.ports;
		}
		else if(options.params.inputmaskData && options.params.inputmaskData.custom && options.params.inputmaskData.custom.ports){
			ports = options.params.inputmaskData.custom.ports;
		}
		
		async.each(ports, (onePort, callback) => {
			/**
			 validate port schema
			 isPublished value should be provided
			 multiple port object schema is invalid
			 isPublished false ==> no published ports
			 isPublished true && published ==> nodeport
			 isPublished false && published ==> loadbalancer
			 */
			let temp;
			if (onePort.isPublished || onePort.published) {
				temp = onePort.published ? "nodeport" : "loadbalancer";
				if (!type) {
					type = temp;
				}
				else if (type !== temp) {
					return callback({invalidPorts: true});
				}
			}
			//todo: check arriving ports from inputs
			if (options.params.inputmaskData && options.params.inputmaskData.custom && options.params.inputmaskData.custom.ports
				&& Array.isArray(options.params.inputmaskData.custom.ports) && options.params.inputmaskData.custom.ports.length > 0) {
				options.params.inputmaskData.custom.ports.forEach((oneInputPort) => {
					if (onePort.isPublished && oneInputPort.name === onePort.name && oneInputPort.published) {
						onePort.published = oneInputPort.published;
					}
				});
			}
			
			//if isPublished is set to false and published port is set delete published port before sending to the drivers
			if (!onePort.isPublished && onePort.published) {
				delete  onePort.published;
			}
			if (!onePort.published) {
				return callback();
			}
			
			if (onePort.published && onePort.published > 30000) {
				onePort.published -= 30000;
			}
			
			if (onePort.published && onePort.published < config.exposedPorts.min || onePort.published > config.exposedPorts.max) {
				return callback({wrongPort: onePort});
			}
			return callback();
			
		}, (error) => {
			if (error) {
				if (error.wrongPort) {
					return cb({"code": 722, "message": errorFile[722]});
				}
				if (error.invalidPorts) {
					return cb({"code": 723, "message": errorFile[723]});
				}
			}
			else {
				//if not kubernetes don't do anything
				async.map(ports, function (onePort, callback) {
					// Increment all exposed port by 30000 to be in the port range of kubernetes exposed ports
					// NOTE: It's better to leave it for the user to set the proper ports
					if (onePort.published) {
						onePort.published += 30000;
					}
					
					return callback(null, onePort)
				}, function (error, updatedPorts) {
					//No error to be handled
					if(!options.params.data){
						options.params.data = {};
					}
					options.params.data.ports = updatedPorts;
					return cb(null, true);
				});
			}
		});
	},
	
	/**
	 * Method that validates the schema of volumes to be attached to containers
	 * If all is ok, it overrides their value with the calculated result under options.params.catalog.recipe.deployOptions.voluming
	 * @param {Object} options
	 * @param {String} driver
	 * @param {Object} volumeSchema
	 * @param {Function} cb
	 * @returns {*}
	 */
	"checkVolumes": function (options, driver, volumeSchema, cb) {
		if (!options || !options.params || !options.params.catalog || !options.params.catalog.recipe ||
			!options.params.catalog.recipe.deployOptions || !options.params.catalog.recipe.deployOptions.voluming
			|| options.params.catalog.recipe.deployOptions.voluming.length === 0) {
			return cb();
		}
		
		//reconstruct volumes based on technology
		if (!options.params.catalog.recipe.deployOptions.voluming.volumes) {
			let voluming = {volumes: []};
			options.params.catalog.recipe.deployOptions.voluming.forEach((oneCommonVolume) => {
				if (oneCommonVolume[driver] && oneCommonVolume[driver].volume) {
					voluming.volumes.push(oneCommonVolume[driver].volume);
					if (oneCommonVolume[driver].volumeMount) {
						if (!voluming.volumeMounts) {
							voluming.volumeMounts = [];
						}
						
						voluming.volumeMounts.push(oneCommonVolume[driver].volumeMount);
					}
				}
			});
			
			options.params.catalog.recipe.deployOptions.voluming = voluming;
		}
		
		// get schema and compare it with volume provided
		let myValidator = new options.soajs.validator.Validator();
		let check = myValidator.validate(options.params.catalog.recipe.deployOptions.voluming, volumeSchema);
		
		if (check.errors && check.errors.length > 0) {
			return cb({"code": 724, "message": errorFile[724]});
		}
		else {
			return cb();
		}
	},
	
	/**
	 * Method that invokes the docker hub api and returns the information of the docker image requested
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	"getLatestSOAJSImageInfo": function (options, cb) {
		
		let myUrl = config.docker.url;
		let prefix = "library";
		if (options.params.catalog.recipe.deployOptions.image.prefix && options.params.catalog.recipe.deployOptions.image.prefix !== '') {
			prefix = options.params.catalog.recipe.deployOptions.image.prefix;
		}
		
		myUrl = myUrl.replace("%organization%", prefix).replace("%imagename%", options.params.catalog.recipe.deployOptions.image.name);
		let tag = "latest";
		if (options.params.catalog.recipe.deployOptions.image.tag && options.params.catalog.recipe.deployOptions.image.tag !== '') {
			tag = options.params.catalog.recipe.deployOptions.image.tag;
		}
		myUrl += tag;
		let opts = {
			method: 'GET',
			url: myUrl,
			headers: {'cache-control': 'no-cache'},
			json: true
		};
		request.get(opts, function (error, response, body) {
			if(error){
				return cb(error);
			}
			options.params.imageInfo = body;
			return cb(null, true);
		});
	},
	
	/**
	 * Method that executes get SOAJS API Gateway information and extract its network information
	 * If found it stores this information under options.params.data.variables
	 * @param {Object} options
	 * @param {Function} getServiceHost
	 * @param {Function} cb
	 * @returns {*}
	 */
	"checkControllers": function(options, getServiceHost, cb) {
		let getControllers = false;
		if (options.params.catalog.recipe.buildOptions && options.params.catalog.recipe.buildOptions.env) {
			for (let env in options.params.catalog.recipe.buildOptions.env) {
				if (options.params.catalog.recipe.buildOptions.env[env].value === '$SOAJS_NX_CONTROLLER_NB') {
					getControllers = true;
				}
			}
		}
		
		if (getControllers) {
			let originalParams = utils.cloneObj(options.params);
			let recipeId = (options.params.catalog) ? options.params.catalog._id: null;
			
			let controllerOptions = options;
			controllerOptions.params = {
				env: options.env.toLowerCase(),
				serviceName: 'controller',
				version: '1'
			};
			
			getServiceHost(controllerOptions, (error, controllerDomainName) =>{
				if (error && error.source === 'driver' && error.code === 661) {
					error.msg = errorFile[999];
					return cb(error);
				}
				else{
					options.params = originalParams;
					if(recipeId){
						options.params.catalog._id = recipeId;
					}
					options.params.data.variables['$SOAJS_NX_CONTROLLER_IP_1'] = controllerDomainName;
					options.params.data.variables['$SOAJS_NX_CONTROLLER_NB'] = '1';
					options.params.data.variables['$SOAJS_NX_CONTROLLER_PORT'] = options.soajs.registry.services.config.ports.controller;
					return cb();
				}
			});
		}
		else {
			return cb();
		}
	}
};

module.exports = utils;
