"use strict";

const async = require('async');
const config = require('../../config');

const engine = {

	/**
	 * Method that constructs the labels that should be associated to a service payload before it is deployed
	 * @param options
	 */
	"constructServiceLabels" : function(options) {
		//adjust the labels
		if (options.params.inputmaskData.custom && ['service', 'daemon'].indexOf(options.params.inputmaskData.custom.type) !== -1 && options.params.catalog.type === 'service' || options.params.catalog.type === 'daemon') {
			generateSOAJSLabels();
		}
		else if (options.params.catalog.type === 'server' && options.params.catalog.subtype === 'nginx') {
			generateNginxLabels();
		}
		else {
			generateOtherLabels();
		}

		if (options.params.data.variables['$SOAJS_SRV_MEMORY']) {
			options.params.data.labels['memoryLimit'] = options.params.data.variables['$SOAJS_SRV_MEMORY'].toString();
		}

		if (options.params.catalog.recipe.deployOptions.labels) {
			for (let labelKey in options.params.catalog.recipe.deployOptions.labels) {
				let newKey = labelKey.replace(/__dot__/g, '.');
				options.params.data.labels[newKey] = options.params.catalog.recipe.deployOptions.labels[labelKey];
			}
		}

		//add image tag where applicable
		let imageTs = new Date().getTime().toString();
		if(options.params && options.params.imageInfo){
			imageTs = new Date(options.params.imageInfo.last_updated).getTime().toString();
			options.soajs.log.debug("detected latest image update on:", imageTs);
		}
		else{
			options.soajs.log.debug("no latest image updates, using now as imageTs...");
		}
		
		if (options.params.inputmaskData.action === 'rebuild') {
			if (options.strategy === 'kubernetes' && options.params.catalog.recipe.deployOptions.image.pullPolicy !== 'Always') {
				options.params.data.labels['service.image.ts'] = options.params.inputmaskData.imageLastTs;
			}
			else {
				options.params.data.labels['service.image.ts'] = imageTs;
			}
		}
		else {
			options.params.data.labels['service.image.ts'] = imageTs;
		}

		function generateSOAJSLabels() {
			let serviceLabel = options.env.toLowerCase() + "-" + options.params.data.name;
			if (options.params.data.name !== 'controller') {
				serviceLabel += (options.params.inputmaskData.custom.version) ? "-v" + options.params.inputmaskData.custom.version : "";
			}

			options.params.data.labels = {
				"soajs.content": "true",
				"soajs.service.name": options.params.data.serviceName,
				"soajs.service.group": (options.params.data.serviceGroup) ? options.params.data.serviceGroup.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-') : '',
				"soajs.service.label": serviceLabel,
				"soajs.service.repo.name": "soajs-" + options.params.data.serviceName,
				"soajs.service.type": options.params.catalog.type,
				"soajs.service.subtype": options.params.catalog.subtype
			};

			options.params.data.variables['$SOAJS_SERVICE_NAME'] = options.params.data.serviceName;

			if (options.params.inputmaskData.custom && options.params.inputmaskData.custom.version) {
				options.params.data.labels["soajs.service.version"] = options.params.inputmaskData.custom.version.toString();
			}

			if (options.params.data.daemonGroupName) {
				options.params.data.labels["soajs.daemon.group"] = options.params.data.daemonGroupName;
			}

			/**
			 * in this case soajs.inputmaskData.gitSource has to be provided
			 **/
			if (options.params.inputmaskData.gitSource) {
				//variables already filled above
				options.params.data.labels['service.repo'] = options.params.data.variables['$SOAJS_GIT_REPO'];
				options.params.data.labels['service.branch'] = options.params.data.variables['$SOAJS_GIT_BRANCH'];
				options.params.data.labels['service.commit'] = options.params.data.variables['$SOAJS_GIT_COMMIT'];
				options.params.data.labels['service.owner'] = options.params.data.variables['$SOAJS_GIT_OWNER'];
			}
		}

		function generateNginxLabels() {
			let group = "soajs-nginx";
			options.params.data.name = options.env.toLowerCase() + "-nginx";
			if (options.params.inputmaskData.custom && options.params.inputmaskData.custom.name) {
				options.params.data.name = options.params.inputmaskData.custom.name;
				options.params.data.name = options.env.toLowerCase() + "-" + options.params.data.name;
				if (options.params.catalog.recipe.deployOptions.image.prefix !== 'soajsorg') {
					group = "custom-nginx";
				}
			}

			options.params.data.labels = {
				"soajs.content": "true",
				"soajs.service.name": "nginx",
				"soajs.service.group": group,
				"soajs.service.label": options.params.data.name,
				"soajs.service.type": options.params.catalog.type,
				"soajs.service.subtype": options.params.catalog.subtype
			};

			options.params.data.variables['$SOAJS_SERVICE_NAME'] = "nginx";

			if (options.params.inputmaskData.custom && options.params.inputmaskData.custom.resourceId) {
				options.params.data.labels["soajs.resource.id"] = options.params.inputmaskData.custom.resourceId;
			}
		}

		function generateOtherLabels() {
			let serviceLabel = '';
			if (options.params.inputmaskData.custom && options.params.inputmaskData.custom.name) {
				//NOTE: in case of deploying a resource, set the deployment name to the name specified by the user
				if (options.params.inputmaskData.custom.resourceId) {
					serviceLabel = options.params.inputmaskData.custom.name;
				}
				else {
					//in case of deploying a service from the repos section, add the env code to the deployment name
					serviceLabel = options.env.toLowerCase() + "-" + options.params.inputmaskData.custom.name;
					if(options.params.data.serviceName &&options.params.data.serviceName.indexOf("-v" + options.params.inputmaskData.custom.version) === -1) {
						options.params.data.serviceName += (options.params.inputmaskData.custom.version) ? "-v" + options.params.inputmaskData.custom.version : "";
					}
					if (options.params.inputmaskData.custom.version && serviceLabel.indexOf("-v" + options.params.inputmaskData.custom.version) === -1) {
						serviceLabel += '-v' + options.params.inputmaskData.custom.version;
					}
				}
			}
			options.params.data.name = serviceLabel;
			options.params.data.labels = {
				"soajs.service.name": options.params.data.serviceName || options.params.data.name,
				"soajs.service.type": options.params.catalog.type,
				"soajs.service.subtype": options.params.catalog.subtype,
				"soajs.service.group": "Other",
				"soajs.service.label": serviceLabel
			};

			options.params.data.variables['$SOAJS_SERVICE_NAME'] = options.params.data.serviceName || options.params.data.name;

			if (options.params.inputmaskData.custom && options.params.inputmaskData.custom.version) {
				options.params.data.labels['soajs.service.version'] = options.params.inputmaskData.custom.version.toString();
			}

			if (options.params.inputmaskData.custom && options.params.inputmaskData.custom.resourceId) {
				options.params.data.labels["soajs.resource.id"] = options.params.inputmaskData.custom.resourceId;
			}

			/**
			 * if case soajs.inputmaskData.gitSource is provided
			 **/
			if (options.params.inputmaskData.gitSource) {
				//variables already filled above
				options.params.data.labels['service.repo'] = options.params.data.variables['$SOAJS_GIT_REPO'];
				options.params.data.labels['service.branch'] = options.params.data.variables['$SOAJS_GIT_BRANCH'];
				options.params.data.labels['service.commit'] = options.params.data.variables['$SOAJS_GIT_COMMIT'];
				options.params.data.labels['service.owner'] = options.params.data.variables['$SOAJS_GIT_OWNER'];
			}
			else {
				//add repo and branch as labels
				if (options.params.catalog && options.params.catalog.recipe && options.params.catalog.recipe.buildOptions && options.params.catalog.recipe.buildOptions.env) {
					for (let oneEnvName in options.params.catalog.recipe.buildOptions.env) {
						let oneEnv = options.params.catalog.recipe.buildOptions.env[oneEnvName];

						if (oneEnv.type === 'static') {
							switch (oneEnvName) {
								case 'SOAJS_GIT_REPO':
									options.params.data.labels['service.repo'] = oneEnv.value;
									break;
								case 'SOAJS_GIT_BRANCH':
									options.params.data.labels['service.branch'] = oneEnv.value;
									break;
								case 'SOAJS_GIT_COMMIT':
									options.params.data.labels['service.commit'] = oneEnv.value;
									break;
								case 'SOAJS_GIT_OWNER':
									options.params.data.labels['service.owner'] = oneEnv.value;
									break;
							}
						}
					}
				}
			}
		}
	},

	/**
	 * Generates the common standard service schema for all container technologies
	 * @param {Object} options
	 * @returns {{env: string, id: (void|string), name: (void|string), image: string, imagePullPolicy: (*|string), labels: {"soajs.env.code": string, "soajs.service.mode": null, "soajs.catalog.id": (*|string)}, memoryLimit: null, cpuLimit: *, replication: {mode: null}, version: number, restartPolicy: {condition: string, maxAttempts: number}, network: string, ports: *}}
	 */
	"constructDeployerParams": function (options) {

		//the following have already been calculated, just map them
		//options.params.data.ports
		//options.params.catalog.recipe.deployOptions.voluming
		//options.params.data.secrets
		//options.params.data.labels['service.image.ts']
		//options.params.data.variables

		//settings replication is only applicable in deploy operations, not when rebuilding
		engine.verifyReplicationMode(options);

		//adjust memory limit value
		if (options.params.inputmaskData.deployConfig && options.params.inputmaskData.deployConfig.memoryLimit) {
			options.params.data.variables['$SOAJS_SRV_MEMORY'] = Math.floor(options.params.inputmaskData.deployConfig.memoryLimit / 1048576);
		}

		//populate the service labels from options
		engine.constructServiceLabels(options);

		let myImage = mapImage(); //[image, iPrefix, iName, iTag, iAuth]
		let image = myImage[0], iPrefix = myImage[1], iName = myImage[2], iTag = myImage[3], iAuth;
		if (myImage[4]){
			iAuth = myImage[4];
		}
		if (!options.params.data.serviceName){
			options.params.data.serviceName = options.params.data.name;
		}
		
		if(options.params.data.serviceName &&options.params.data.serviceName.indexOf("-v" + options.params.inputmaskData.custom.version) === -1) {
			options.params.data.serviceName += (options.params.inputmaskData.custom.version) ? "-v" + options.params.inputmaskData.custom.version : "";
		}
		
		if(!options.params.data.serviceName.includes(options.env.toLowerCase() + "-")){
			options.params.data.serviceName = options.env.toLowerCase() + "-" + options.params.data.serviceName;
		}

		let serviceParams = {
			"env": options.env.toLowerCase(),
			"id": options.params.data.serviceName.toLowerCase() || options.params.data.name.toLowerCase(),
			"name": options.params.data.serviceName.toLowerCase() || options.params.data.name.toLowerCase(),
			"image": image,
			"imagePullPolicy": options.params.catalog.recipe.deployOptions.image.pullPolicy || '',
			"labels": {
				"soajs.env.code": options.env.toLowerCase(),
				"soajs.service.mode": (options.params.inputmaskData.deployConfig) ? options.params.inputmaskData.deployConfig.replication.mode : null, //replicated || global for swarm, deployment || daemonset for kubernetes
				"soajs.catalog.id": options.params.catalog._id.toString()
			},
			"memoryLimit": ((options.params.inputmaskData.deployConfig) ? options.params.inputmaskData.deployConfig.memoryLimit : null),
			"cpuLimit": ((options.params.inputmaskData.deployConfig) ? options.params.inputmaskData.deployConfig.cpuLimit : null),
			"replication": {
				"mode": ((options.params.inputmaskData.deployConfig) ? options.params.inputmaskData.deployConfig.replication.mode : null)
			},
			"version": parseFloat(options.params.inputmaskData.custom.version) || 1,
			"restartPolicy": {
				"condition": "any",
				"maxAttempts": 5
			},
			"network": '',
			"ports": options.params.data.ports
		};
		if (iAuth){
			serviceParams.imageAuth = iAuth;
		}
		//fix the memory limit thing
		if(serviceParams.memoryLimit / 1048576 < 4){
			serviceParams.memoryLimit = serviceParams.memoryLimit * 1048576;
		}

		if (options.params.inputmaskData.autoScale) {
			serviceParams.autoScale = {
				id: options.params.inputmaskData.autoScale.id,
				type: options.params.inputmaskData.autoScale.type,
				min: options.params.inputmaskData.autoScale.replicas.min,
				max: options.params.inputmaskData.autoScale.replicas.max,
				metrics: options.params.inputmaskData.autoScale.metrics
			};
		}

		if (options.params.catalog.v) {
			serviceParams.labels["soajs.catalog.v"] = options.params.catalog.v.toString();
		}

		if (iPrefix) serviceParams.labels['service.image.prefix'] = iPrefix;
		if (iName) serviceParams.labels['service.image.name'] = iName;
		if (iTag) serviceParams.labels['service.image.tag'] = iTag;

		if (['replicated', 'deployment'].indexOf(serviceParams.labels['soajs.service.mode']) !== -1) {
			serviceParams.labels["soajs.service.replicas"] = (options.params.inputmaskData.deployConfig) ? options.params.inputmaskData.deployConfig.replication.replicas : null; //if replicated how many replicas
			if (serviceParams.labels["soajs.service.replicas"]) {
				serviceParams.labels["soajs.service.replicas"] = serviceParams.labels["soajs.service.replicas"].toString();
			}
		}

		for (let oneLabel in options.params.data.labels) {
			serviceParams.labels[oneLabel] = options.params.data.labels[oneLabel];
		}

		//if a custom namespace is set in the catalog recipe, use it
		if (options.params.catalog.recipe.deployOptions.namespace) {
			serviceParams.namespace = options.params.catalog.recipe.deployOptions.namespace;
		}

		//Add readiness probe configuration if present, only for kubernetes deployments
		if (options.params.catalog.recipe && options.params.catalog.recipe.deployOptions && options.params.catalog.recipe.deployOptions.readinessProbe && Object.keys(options.params.catalog.recipe.deployOptions.readinessProbe).length > 0) {
			serviceParams.readinessProbe = options.params.catalog.recipe.deployOptions.readinessProbe;
		}

		//Add replica count in case of docker replicated service or kubernetes deployment
		if (options.params.inputmaskData.deployConfig && options.params.inputmaskData.deployConfig.replication.replicas) {
			serviceParams.replication.replicas = options.params.inputmaskData.deployConfig.replication.replicas;
		}

		//Override the default docker network of the user wants to use a custom overlay network
		if (options.strategy === 'docker' && options.params.catalog.recipe.deployOptions.container && options.params.catalog.recipe.deployOptions.container.network) {
			serviceParams.network = options.params.catalog.recipe.deployOptions.container.network;
		}

		if(options.strategy === 'docker' && options.params.data.secrets && Array.isArray(options.params.data.secrets) && options.params.data.secrets.length > 0){
			serviceParams.secrets = options.params.data.secrets;
		}

		//Override the default container working directory if the user wants to set a custom path
		if (options.params.catalog.recipe.deployOptions.container && options.params.catalog.recipe.deployOptions.container.workingDir) {
			serviceParams.containerDir = options.params.catalog.recipe.deployOptions.container.workingDir;
		}

		//Override the default container restart policy if set
		if (options.params.catalog.recipe.deployOptions.restartPolicy) {
			serviceParams.restartPolicy.condition = options.params.catalog.recipe.deployOptions.restartPolicy.condition;
			if (options.params.catalog.recipe.deployOptions.restartPolicy.maxAttempts) {
				serviceParams.restartPolicy.maxAttempts = options.params.catalog.recipe.deployOptions.restartPolicy.maxAttempts;
			}
		}

		//Add the commands to execute when running the containers
		if (options.params.catalog.recipe.buildOptions && options.params.catalog.recipe.buildOptions.cmd && options.params.catalog.recipe.buildOptions.cmd.deploy && options.params.catalog.recipe.buildOptions.cmd.deploy.command) {
			serviceParams.command = options.params.catalog.recipe.buildOptions.cmd.deploy.command;
		}

		//Add the command arguments
		if (options.params.catalog.recipe.buildOptions && options.params.catalog.recipe.buildOptions.cmd && options.params.catalog.recipe.buildOptions.cmd.deploy && options.params.catalog.recipe.buildOptions.cmd.deploy.args) {
			serviceParams.args = options.params.catalog.recipe.buildOptions.cmd.deploy.args;
		}

		if (!serviceParams.args) {
			serviceParams.args = [];
		}

		let bashCCmd = false;
		if (serviceParams.args[0] && serviceParams.args[0].trim() === '-c') {
			bashCCmd = true;
			serviceParams.args.shift();
		}

		//If a service requires to run cmd commands before starting, get them from service record and add them
		if (serviceParams.command && options.params.data.serviceCmd) {
			serviceParams.args = options.params.data.serviceCmd.concat(serviceParams.args);
		}

		for (let i =0; i < serviceParams.args.length -1; i++){
			serviceParams.args[i] = serviceParams.args[i].trim();
		}

		serviceParams.args = serviceParams.args.join(" && ");
		if (serviceParams.args){
			serviceParams.args = [serviceParams.args];
			if(bashCCmd){
				serviceParams.args.unshift("-c");
			}
		}
		if (serviceParams.args.length === 0 ){
			delete serviceParams.args
		}

		//Add the user-defined volumes if any
		if (options.params.catalog.recipe.deployOptions && options.params.catalog.recipe.deployOptions.voluming) {
			serviceParams.voluming = options.params.catalog.recipe.deployOptions.voluming || {};
		}

		//build extra envs
		serviceParams.variables = engine.buildAvailableVariables(options);

		//map computed envs
		serviceParams.variables = engine.computeCatalogEnvVars(options, serviceParams.variables);

		return serviceParams;

		function mapImage(){
			let image = '', iPrefix, iName, iTag, iAuth;
			if (options.params.catalog.recipe.deployOptions.image.prefix) {
				image += options.params.catalog.recipe.deployOptions.image.prefix + '/';
				iPrefix = options.params.catalog.recipe.deployOptions.image.prefix;
			}

			image += options.params.catalog.recipe.deployOptions.image.name;
			iName = options.params.catalog.recipe.deployOptions.image.name;

			if (options.params.catalog.recipe.deployOptions.image.tag) {
				image += ':' + options.params.catalog.recipe.deployOptions.image.tag;
				iTag = options.params.catalog.recipe.deployOptions.image.tag;
			}

			if (options.params.inputmaskData.custom && options.params.inputmaskData.custom.image && options.params.inputmaskData.custom.image.name) {
				image = '';

				if (options.params.inputmaskData.custom.image.prefix) {
					image += options.params.inputmaskData.custom.image.prefix + '/';
					iPrefix = options.params.inputmaskData.custom.image.prefix;
				}

				image += options.params.inputmaskData.custom.image.name;
				iName = options.params.inputmaskData.custom.image.name;

				if (options.params.inputmaskData.custom.image.tag) {
					image += ':' + options.params.inputmaskData.custom.image.tag;
					iTag = options.params.inputmaskData.custom.image.tag;
				}
			}
			//check if image type is private
			// if found return registrySecret in case of kubernetes
			if(options.params.catalog.recipe.deployOptions.image.repositoryType === "private"){
				if (options.strategy === "kubernetes" && options.params.inputmaskData.custom && options.params.inputmaskData.custom.image && options.params.inputmaskData.custom.image.registrySecret){
					iAuth = options.params.inputmaskData.custom.image.registrySecret;
				}
			}
			return [image, iPrefix, iName, iTag, iAuth];
		}
	},

	/**
	 * modifies replication mode in the case of kubernetes
	 * @param options
	 * @returns {*}
	 */
	"verifyReplicationMode": function (options) {
		let isKubernetes = (options.strategy === "kubernetes");

		if (isKubernetes) {
			if (options.params.inputmaskData.deployConfig.replication.mode === 'replicated') {
				options.params.inputmaskData.deployConfig.replication.mode = "deployment";
			}
			else if (options.params.inputmaskData.deployConfig.replication.mode === 'global') {
				options.params.inputmaskData.deployConfig.replication.mode = "daemonset";
			}
		}
	},

	/**
	 * Function that maps the computed environment variables
	 * @param options
	 * @returns {{$SOAJS_ENV: (void|string), $SOAJS_DEPLOY_HA: string, $SOAJS_HA_NAME: string}}
	 */
	"buildAvailableVariables": function (options) {
		let variables = {
			'$SOAJS_ENV': options.env.toLowerCase(),
			'$SOAJS_DEPLOY_HA': '$SOAJS_DEPLOY_HA', // field computed at the driver level
			'$SOAJS_HA_NAME': '$SOAJS_HA_NAME' // field computed at the driver level
		};

		for (let i in options.params.data.variables) {
			variables[i] = options.params.data.variables[i];
		}

		return variables;
	},

	/**
	 * map computed env variables into catalog recipe env variables
	 * @param {Object} options
	 * @param {Array} serviceVariables
	 * @returns {*}
	 */
	"computeCatalogEnvVars" : function (options, serviceVariables) {
		// options.params.catalog.recipe.buildOptions.env <- read environment variables config
		// options.params.data.variables <- replace computed values from this object
		// options.params.serviceParams.variables <- push final list of values to this array
		if (!options.params.catalog.recipe.buildOptions || !options.params.catalog.recipe.buildOptions.env || Object.keys(options.params.catalog.recipe.buildOptions.env).length === 0) {
			return [];
		}

		//based on the catalog inputs in the recipe
		let result = [];
		let catalogEnvs = Object.keys(options.params.catalog.recipe.buildOptions.env);

		catalogEnvs.forEach((oneEnvName) => {
			let oneEnv = options.params.catalog.recipe.buildOptions.env[oneEnvName];
			// if env variable is of type static, just set its value and return
			if (oneEnv.type === 'static') {
				result.push(oneEnvName.replace("$", "") + '=' + oneEnv.value);
			}
			// if env variable is of type userInput, get value from request body, if not found see use default value
			else if (oneEnv.type === 'userInput') {
				let value = null;

				// if user specified value in request body, overwrite default with the new value
				if (options.params.inputmaskData.custom &&
					options.params.inputmaskData.custom.env &&
					options.params.inputmaskData.custom.env[oneEnvName]) {
					value = options.params.inputmaskData.custom.env[oneEnvName];
				}

				if (value) {
					result.push(oneEnvName.replace("$", "") + '=' + value);
				}
			}
			else if (oneEnv.type === 'computed') {

				// if computed value is dynamic, collect all applicable values and set them
				if (config.dynamicCatalogVariables.indexOf(oneEnv.value) !== -1) {
					let nVariableName = oneEnv.value.replace(/_N$/, ''), nCount = 1;
					let regex = new RegExp(nVariableName.replace("$", "\\$") + '_[0-9]+');
					Object.keys(serviceVariables).forEach(function (oneVar) {
						if (oneVar.match(regex)) {
							result.push(oneEnvName.replace("$", "") + '_' + nCount++ + '=' + serviceVariables[oneVar]);
						}
					});
				}
				else {
					if (oneEnv.value && serviceVariables[oneEnv.value]) {
						result.push(oneEnvName.replace("$", "") + '=' + serviceVariables[oneEnv.value]);
					}
				}
			}
			else if (oneEnv.type === 'secret') {
				let value = null;
				if (options.params.inputmaskData.custom &&
					options.params.inputmaskData.custom.env &&
					options.params.inputmaskData.custom.env[oneEnvName]) {
					value = options.params.inputmaskData.custom.env[oneEnvName];
				}
				if (value){
					result.push({
						name: oneEnvName,
						valueFrom: {
							secretKeyRef: {
								name: options.params.inputmaskData.custom.env[oneEnvName].secret,
								key: options.params.inputmaskData.custom.env[oneEnvName].key
							}
						}
					});
				}
			}
		});

		return result;
	}
};

module.exports = engine;
