"use strict";
const path = require('path');

const templates = require("../../utils/template");
const errorFile = require('../../utils/errors.js');
const soajsCoreLibs = require("soajs.core.libs");
const utils = require('../../utils/utils.js');
const lib = require('./utils.js');

const engine = {

	cleanLabel(label) {
		return label.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
	},

	deployService(options, cb) {
		function cleanLabel(label) {
			return engine.cleanLabel(label);
		}

		//regenerate the options.params.data after mapping common code for service template
		let annotations;
		if(options.params.data.annotations){
			annotations = options.params.data.annotations;
		}
		options.params.data = templates.constructDeployerParams(options);
		options.params.data.labels['soajs.service.label'] = cleanLabel(options.params.data.name);
		if(options.params.data.labels['soajs.service.label'].indexOf(options.params.data.labels['soajs.env.code'] + "-") !== 0 || options.params.data.labels['soajs.service.label'].match(/dashboard-v[0-9]+/g)) { // add a special case for dashboard service
			options.params.data.labels['soajs.service.label'] = options.params.data.labels['soajs.env.code'] + "-" + options.params.data.labels['soajs.service.label'];
		}
		if(options.params.data.labels['soajs.service.version'] && options.params.data.labels['soajs.service.label'].indexOf("-v" + options.params.data.labels['soajs.service.version']) === -1) {
			options.params.data.labels['soajs.service.label'] = options.params.data.labels['soajs.service.label'] + "-v" + options.params.data.labels['soajs.service.version'];
		}
		for (let i = 0; i < options.params.data.variables.length; i++) {
			if (typeof options.params.data.variables[i] === 'string' && options.params.data.variables[i].indexOf('$SOAJS_DEPLOY_HA') !== -1) {
				options.params.data.variables[i] = options.params.data.variables[i].replace("$SOAJS_DEPLOY_HA", "kubernetes");
				break;
			}
		}

		options.params.data.labels = utils.normalizeLabels(options.params.data.labels);
		let ports = [], service = null;
		if (options.params.data.ports && options.params.data.ports.length > 0) {
			let serviceSchemaPath = path.join(__dirname, '../../schemas/kubernetes/service.template.js');
			if (require.resolve(serviceSchemaPath)) {
				delete require.cache[require.resolve(serviceSchemaPath)];
			}
			service = utils.cloneObj(require(serviceSchemaPath));
			if (options.params.customName) {
				service.metadata.name = soajsCoreLibs.version.sanitize(cleanLabel(options.params.data.name));
			}
			else {
				service.metadata.name = soajsCoreLibs.version.sanitize(cleanLabel(options.params.data.name)) + '-service';
			}

			service.metadata.labels = options.params.data.labels;
			service.spec.selector = {'soajs.service.label': options.params.data.labels['soajs.service.label']};

			options.params.data.ports.forEach((onePortEntry, portIndex) => {
				let portConfig = {
					protocol: ((onePortEntry.protocol) ? onePortEntry.protocol.toUpperCase() : 'TCP'),
					name: onePortEntry.name || 'port' + portIndex,
					port: onePortEntry.port || onePortEntry.target,
					targetPort: onePortEntry.target,
				};

				//todo: why ????
				if (onePortEntry.isPublished) {
					if (!onePortEntry.published) {
						service.spec.type = 'LoadBalancer';
						delete portConfig.nodePort;
					}
					else {
						if (!service.spec.type || service.spec.type !== 'NodePort') {
							service.spec.type = 'NodePort';
						}
						portConfig.nodePort = onePortEntry.published || portConfig.targetPort;
					}

					portConfig.name = onePortEntry.name || 'published' + portConfig.name;
					portConfig.name = portConfig.name.toLowerCase();
					if (onePortEntry.preserveClientIP) {
						service.spec.externalTrafficPolicy = 'Local';
					}
				}
				ports.push(portConfig);

			});

			service.spec.ports = ports;
		}
		let payload = {};
		if (options.params.inputmaskData.deployConfig.replication.mode === 'deployment') {
			let deploymentSchemaPath = path.join(__dirname, '../../schemas/kubernetes/deployment.template.js');
			if (require.resolve(deploymentSchemaPath)) {
				delete require.cache[require.resolve(deploymentSchemaPath)];
			}
			payload = utils.cloneObj(require(deploymentSchemaPath));
			options.params.type = 'deployment';
		}
		else if (options.params.inputmaskData.deployConfig.replication.mode === 'daemonset') {
			let daemonsetSchemaPath = path.join(__dirname, '../../schemas/kubernetes/daemonset.template.js');
			if (require.resolve(daemonsetSchemaPath)) {
				delete require.cache[require.resolve(daemonsetSchemaPath)];
			}
			payload = utils.cloneObj(require(daemonsetSchemaPath));
			options.params.type = 'daemonset';
		}

		if (!payload || Object.keys(payload).length === 0) {
			return cb({
				source: 'driver',
				value: new Error(errorFile[517]),
				code: 517,
				msg: errorFile[517]
			});
		}

		if (!payload.metadata) { payload.metadata = {}; }
		payload.metadata.name = soajsCoreLibs.version.sanitize(cleanLabel(options.params.data.name));
		payload.metadata.labels = options.params.data.labels;

		payload.metadata.labels['soajs.service.label'] = cleanLabel(payload.metadata.labels['soajs.service.label']);
		if (options.params.inputmaskData.deployConfig.replication.mode === 'deployment') {
			payload.spec.replicas = options.params.inputmaskData.deployConfig.replication.replicas;
		}

		payload.spec.selector.matchLabels = {'soajs.service.label': cleanLabel(options.params.data.labels['soajs.service.label'])};
		payload.spec.template.metadata.name = cleanLabel(options.params.data.labels['soajs.service.name']);
		payload.spec.template.metadata.labels = options.params.data.labels;
		//NOTE: only one container is being set per pod
		payload.spec.template.spec.containers[0].name = cleanLabel(options.params.data.labels['soajs.service.name']);
		payload.spec.template.spec.containers[0].image = options.params.data.image;
		payload.spec.template.spec.containers[0].imagePullPolicy = options.params.data.imagePullPolicy || 'Always';
		payload.spec.template.spec.containers[0].env = lib.buildEnvList({envs: options.params.data.variables});
		//add secret used to pull image private credentials if supplied
		if (options.params.data.imageAuth){
			payload.spec.template.spec.imagePullSecrets = [{
				"name": options.params.data.imageAuth
			}]
		}
		if (options.params.data.containerDir) {
			payload.spec.template.spec.containers[0].workingDir = options.params.data.containerDir;
		}
		else {
			delete payload.spec.template.spec.containers[0].workingDir;
		}

		if (options.params.data.command && Array.isArray(options.params.data.command) && options.params.data.command.length > 0) {
			payload.spec.template.spec.containers[0].command = options.params.data.command;
		}
		else {
			delete payload.spec.template.spec.containers[0].command;
		}

		if (options.params.data.args && Array.isArray(options.params.data.args) && options.params.data.args.length > 0) {
			payload.spec.template.spec.containers[0].args = options.params.data.args;
		}
		else {
			delete payload.spec.template.spec.containers[0].args;
		}

		if (options.params.data.memoryLimit) {
			payload.spec.template.spec.containers[0].resources = {
				limits: {
					memory: options.params.data.memoryLimit
				}
			};
		}

		if (options.params.data.cpuLimit) {
			if (!payload.spec.template.spec.containers[0].resources) payload.spec.template.spec.containers[0].resources = {};
			if (!payload.spec.template.spec.containers[0].resources.limits) payload.spec.template.spec.containers[0].resources.limits = {};
			payload.spec.template.spec.containers[0].resources.limits.cpu = options.params.data.cpuLimit;
		}

		if (ports && ports.length > 0) {
			payload.spec.template.spec.containers[0].ports = [];
			ports.forEach((onePort) => {
				payload.spec.template.spec.containers[0].ports.push({
					name: onePort.name,
					containerPort: onePort.port
				});
			});
		}
		//[a-z0-9]([-a-z0-9]*[a-z0-9])?
		if (options.params.data.voluming && options.params.data.voluming.volumes && options.params.data.voluming.volumeMounts) {
			payload.spec.template.spec.volumes = payload.spec.template.spec.volumes.concat(options.params.data.voluming.volumes);
			payload.spec.template.spec.containers[0].volumeMounts = payload.spec.template.spec.containers[0].volumeMounts.concat(options.params.data.voluming.volumeMounts);
		}

		//added support for annotations
		if (annotations) {
			payload.spec.template.metadata.annotations = annotations;
		}

		if (options.params.catalog && options.params.catalog.recipe && options.params.catalog.recipe.deployOptions && options.params.catalog.recipe.deployOptions.readinessProbe) {
			if (options.params.catalog.recipe.deployOptions.readinessProbe.kuberentes){
				payload.spec.template.spec.containers[0].readinessProbe = options.params.catalog.recipe.deployOptions.readinessProbe.kuberentes;
			}
			else {
				payload.spec.template.spec.containers[0].readinessProbe = options.params.catalog.recipe.deployOptions.readinessProbe;
			}
		}

		let namespace = null;

		if (options.params.data.namespace) {
			namespace = options.params.data.namespace;
		} else {
			namespace = lib.buildNameSpace(options);
		}

		//namespace to be checked by initNamespace function
		options.checkNamespace = namespace;

		return cb(null, {namespace, service, payload})
	},

	redeployService(deployment, options) {
		deployment.spec.template.spec.containers[0].env.push({
			name: 'SOAJS_REDEPLOY_TRIGGER',
			value: 'true'
		});

		return deployment;
	},

	rebuildService(deployment, options) {
		//regenerate the options.params.data after mapping common code for service template
		options.params.newBuild = templates.constructDeployerParams(options);
		options.params.newBuild.labels['soajs.service.label'] = engine.cleanLabel(options.params.newBuild.name);
		if(options.params.newBuild.labels['soajs.service.label'].indexOf(options.params.newBuild.labels['soajs.env.code'] + "-") !== 0 || options.params.newBuild.labels['soajs.service.label'].match(/dashboard-v[0-9]+/g)) { // add a special case for dashboard service
			options.params.newBuild.labels['soajs.service.label'] = options.params.newBuild.labels['soajs.env.code'] + "-" + options.params.newBuild.labels['soajs.service.label'];
		}
		if(options.params.newBuild.labels['soajs.service.version'] && options.params.newBuild.labels['soajs.service.label'].indexOf("-v" + options.params.newBuild.labels['soajs.service.version']) === -1) {
			options.params.newBuild.labels['soajs.service.label'] = options.params.newBuild.labels['soajs.service.label'] + "-v" + options.params.newBuild.labels['soajs.service.version'];
		}

		if (options.params.newBuild.variables && Array.isArray(options.params.newBuild.variables)) {
			for (let i = 0; i < options.params.newBuild.variables.length; i++) {
				if (typeof options.params.newBuild.variables[i] === 'string' && options.params.newBuild.variables[i].indexOf('$SOAJS_DEPLOY_HA') !== -1) {
					options.params.newBuild.variables[i] = options.params.newBuild.variables[i].replace("$SOAJS_DEPLOY_HA", "kubernetes");
					break;
				}
			}
		}

		options.params.newBuild.labels = utils.normalizeLabels(options.params.newBuild.labels);
		deployment.metadata.labels = options.params.newBuild.labels;
		deployment.spec.template.metadata.labels = options.params.newBuild.labels;
		deployment.spec.template.spec.containers[0].env = lib.buildEnvList({envs: options.params.newBuild.variables});
		deployment.spec.template.spec.containers[0].image = options.params.newBuild.image;
		deployment.spec.template.spec.containers[0].imagePullPolicy = options.params.newBuild.imagePullPolicy;
		deployment.spec.template.spec.containers[0].command = options.params.newBuild.command;
		deployment.spec.template.spec.containers[0].args = options.params.newBuild.args;
		
		if (options.params.data.imageAuth){
			deployment.spec.template.spec.containers[0].imagePullSecrets = [{
				"name": options.params.data.imageAuth
			}]
		}
		deployment.spec.template.spec.volumes = [];
		deployment.spec.template.spec.containers[0].volumeMounts = [];
		if (options.params.newBuild.voluming && Object.keys(options.params.newBuild.voluming).length > 0) {
			deployment.spec.template.spec.volumes = options.params.newBuild.voluming.volumes || [];
			deployment.spec.template.spec.containers[0].volumeMounts = options.params.newBuild.voluming.volumeMounts || [];
		}

		if (options.params.newBuild.memoryLimit) {
			if (!deployment.spec.template.spec.containers[0].resources) deployment.spec.template.spec.containers[0].resources = {};
			if (!deployment.spec.template.spec.containers[0].resources.limits) deployment.spec.template.spec.containers[0].resources.limits = {};
			deployment.spec.template.spec.containers[0].resources.limits.memory = options.params.newBuild.memoryLimit;
		}

		if (options.params.newBuild.cpuLimit) {
			if (!deployment.spec.template.spec.containers[0].resources) deployment.spec.template.spec.containers[0].resources = {};
			if (!deployment.spec.template.spec.containers[0].resources.limits) deployment.spec.template.spec.containers[0].resources.limits = {};
			deployment.spec.template.spec.containers[0].resources.limits.cpu = options.params.newBuild.cpuLimit;
		}

		return deployment;

	},

	AddServicePorts(service, ports) {
		let portsOutput = [], preserveClientIP = false;
		service.spec.type = 'ClusterIP';
		if (ports && ports.length > 0) {
			ports.forEach((onePortEntry, portIndex) => {
				let portConfig = {
					protocol: ((onePortEntry.protocol) ? onePortEntry.protocol.toUpperCase() : 'TCP'),
					name: onePortEntry.name || 'port' + portIndex,
					port: onePortEntry.port || onePortEntry.target,
					target: onePortEntry.target
				};

				if (onePortEntry.isPublished) {
					if (!onePortEntry.published) {
						service.spec.type = 'LoadBalancer';
						delete portConfig.nodePort;
					}
					else {
						if (!service.spec.type || service.spec.type !== 'NodePort') {
							service.spec.type = 'NodePort';
						}
						portConfig.nodePort = onePortEntry.published || portConfig.targetPort;
					}

					portConfig.name = onePortEntry.name || 'published' + portConfig.name;

					if (onePortEntry.preserveClientIP) {
						service.spec.externalTrafficPolicy = 'Local';
						preserveClientIP = true;
					}
				}
				portsOutput.push(portConfig);

			});

			if (!preserveClientIP && service && service.spec && service.spec.externalTrafficPolicy === 'Local') {
				delete service.spec.externalTrafficPolicy;
			}

			service.spec.ports = portsOutput;
		}
		return service;
	}
};

module.exports = engine;
