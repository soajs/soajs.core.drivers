'use strict';

const async = require('async');
const helper = require('../utils/helper.js');
const config = require('./../config');
const utils = require('../../../lib/utils/utils.js');
const driverUtils = require('../utils/index.js');
const vms = require('../vm/index.js');

const request = require('request');

const securityGroups = {
	
	/**
	 * List available security groups
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	list: function (options, cb) {
		options.soajs.log.debug(`Listing securityGroups for resourcegroup ${options.params.group} `);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
					
				});
				networkClient.networkSecurityGroups.list(options.params.group, function (error, networkSecurityGroups) {
					utils.checkError(error, 734, cb, () => {
						async.map(networkSecurityGroups, function (oneNetworkSecurityGroup, callback) {
							return callback(null, helper.buildSecurityGroupsRecord({networkSecurityGroups: oneNetworkSecurityGroup}));
						}, function (error, securityGroupsList) {
							return cb(null, securityGroupsList);
						});
					});
				});
			});
		});
	},
	
	/**
	 * Get one network security group
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	get: function (options, cb) {
		options.soajs.log.debug(`Getting security group ${options.params.name} in resource group ${options.params.group}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const networkClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
					
				});
				networkClient.networkSecurityGroups.get(options.params.group, options.params.name, function (error, networkSecurityGroup) {
					utils.checkError(error, 734, cb, () => {
						return cb(null, helper.buildSecurityGroupsRecord({networkSecurityGroups: networkSecurityGroup}));
					});
				});
			});
		});
	},
	
	/**
	 * Create a new security group
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	create: function (options, cb) {
		options.soajs.log.debug(`Creating/Updating securityGroup in ${options.params.name} resource group ${options.params.group} `);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				let bearerToken = '', subscriptionId = '';
				if (authData &&
					authData.credentials &&
					authData.credentials.tokenCache &&
					authData.credentials.tokenCache._entries &&
					Array.isArray(authData.credentials.tokenCache._entries) &&
					authData.credentials.tokenCache._entries[0] &&
					authData.credentials.tokenCache._entries[0].accessToken) {
					bearerToken = authData.credentials.tokenCache._entries[0].accessToken;
				}
				
				if (options.infra && options.infra.api && options.infra.api.subscriptionId) {
					subscriptionId = options.infra.api.subscriptionId;
				}
				
				let requestOptions = {
					method: 'PUT',
					uri: `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${options.params.group}/providers/Microsoft.Network/networkSecurityGroups/${options.params.name}?api-version=${config.apiVersion2018}`,
					headers: {Authorization: `Bearer ${bearerToken}`},
					json: true,
					body: {
						location: options.params.region,
						properties: {
							securityRules: securityGroups.buildSecurityRules(options.params.ports)
						},
						tags: options.params.labels || {}
					}
				};
				request(requestOptions, function (error, response, body) {
					if (error) return cb(error);
					if (body && body.error) return cb(body.error);
					
					return cb(null, {id: body.id});
				});
			});
		});
	},
	
	/**
	 * Update a security group
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	update: function (options, cb) {
		return securityGroups.create(options, cb);
	},
	
	/**
	 * Delete a security group
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	delete: function (options, cb) {
		options.soajs.log.debug(`Deleting security group ${options.params.securityGroupName}`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const resourceClient = driverUtils.getConnector({
					api: 'network',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				resourceClient.networkSecurityGroups.deleteMethod(options.params.group, options.params.name, function (error) {
					utils.checkError(error, 744, cb, () => {
						return cb(null, true);
					});
				});
			});
		});
	},
	
	/**
	 * Build the security rules based on the input ports
	 
	 * @param  {Array}   ports  The list of ports
	 * @return {Array}
	 */
	buildSecurityRules: function (ports) {
		let securityRules = [];
		let defaultDestinationPortRange;
		if (process.env.SOAJS_CLOOSTRO_TEST) {
			defaultDestinationPortRange = 1;
		}
		if (Array.isArray(ports)) {
			ports.forEach(onePort => {
				securityRules.push({
					name: onePort.name,
					properties: {
						priority: onePort.priority,
						protocol: (onePort.protocol) ? onePort.protocol : "*",
						access: helper.capitalize(onePort.access, "Allow"), //Allow || Deny
						direction: helper.capitalize(onePort.direction, "Inbound"), //Inboud || Outbound
						sourceAddressPrefix: (onePort.sourceAddress) ? onePort.sourceAddress : "*",
						sourcePortRange: "*", // Azure docs recommend not to use this field for port filtering (onePort.target) ? onePort.target : "*",
						destinationAddressPrefix: (onePort.destinationAddress) ? onePort.destinationAddress : "*",
						destinationPortRange: (onePort.target) ? onePort.target : defaultDestinationPortRange || (Math.floor(Math.random() * 2768) + 30000)
					}
				});
			});
		}
		
		return securityRules;
	},
	
	/**
	 * Update security group based on the ports found in the catalog recipe
	 
	 * @param  {Array}   ports  The list of ports
	 * @return {Array}
	 */
	syncPortsFromCatalogRecipe: function (options, cb) {
		
		/**
		 * options.params
		 *                  .securityGroups
		 *                  .ports
		 *                  .group
		 *
		 * inspect security groups selected (only one for azure)
		 * update the ports based on the catalog recipe
		 * update security groups
		 */
		
		function assignPortPriority(existingPorts) {
			let newPriority = Math.floor((Math.random() * 1000) + 500);
			if (process.env.SOAJS_CLOOSTRO_TEST) {
				// override random priority generator during test cases
				newPriority = 500;
			}
			if (existingPorts && Array.isArray(existingPorts) && existingPorts.length > 0) {
				for (let i = 0; i < existingPorts.length; i++) {
					if (existingPorts[i].priority === newPriority) {
						return assignPortPriority(existingPorts);
					}
				}
			}
			
			return newPriority;
		}
		
		function checkSecurityGroups(callback) {
			if (!options.params.securityGroups || !Array.isArray(options.params.securityGroups) || options.params.securityGroups.length === 0) {
				if (!options.params.vms || !Array.isArray(options.params.vms) || options.params.vms.length === 0) {
					return callback(new Error("Missing instance ids, security groups could not be retreived"));
				}
				
				options.params.securityGroups = [];
				async.concat(options.params.vms, (oneVmId, miniCallback) => {
					let inspectOptions = Object.assign({}, options);
					inspectOptions.params = {
						group: options.params.group,
						vmName: oneVmId
					};
					vms.inspectService(inspectOptions, (error, vmRecord) => {
						if (error) return miniCallback(error);
						
						return miniCallback(null, vmRecord.securityGroup || []);
					});
				}, (error, vmsGroups = []) => {
					if (error) return callback(error);
					
					vmsGroups.forEach((oneGroup) => {
						if (!options.params.securityGroups.includes(oneGroup)) {
							options.params.securityGroups.push(oneGroup);
						}
					});
					if (options.params.securityGroups.length === 0) {
						return callback(new Error("Could not find the security groups associated to this layer"));
					}
					
					return callback(null, true);
				});
			}
			else {
				return callback(null, true);
			}
		}
		
		function getSecurityGroups(result, callback) {
			// no security groups selected
			if (!options.params.securityGroups || !Array.isArray(options.params.securityGroups) || options.params.securityGroups.length === 0) {
				return callback(null, []);
			}
			
			// catalog recipe does not include any ports
			if (!options.params.ports || !options.params.ports || !Array.isArray(options.params.ports) || options.params.ports.length === 0) {
				return callback(null, []);
			}
			
			async.map(options.params.securityGroups, (oneSecurityGroup, mapCallback) => {
				let getOptions = Object.assign({}, options);
				getOptions.params = {
					group: options.params.group,
					name: oneSecurityGroup
				};
				
				return securityGroups.get(getOptions, mapCallback);
			}, callback);
		}
		
		function computePorts(result, callback) {
			if (!result.getSecurityGroups || !Array.isArray(result.getSecurityGroups) || result.getSecurityGroups.length === 0) {
				return callback(null, []);
			}
			
			let catalogPorts = options.params.ports;
			async.map(result.getSecurityGroups, (oneSecurityGroup, mapCallback) => {
				let sgPorts = oneSecurityGroup.ports || [];
				async.concat(catalogPorts, function (oneCatalogPort, concatCallback) {
					async.detect(sgPorts, function (oneSgPort, detectCallback) {
						if (oneSgPort.access === 'allow' && oneSgPort.direction === 'inbound') {
							if (!oneCatalogPort.published) oneCatalogPort.published = '';
							if (!oneCatalogPort.target) oneCatalogPort.target = '';
							if (oneSgPort.isPublished === oneCatalogPort.isPublished && !oneSgPort.readonly &&
								((oneSgPort.published.toString() == oneCatalogPort.published.toString()) || oneSgPort.published === '*') &&
								((oneSgPort.target.toString() == oneCatalogPort.target.toString()) || oneSgPort.target === '*')) {
								return detectCallback(null, true);
							}
						}
						return detectCallback(null, false);
					}, function (error, foundPort) {
						if (foundPort) {
							return concatCallback(null, []);
						}
						
						return concatCallback(null, [
							{
								name: oneCatalogPort.name,
								protocol: oneCatalogPort.protocol || '*',
								access: 'allow',
								priority: assignPortPriority(sgPorts),
								direction: 'inbound',
								target: (oneCatalogPort.target) ? oneCatalogPort.target.toString() : '*',
								published: (oneCatalogPort.published) ? oneCatalogPort.published.toString() : '*',
								sourceAddress: (oneCatalogPort.isPublished) ? '*' : 'VirtualNetwork',
								destinationAddress: (oneCatalogPort.isPublished) ? '*' : 'VirtualNetwork',
								isPublished: oneCatalogPort.isPublished || false
							}
						]);
					});
				}, function (error, portsUpdates) {
					//no error to be handled
					oneSecurityGroup.portsUpdates = portsUpdates;
					return mapCallback(null, oneSecurityGroup);
				});
			}, callback);
		}
		
		function updateSecurityGroups(result, callback) {
			if (!result.computePorts || !Array.isArray(result.computePorts) || result.computePorts.length === 0) {
				return callback(null, true);
			}
			
			async.each(result.computePorts, (oneSecurityGroup, eachCallback) => {
				if (!oneSecurityGroup.portsUpdates || oneSecurityGroup.portsUpdates.length === 0) {
					return callback(null, true);
				}
				
				let updateOptions = Object.assign({}, options);
				oneSecurityGroup.portsUpdates = oneSecurityGroup.portsUpdates.concat(oneSecurityGroup.ports.filter((oneEntry) => {
					return !oneEntry.readonly;
				}));
				updateOptions.params = {
					region: oneSecurityGroup.region,
					group: options.params.group,
					name: oneSecurityGroup.name,
					ports: oneSecurityGroup.portsUpdates
				};
				
				return securityGroups.update(updateOptions, eachCallback);
			}, callback);
		}
		
		async.auto({
			checkSecurityGroups,
			getSecurityGroups: ['checkSecurityGroups', getSecurityGroups],
			computePorts: ['checkSecurityGroups', 'getSecurityGroups', computePorts],
			updateSecurityGroups: ['computePorts', updateSecurityGroups]
		}, function (error, result) {
			utils.checkError(error, 734, cb, () => {
				return cb(null, true);
			});
		});
	}
};

module.exports = securityGroups;
