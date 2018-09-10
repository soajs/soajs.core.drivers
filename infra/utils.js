"use strict";

const utils = {
	
	updateEnvironmentRecord(options, deployedServiceDetails, loadBalancer, cb) {
		if(!options.env){
			options.env = options.soajs.registry.code;
		}
		let env = options.env.toUpperCase();
		if (loadBalancer && deployedServiceDetails && deployedServiceDetails.service) {
			if(deployedServiceDetails.service.name === env.toLowerCase() + "-nginx"){
				if(deployedServiceDetails.service.labels && deployedServiceDetails.service.labels['soajs.service.type'] === 'server' && deployedServiceDetails.service.labels['soajs.service.subtype'] === 'nginx'){
					let protocolValue = (loadBalancer === 443) ? 'https' : 'http';
					//compare the above values with the current environment settings and update if required
					if ((!options.soajs.registry.protocol || (options.soajs.registry.protocol !== protocolValue)) || (!options.soajs.registry.port || (options.soajs.registry.port !== loadBalancer))) {
						options.soajs.registry.protocol = protocolValue;
						options.soajs.registry.port = loadBalancer;
					}
				}
			}
		}
		return cb();
	},
	
	updateEnvSettings(driver, cluster, options, deployedServiceDetails, cb) {
		let maxAttempts = 15;
		let currentAttempt = 1;
		
		if (options.params.catalog && options.params.catalog.type === 'nginx' || (options.params.catalog && options.params.catalog.subtype === 'nginx' && options.params.catalog.type === 'server')) {
			
			//if no ports are set in the recipe, do not perform check
			if (!options.params.catalog.recipe || !options.params.catalog.recipe.deployOptions || !options.params.catalog.recipe.deployOptions.ports || !Array.isArray(options.params.catalog.recipe.deployOptions.ports)) {
				return cb();
			}
			
			let loadBalancer = null;
			let publishedPort = false;
			options.params.catalog.recipe.deployOptions.ports.forEach((onePublishedPort) => {
				if (onePublishedPort.isPublished) {
					publishedPort = true;
				}
				
				if(onePublishedPort.published){
					loadBalancer = null;
				}
				else{
					if(onePublishedPort.target === 443){
						loadBalancer = 443;
					}
					
					if(!loadBalancer && onePublishedPort.target === 80){
						loadBalancer = 80;
					}
				}
			});
			if (options.original){
				if (options.original.service && options.original.service.ports && options.original.service.ports.length > 0){}
				publishedPort = true;
			}
			if (publishedPort) {
				computeProtocolAndPortsFromService(loadBalancer);
			}
			else {
				 return cb();
			}
		}
		else {
			//if no ports are set in the recipe, do not perform check
			if (!options.params.catalog || !options.params.catalog.recipe || !options.params.catalog.recipe.deployOptions || !options.params.catalog.recipe.deployOptions.ports || !Array.isArray(options.params.catalog.recipe.deployOptions.ports)) {
				return cb();
			}
			
			let loadBalancer = null;
			let publishedPort = false;
			options.params.catalog.recipe.deployOptions.ports.forEach((onePublishedPort) => {
				if (onePublishedPort.isPublished) {
					publishedPort = true;
				}
			});
			
			if (publishedPort) {
				utils.checkWithInfra(cluster, options, deployedServiceDetails, (error) => {
					if(error){
						return cb(error);
					}
					else{
						utils.updateEnvironmentRecord(options, deployedServiceDetails, loadBalancer, cb);
					}
				});
			}
			else{
				return cb();
			}
		}
		
		function computeProtocolAndPortsFromService(loadBalancer) {
			driver.inspectService(options, (error, deployedServiceDetails) => {
				if (error) {
					return cb(error);
				}
				else {
					let publishedPort = false;
					deployedServiceDetails.service.ports.forEach((onePublishedPort) => {
						if (onePublishedPort && onePublishedPort.published) {
							publishedPort = true;
						}
					});
					//no port allocated yet, restart in 2 seconds
					//check to see if the service have ports originally
					if (options.original && !publishedPort){
						if (options.original.service && options.original.service.ports && options.original.service.ports.length > 0){
							publishedPort = true;
						}
					}
					if (!publishedPort && currentAttempt <= maxAttempts) {
						currentAttempt++;
						setTimeout(() => {
							computeProtocolAndPortsFromService(loadBalancer);
						}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 1000);
					}
					else {
						let protocol = 'http';
						let port = 80;
						
						if(deployedServiceDetails.service.env){
							for (let i = 0; i < deployedServiceDetails.service.env.length; i++) {
								let oneEnv = deployedServiceDetails.service.env[i].split('=');
								if (oneEnv[0] === 'SOAJS_NX_API_HTTPS' && ['true', '1'].indexOf(oneEnv[1]) !== -1) {
									protocol = 'https';
								}
							}
						}
						
						deployedServiceDetails.service.ports.forEach((onePort) => {
							if (onePort.published) {
								//fi update
								if (protocol === 'https' && onePort.target === 443) {
									port = onePort.published;
								}
								else if (protocol === 'http' && onePort.target === 80) {
									port = onePort.published;
								}
							}
						});
						
						//compare the above values with the current environment settings and update if required
						if ((!options.soajs.registry.protocol || (options.soajs.registry.protocol !== protocol)) || (!options.soajs.registry.port || (options.soajs.registry.port !== port))) {
							options.soajs.registry.protocol = protocol;
							options.soajs.registry.port = port;
						}
						
						utils.checkWithInfra(cluster, options, deployedServiceDetails, (error) => {
							if(error){
								return cb(error);
							}
							else{
								utils.updateEnvironmentRecord(options, deployedServiceDetails, loadBalancer, cb);
							}
						});
					}
				}
			});
		}
	},
	
	checkWithInfra(cluster, options, deployedServiceDetails, cb) {
		options.params = {
			info: options.infra.info,
			name: deployedServiceDetails.service.labels['soajs.service.name'],
			version: deployedServiceDetails.service.labels["soajs.service.version"],
			type: deployedServiceDetails.service.labels["soajs.service.type"],
			ports: deployedServiceDetails.service.ports,
			envCode: options.soajs.registry.code.toUpperCase(),
			soajs_project: options.params.inputmaskData.soajs_project || 'local'
		};
		
		cluster.publishPorts(options, cb);
	}
};

module.exports = utils;