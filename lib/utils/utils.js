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
			let value = error.value  || error.message || error.msg;
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
	 * Method that removes special characters from a labels object
	 * @param {Object} labels
	 * @param {RexExp} regex
	 * @param {String} replacement
	 *
	 * @returns {Object}
	 */
	normalizeLabels: function(labels, regex, replacement) {
		if(!regex && !replacement) {
			regex = /\//g;
			replacement = '__slash__';
		}

		let output = {};
		if(labels && Object.keys(labels).length > 0) {
			for (let oneLabel in labels) {
				if(oneLabel && labels.hasOwnProperty(oneLabel) && labels[oneLabel] !== undefined && labels[oneLabel] !== null) {
					output[oneLabel] = labels[oneLabel].toString().replace(regex, replacement);
				}
				else {
					output[oneLabel] = '';
				}
			}
		}

		return output;
	},

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
		if (options.technology === 'container' && options.infra && options.infra.stack && options.infra.stack.technology) {
			driverName =  options.infra.stack.technology;
		}

		if (!driverName) {
			driverName = (options.technology) ? options.technology : null;
		}

		if (!driverName) {
			driverName = (options.params && options.params.technology) ? options.params.technology : defaultDriver;
		}

		if (options.infra && options.infra.name === 'local' && options.params && options.params.technology) {
			driverName = options.params.technology;
		}

		try {
			let filePath = path.join(__dirname + "/../../infra", options.infra.name, driverName, "index.js");
			fs.exists(filePath, (exists) => {
				if (!exists) {
					return cb({
						"source": "driver",
						"error": "error",
						"code": 519,
						"msg": errorFile[519]
					});
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
		//if no catalog recipe exposed ports and no service exposed ports, return empty callback
		if (options && options.params &&
			(
				// check if catalog recipe has no exposed ports
				(
					!options.params.catalog || !options.params.catalog.recipe || !options.params.catalog.recipe.deployOptions || !options.params.catalog.recipe.deployOptions.ports
					|| !Array.isArray(options.params.catalog.recipe.deployOptions.ports) || options.params.catalog.recipe.deployOptions.ports.length === 0
				)
				&&
				// check if dashboard did not find any custom ports for this service
				(
					!options.params.inputmaskData || !options.params.inputmaskData.custom || !options.params.inputmaskData.custom.ports
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
		if (options.params.catalog.recipe.deployOptions.voluming && !options.params.catalog.recipe.deployOptions.voluming.volumes) {
			let voluming = {volumes: []};

			if(driver === 'kubernetes'){
				voluming.volumeMounts = [];
			}

			if(Array.isArray(options.params.catalog.recipe.deployOptions.voluming)){
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
			}

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
		let type = "public", secret;
		if (options.params.catalog.recipe.deployOptions.image.tag && options.params.catalog.recipe.deployOptions.image.tag !== '') {
			tag = options.params.catalog.recipe.deployOptions.image.tag;
		}
		myUrl += tag;
		
		//check if image type is private
		if (options.params.catalog.recipe.deployOptions.image.repositoryType && options.params.catalog.recipe.deployOptions.image.tag !== '') {
			type = options.params.catalog.recipe.deployOptions.image.repositoryType;
			if (type === "private" &&  options.params.inputmaskData.custom.image &&  options.params.inputmaskData.custom.image.registrySecret){
				secret = options.params.inputmaskData.custom.image.registrySecret;
			}
		}
		let opts = {
			technology: options.technology,
			type: type,
			secret: secret
		};
		
		/**
		 * if docker or image is public skip
		 * if kubernetes and image is private
		 * ==>
		 *  1. get secret
		 *  2. extract data
		 *  3. decode base64 data
		 *  4. parse data and extract username and password
		 * @param opts
		 * @param callback
		 * @returns {*}
		 */
		function getCredentials(opts, callback){
			if (opts.type === 'public' || (opts.type === "private" && opts.technology !== "kubernetes")){
				return callback(null, true);
			}
			let secretsModule = require('../container/kubernetes/secrets.js');
			let kubeUtils = require('../container/kubernetes/utils.js');
			let namespace;
			if (options.params.data.namespace) {
				namespace = options.params.data.namespace;
			} else {
				namespace = kubeUtils.buildNameSpace(options);
			}
			let secretOptions = {
				soajs: options.soajs,
				params : {
					namespace: namespace,
					name: secret
				},
				deployerConfig: options.deployerConfig,
				strategy: options.strategy,
				driver: options.driver,
				env: options.env,
				infra: options.infra,
				technology: options.technology
			};
			secretsModule.getSecret(secretOptions, (error, response)=>{
				if (response && response.data && response.data[".dockercfg"]) {
					let buff = new Buffer(response.data[".dockercfg"], 'base64');
					let json = buff.toString('utf-8');
					try {
						json = JSON.parse(json);
						if (Object.keys(json).length > 0){
							opts.username = json[Object.keys(json)[0]].username;
							opts.password = json[Object.keys(json)[0]].password;
							return callback(null, true);
						}
						else {
							return callback(null, true);
						}
					}
					catch (e) {
						return callback(null, true);
					}
					
				}
				else {
					return callback(null, null);
				}
			});
		}
		
		/**
		 * if docker or image is public skip
		 * if kubernetes and image is private
		 * ==>
		 *  login to docker hub using credentials to extract token
		 * @param opts
		 * @param callback
		 * @returns {*}
		 */
		function login(opts, callback){
			if (opts.type === 'public' || (opts.type === "private" && opts.technology !== "kubernetes")){
				return callback(null, true);
			}
			let options = {
				method: 'POST',
				url: 'https://hub.docker.com/v2/users/login/',
				json: true,
				headers:
					{
						'cache-control': 'no-cache',
					},
				'form': {
					'username': opts.username,
					'password': opts.password
				}
			};
			request(options, function (error, response, body) {
				if (body && body.token){
					opts.token = body.token;
				}
				return callback(null, null);
			});
		}
		
		/**
		 *  call docker hub to get the image
		 *  JWT use token if provided
		 * @param opts
		 * @param cb
		 * @returns {*}
		 */
		function geImage(opts, cb){
			let reqOptions = {
				method: 'GET',
				url: myUrl,
				headers: {
					'cache-control': 'no-cache'
				},
				json: true,
			};
			if (opts.token){
				reqOptions.headers.Authorization = `JWT ${opts.token}`;
			}
			request(reqOptions, function (error, response, body) {
				if(error){
					return cb(error);
				}
				options.params.imageInfo = body;
				return cb(null, true);
			});
		}
		
		getCredentials (opts, (error)=>{
			if (error){
				return cb(error);
			}
			login(opts, (error)=>{
				if (error){
					return cb(error);
				}
				geImage(opts, cb);
			});
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
				//version: '1',
				env: options.env.toLowerCase(),
				serviceName: 'controller'
			};

			getServiceHost(controllerOptions, (error, controllerDomainName) =>{
				if (error && error.source === 'driver' && error.code === 661) {
					error.value = errorFile[999];
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
					options.params.data.variables['$SOAJS_CONTROLLER_PORT_MAINTENANCE'] = options.soajs.registry.services.config.ports.controller + options.soajs.registry.services.config.ports.maintenanceInc;
					options.params.data.variables['$SOAJS_REGISTRY_API'] = controllerDomainName + ":" + options.soajs.registry.services.config.ports.maintenanceInc;
					return cb();
				}
			});
		}
		else {
			return cb();
		}
	},

	"validateInputs": function (options, section, method, cb) {
		let myValidator = new options.soajs.validator.Validator();
		let schema, extra;

		//create a copy of the inputs
		let inputs = utils.cloneObj(options.params);

		try {
			schema = require('../../infra/' + options.infra.name + '/schemas/' + section + '.js');
		} catch (e) {
			options.soajs.log.warn(`No or invalid schema found to validate input ${section}, validation SKIPPED!`);
			return cb(null, true);
		}

		if(!schema || !method || !schema[method]) {
			options.soajs.log.warn(`No or invalid method found to validate input ${section} - ${method}, validation SKIPPED!`);
			return cb(null, true);
		}

		let status = myValidator.validate(inputs, schema[method]);

		if (!status.valid) {
			let errors = [];
			status.errors.forEach(function (err) {
				errors.push(err.stack);
			});
			return cb({
				code: 173,
				msg: errors.join(" - ")
			});
		}
		else return cb(null, true);
	}
};

module.exports = utils;
