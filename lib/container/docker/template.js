"use strict";

const templates = require("../../utils/template");
const utils = require("../../utils/utils");
const soajsCoreLibs = require("soajs.core.libs");

const engine = {
	
	/**
	 * render and build the service JSON representation for deployment
	 * @param {Object} options
	 * @returns {*}
	 */
	deployService (options){
		//regenerate the options.params.data after mapping common code for service template
		options.params.data = templates.constructDeployerParams(options);
		
		/*
			parse the template and generate the payload object
		 */
		let serviceSchemaPath = __dirname + '/../../schemas/swarm/service.template.js';
		if (require.resolve(serviceSchemaPath)) {
			delete require.cache[require.resolve(serviceSchemaPath)];
		}
		
		let payload = utils.cloneObj(require(serviceSchemaPath));
		
		for (let i = 0; i < options.params.data.variables.length; i++) {
			if (options.params.data.variables[i].indexOf('$SOAJS_DEPLOY_HA') !== -1) {
				options.params.data.variables[i] = options.params.data.variables[i].replace("$SOAJS_DEPLOY_HA", "swarm");
			}
			
			if (options.params.data.variables[i].indexOf('$SOAJS_HA_NAME') !== -1) {
				options.params.data.variables[i] = options.params.data.variables[i].replace("$SOAJS_HA_NAME", "{{.Task.Name}}");
			}
		}
		
		payload.Name = soajsCoreLibs.version.sanitize(options.params.data.name);
		payload.TaskTemplate.ContainerSpec.Image = options.params.data.image;
		payload.TaskTemplate.ContainerSpec.Env = options.params.data.variables;
		payload.TaskTemplate.ContainerSpec.Dir = ((options.params.data.containerDir) ? options.params.data.containerDir : "");
		payload.TaskTemplate.Resources.Limits.MemoryBytes = options.params.data.memoryLimit;
		payload.TaskTemplate.RestartPolicy.Condition = options.params.data.restartPolicy.condition;
		payload.TaskTemplate.RestartPolicy.MaxAttempts = options.params.data.restartPolicy.maxAttempts;
		
		if(options.params.data.replication.mode){ // todo: please confirm
			payload.Mode[options.params.data.replication.mode.charAt(0).toUpperCase() + options.params.data.replication.mode.slice(1)] = {};
		}
		
		payload.Networks[0].Target = ((options.params.data.network) ? options.params.data.network : "");
		payload.Labels = options.params.data.labels;
		payload.EndpointSpec = {Mode: 'vip', ports: []};
		
		//append secrets to the service template being created if any
		if(options.params.data.secrets && Array.isArray(options.params.data.secrets) && options.params.data.secrets.length > 0){
			payload.TaskTemplate.ContainerSpec.secrets = [];
			options.params.data.secrets.forEach((oneSecret) => {
				payload.TaskTemplate.ContainerSpec.secrets.push({
					SecretID: oneSecret.id,
					SecretName: oneSecret.name,
					File: {
						Name: oneSecret.target,
						UID: oneSecret.UID || "0",
						GID: oneSecret.GID || "0",
						Mode: oneSecret.Mode || 644
					}
				});
			});
		}
		
		if (options.params.data.command && Array.isArray(options.params.data.command) && options.params.data.command.length > 0) {
			payload.TaskTemplate.ContainerSpec.Command = options.params.data.command;
		}
		else {
			delete payload.TaskTemplate.ContainerSpec.Command;
		}
		
		if (options.params.data.args && Array.isArray(options.params.data.args) && options.params.data.args.length > 0) {
			payload.TaskTemplate.ContainerSpec.Args = options.params.data.args;
		}
		else {
			delete payload.TaskTemplate.ContainerSpec.Args;
		}
		
		//NOTE: in local deployments, controllers should only be deployed on manager nodes, needed for /proxySocket route
		if (options && options.driver && options.driver.split('.')[1] === 'local') {
			if (options.params.data.labels['soajs.service.name'] === 'controller') {
				payload.TaskTemplate.Placement = {
					Constraints: ['node.role == manager']
				};
			}
		}
		
		if (options.params.data.replication.mode === 'replicated') {
			payload.Mode.Replicated.Replicas = options.params.data.replication.replicas;
		}
		
		if (options.params.data.voluming && options.params.data.voluming.volumes && options.params.data.voluming.volumes.length > 0) {
			payload.TaskTemplate.ContainerSpec.Mounts = payload.TaskTemplate.ContainerSpec.Mounts.concat(options.params.data.voluming.volumes);
		}
		
		if (options.params.data.ports && options.params.data.ports.length > 0) {
			options.params.data.ports.forEach((onePortEntry) => {
				if (onePortEntry.isPublished) {
					let port = {
						Protocol: onePortEntry.protocol || 'tcp',
						TargetPort: onePortEntry.target
					};
					
					if (onePortEntry.published) {
						port.PublishedPort = onePortEntry.published;
					}
					
					if (onePortEntry.preserveClientIP) {
						port.PublishMode = 'host';
					}
					
					payload.EndpointSpec.ports.push(port);
				}
			});
		}
		if (options.params.data.readinessProbe
			&& options.params.data.readinessProbe.docker
			&& options.params.data.readinessProbe.docker.Test){
			// use what the user supplies you with
			payload.TaskTemplate.ContainerSpec.Healthcheck = options.params.data.readinessProbe.docker;
		}
		return payload;
	},

	/**
	 * render and build the service JSON representation for redeploying with the same settings
	 * @param {Object} deployment
	 * @param {Object} options
	 * @returns {*}
	 */
	redeployService (deployment, options){
		let update = deployment.Spec;
		update.version = deployment.Version.Index;
		
		if (!update.TaskTemplate) update.TaskTemplate = {};
		update.TaskTemplate.ForceUpdate = 1;
		if (!update.TaskTemplate.ContainerSpec) update.TaskTemplate.ContainerSpec = {};
		if (!update.TaskTemplate.ContainerSpec.Env) update.TaskTemplate.ContainerSpec.Env = [];
		update.TaskTemplate.ContainerSpec.Env.push('SOAJS_REDEPLOY_TRIGGER=true');
		
		return update;
	},
	
	/**
	 * render and build the service JSON representation for redeploying with new settings
	 * @param {Object} deployment
	 * @param {Object} options
	 * @returns {*}
	 */
	rebuildService (deployment, options) {
		let update = deployment.Spec;
		update.version = deployment.Version.Index;

		if (!update.TaskTemplate) update.TaskTemplate = {};
		if (!update.TaskTemplate.ContainerSpec) update.TaskTemplate.ContainerSpec = {};
		if (!update.TaskTemplate.ContainerSpec.Env) update.TaskTemplate.ContainerSpec.Env = [];

		//regenerate the options.params.data after mapping common code for service template
		options.params.newBuild = templates.constructDeployerParams(options);

		for (let i = 0; i < options.params.newBuild.variables.length; i++) {
			if (options.params.newBuild.variables[i].indexOf('$SOAJS_DEPLOY_HA') !== -1) {
				options.params.newBuild.variables[i] = options.params.newBuild.variables[i].replace("$SOAJS_DEPLOY_HA", "swarm");
			}

			if (options.params.newBuild.variables[i].indexOf('$SOAJS_HA_NAME') !== -1) {
				options.params.newBuild.variables[i] = options.params.newBuild.variables[i].replace("$SOAJS_HA_NAME", "{{.Task.Name}}");
			}
		}
		
		// use what the user supplies you with
		if (options.params.newBuild.readinessProbe
			&& options.params.newBuild.readinessProbe.docker
			&& options.params.newBuild.readinessProbe.docker.Test){
			
			update.TaskTemplate.Healthcheck = options.params.newBuild.readinessProbe.docker;
		}
		update.TaskTemplate.ForceUpdate = 1;
		update.TaskTemplate.ContainerSpec.Env = options.params.newBuild.variables;
		update.TaskTemplate.ContainerSpec.Image = options.params.newBuild.image;
		update.TaskTemplate.ContainerSpec.Command = options.params.newBuild.command;
		update.TaskTemplate.ContainerSpec.Args = options.params.newBuild.args;
		update.Labels = options.params.newBuild.labels;
		update.TaskTemplate.ContainerSpec.Labels = options.params.newBuild.labels;
		
		update.TaskTemplate.ContainerSpec.Mounts = {};
		if (options.params.newBuild.voluming && options.params.newBuild.voluming.volumes) {
			update.TaskTemplate.ContainerSpec.Mounts = options.params.newBuild.voluming.volumes;
		}
		
		//append secrets to the service template being created if any
		update.TaskTemplate.ContainerSpec.secrets = [];
		if (options.params.newBuild.secrets && Array.isArray(options.params.newBuild.secrets) && options.params.newBuild.secrets.length > 0) {
			options.params.newBuild.secrets.forEach((oneSecret) => {
				update.TaskTemplate.ContainerSpec.secrets.push({
					SecretID: oneSecret.id,
					SecretName: oneSecret.name,
					File: {
						Name: oneSecret.target,
						UID: oneSecret.UID || "0",
						GID: oneSecret.GID || "0",
						Mode: oneSecret.Mode || 644
					}
					
				});
			});
		}
		
		if (options.params.newBuild.memoryLimit) {
			if (!update.TaskTemplate.Resources) update.TaskTemplate.Resources = {};
			if (!update.TaskTemplate.Resources.Limits) update.TaskTemplate.Resources.Limits = {};
			if (!update.TaskTemplate.Resources.Limits.MemoryBytes) update.TaskTemplate.Resources.Limits.MemoryBytes = {};
			update.TaskTemplate.Resources.Limits.MemoryBytes = options.params.newBuild.memoryLimit;
		}
		
		if(update.EndpointSpec){
			update.EndpointSpec.Ports = [];
			if (options.params.newBuild.ports && options.params.newBuild.ports.length > 0) {
				if (!update.EndpointSpec) update.EndpointSpec = {Mode: 'vip'};
				
				options.params.newBuild.ports.forEach((onePortEntry) => {
					if (onePortEntry.isPublished) {
						let port = {
							Protocol: onePortEntry.protocol || 'tcp',
							TargetPort: onePortEntry.target
						};
						
						if (onePortEntry.published) {
							port.PublishedPort = onePortEntry.published;
						}
						
						if (onePortEntry.preserveClientIP) {
							port.PublishMode = 'host';
						}
						
						update.EndpointSpec.Ports.push(port);
					}
				});
			}
		}
		
		return update;
	}
};

module.exports = engine;