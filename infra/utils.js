"use strict";

const utils = {
	updateEnvSettings(driver, cluster, options, deployedServiceDetails, cb) {
		let maxAttempts = 30;
		let currentAttempt = 1;
		
		if (options.params.catalog && options.params.catalog.type === 'nginx' || (options.params.catalog && options.params.catalog.subtype === 'nginx' && options.params.catalog.type === 'server')) {
			
			//if no ports are set in the recipe, do not perform check
			if (!options.params.catalog.recipe || !options.params.catalog.recipe.deployOptions || !options.params.catalog.recipe.deployOptions.ports || !Array.isArray(options.params.catalog.recipe.deployOptions.ports)) {
				return cb();
			}
			
			let publishedPort = false;
			options.params.catalog.recipe.deployOptions.ports.forEach((onePublishedPort) => {
				if (onePublishedPort.isPublished) {
					publishedPort = true;
				}
			});
			
			if (publishedPort) {
				computeProtocolAndPortsFromService();
			}
			else{
				return cb();
			}
		}
		else {
			//if no ports are set in the recipe, do not perform check
			if (!options.params.catalog || !options.params.catalog.recipe || !options.params.catalog.recipe.deployOptions || !options.params.catalog.recipe.deployOptions.ports || !Array.isArray(options.params.catalog.recipe.deployOptions.ports)) {
				return cb();
			}
			
			let publishedPort = false;
			options.params.catalog.recipe.deployOptions.ports.forEach((onePublishedPort) => {
				if (onePublishedPort.isPublished) {
					publishedPort = true;
				}
			});
			
			if (publishedPort) {
				utils.checkWithInfra(cluster, options, deployedServiceDetails, cb)
			}
			else{
				return cb();
			}
		}
		
		function computeProtocolAndPortsFromService() {
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
					if (!publishedPort && currentAttempt <= maxAttempts) {
						currentAttempt++;
						setTimeout(() => {
							computeProtocolAndPortsFromService();
						}, (process.env.SOAJS_CLOOSTRO_TEST) ? 1 : 2000);
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
						
						utils.checkWithInfra(cluster, options, deployedServiceDetails, cb)
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