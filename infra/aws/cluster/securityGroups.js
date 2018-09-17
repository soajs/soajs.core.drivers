'use strict';

const async = require('async');
const config = require('./../config');
const utils = require('../utils/utils.js');
const helper = require('../utils/helper.js');

function getConnector(opts) {
	return utils.getConnector(opts, config);
}

const securityGroups = {

	/**
	 * get security groups

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	get: function (options, cb) {
		const aws = options.infra.api;

		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		ec2.describeSecurityGroups({
			GroupIds: [
				options.params.id
			]
		}, (err, response) => {
			if (err) {
				return cb(err);
			}
			if (response && response.SecurityGroups && Array.isArray(response.SecurityGroups) && response.SecurityGroups.length > 0) {
				return cb(null, helper.buildSecurityGroupsRecord({
					securityGroup: response.SecurityGroups[0],
					region: options.params.region
				}));
			}
			else {
				return cb(null, {});
			}
		});
	},

	/**
	 * List available security groups

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	list: function (options, cb) {
		const aws = options.infra.api;

		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {};
		if (options.params.ids) {
			params.GroupIds = options.params.ids;
		}
		ec2.describeSecurityGroups(params, (err, response) => {
			if (err) {
				return cb(err);
			}
			if (response && response.SecurityGroups && Array.isArray(response.SecurityGroups) && response.SecurityGroups.length > 0) {
				async.map(response.SecurityGroups, function (securityGroup, callback) {
					return callback(null, helper.buildSecurityGroupsRecord({
						securityGroup,
						region: options.params.region
					}));
				}, cb);
			}
			else {
				return cb(null, []);
			}
		});
	},

	/**
	 * Create a new security group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	create: function (options, cb) {
		const aws = options.infra.api;

		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {
			Description: options.params.description, /* required */
			GroupName: options.params.name, /* required */
			DryRun: false,
			VpcId: options.params.network
		};
		ec2.createSecurityGroup(params, (err, response) => {
			if (err) {
				return cb(err);
			}
			let inbound = {
				GroupId: response.GroupId,
				IpPermissions: []

			};
			let outbound = {
				GroupId: response.GroupId,
				IpPermissions: []
			};
			if (options.params.ports) {
				let IpPermissions = securityGroups.computeSecurityGroupPorts(options.params.ports);
				inbound.IpPermissions = IpPermissions.inbound.IpPermissions;
				outbound.IpPermissions = IpPermissions.outbound.IpPermissions;
			}
			async.parallel({
				inbound: function (callback) {
					if (inbound.IpPermissions.length > 0) {
						ec2.authorizeSecurityGroupIngress(inbound, callback);
					}
					else {
						callback();
					}
				},
				outbound: function (callback) {
					if (outbound.IpPermissions.length > 0) {
						ec2.authorizeSecurityGroupEgress(outbound, callback);
					}
					else {
						callback();
					}
				}
			}, cb);
		});
	},

	/**
	 * Update a security group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	update: function (options, cb) {
		const aws = options.infra.api;

		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {
			GroupIds: [options.params.id]
		};
		let inbound = {
			GroupId: options.params.id,
			IpPermissions: []

		};
		let outbound = {
			GroupId: options.params.id,
			IpPermissions: []
		};
		ec2.describeSecurityGroups(params, (err, response) => {
			if (err) return cb(err);

			if (response && response.SecurityGroups && Array.isArray(response.SecurityGroups) && response.SecurityGroups.length > 0) {
				async.series({
					delete: (minCb) => {
						let oneSG = response.SecurityGroups[0];
						if (oneSG.IpPermissions && oneSG.IpPermissions.length > 0) {
							stripIps(oneSG.IpPermissions);
						}
						if (oneSG.IpPermissionsEgress && oneSG.IpPermissionsEgress.length > 0) {
							stripIps(oneSG.IpPermissionsEgress);
						}
						let Ingress = {
							GroupId: oneSG.GroupId,
							IpPermissions: oneSG.IpPermissions
						};
						let Egress = {
							GroupId: oneSG.GroupId,
							IpPermissions: oneSG.IpPermissionsEgress
						};
						async.parallel({
							inbound: function (call) {
								if (Ingress.IpPermissions.length > 0) {
									ec2.revokeSecurityGroupIngress(Ingress, call);
								}
								else {
									call();
								}
							},
							outbound: function (call) {
								if (Egress.IpPermissions.length > 0) {
									ec2.revokeSecurityGroupEgress(Egress, call);
								}
								else {
									call();
								}
							}
						}, minCb)
					},
					create: (minCb) => {
						if (options.params.ports) {
							let IpPermissions = securityGroups.computeSecurityGroupPorts(options.params.ports);
							inbound.IpPermissions = IpPermissions.inbound.IpPermissions;
							outbound.IpPermissions = IpPermissions.outbound.IpPermissions;
						}
						async.parallel({
							inbound: function (call) {
								if (inbound.IpPermissions.length > 0) {
									ec2.authorizeSecurityGroupIngress(inbound, call);
								}
								else {
									call();
								}
							},
							outbound: function (call) {
								if (outbound.IpPermissions.length > 0) {
									ec2.authorizeSecurityGroupEgress(outbound, call);
								}
								else {
									call();
								}
							}
						}, minCb);
					}
				}, cb);
			}
			else {
				return cb(new Error("Security Group not Found"));
			}
		});

		function stripIps(oneSG) {
			oneSG.forEach((ip) => {
				if (ip.PrefixListIds && ip.PrefixListIds.length === 0) {
					delete ip.PrefixListIds;
				}
				if (ip.IpRanges && ip.IpRanges.length === 0) {
					delete ip.IpRanges;
				}
				if (ip.Ipv6Ranges && ip.Ipv6Ranges.length === 0) {
					delete ip.Ipv6Ranges;
				}
				if (ip.UserIdGroupPairs && ip.UserIdGroupPairs.length === 0) {
					delete ip.UserIdGroupPairs;
				}
			});
		}
	},

	/**
	 * Delete a security group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	delete: function (options, cb) {
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {
			GroupId: options.params.id, /* required */
			DryRun: false,
		};
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#deleteSecurityGroup-property
		ec2.deleteSecurityGroup(params, cb);
	},

	computeSecurityGroupPorts: function (ports) {
		let inbound = {
			IpPermissions: []

		};
		let outbound = {
			IpPermissions: []
		};
		if (ports) {
			ports.forEach((onePort) => {
				let port = {
					FromPort: onePort.published,
					IpProtocol: (onePort.protocol === "*") ? '-1' : onePort.protocol.toLowerCase(),
					ToPort: onePort.range
				};
				if (!onePort.range) {
					port.ToPort = onePort.published;
				}
				else {
					port.ToPort = onePort.range
				}
				if (onePort.source && onePort.source.length > 0) {
					port.IpRanges = [];
					onePort.source.forEach((v4) => {
						port.IpRanges.push({
							CidrIp: v4
						});
					});
				}
				if (onePort.ipv6 && onePort.ipv6.length > 0) {
					port.Ipv6Ranges = [];
					onePort.ipv6.forEach((v6) => {
						port.Ipv6Ranges.push({
							CidrIpv6: v6
						});
					});
				}
				if(onePort.securityGroups && onePort.securityGroups.length > 0) {
					port.UserIdGroupPairs = [];
					onePort.securityGroups.forEach((sg) => {
						port.UserIdGroupPairs.push({
							GroupId: sg
						});
					});
				}
				if (onePort.direction === "inbound") {
					inbound.IpPermissions.push(port);
				}
				else if (onePort.direction === "outbound") {
					outbound.IpPermissions.push(port);
				}
			});
		}
		return {inbound, outbound}
	},

	/**
	 * Update security group based on the ports found in the catalog recipe

	 * @param  {object}   options  The list of ports
	 * @param  {object}   cb  The list of ports
	 * @return {void}
	 */
	syncPortsFromCatalogRecipe: function (options, cb) {
		/**
		 * options.params
		 *                  .securityGroups
		 *                  .ports
		 *                  .region
		 *
		 * inspect security groups selected (only one for azure)
		 * update the ports based on the catalog recipe
		 * update security groups
		 */
		const aws = options.infra.api;

		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let vpc = false;

		function getSecurityGroups(callback) {
			if (!options || !options.params || !options.params.ports || !Array.isArray(options.params.ports) || options.params.ports.length === 0) {
				return callback(null, []);
			}

			let getOptions = Object.assign({}, options);

			if (!options.params || !options.params.securityGroups || !Array.isArray(options.params.securityGroups) || options.params.securityGroups.length === 0) {
				getVMS((err, response) => {
					if (err) {
						return callback(err);
					}

					let sG = [];
					if (response && response.Reservations && response.Reservations[0] && response.Reservations[0].Instances && response.Reservations[0].Instances.length > 0) {
						async.each(response.Reservations, (oneReservation, rCB) => {
							async.each(oneReservation.Instances, (oneInstance, iCB) => {
								async.each(oneInstance.SecurityGroups, (group, gCB) => {
									sG.push(group.GroupId);
									return gCB();
								}, iCB)
							}, (err, result) => {
								sG = sG.concat(result);
								return rCB()
							});
						}, () => {
							getOptions.params = {
								region: options.params.region,
								ids: options.params.securityGroups,
							};
							securityGroups.list(getOptions, callback);
						});
					}
					else {
						return callback(new Error("Invalid Virtual Machines!"));
					}
				});
			}
			else {
				getOptions.params = {
					region: options.params.region,
					ids: options.params.securityGroups,
				};
				securityGroups.list(getOptions, callback);
			}
		}

		function computePorts(result, callback) {

			let catalogPorts = options.params.ports || [];

			async.map(result.getSecurityGroups, (oneSecurityGroup, mapCallback) => {
				let sgPorts = oneSecurityGroup.ports || [];

				async.concat(catalogPorts, (oneCatalogPort, concatCallback) => {
					async.detect(sgPorts, (oneSgPort, detectCallback) => {
						if (oneSgPort.isPublished === oneCatalogPort.isPublished && oneSgPort.access === 'allow' && oneSgPort.direction === 'inbound' && !oneSgPort.readonly) {
							if (oneSgPort.published && typeof oneSgPort.published === 'string') {
								if(oneSgPort.published.indexOf("-") !== -1 && oneSgPort.published.split(' - ').length > 0){
									let target = parseInt(oneSgPort.published.split(' - ')[0]);
									let range = oneSgPort.published.split(' - ')[1] ? parseInt(oneSgPort.published.split(' - ')[1]) : null;

									if (oneCatalogPort.target >= target && oneCatalogPort.target <= range) {
										return detectCallback(null, true);
									}
								}
								else if(parseInt(oneSgPort.published) === parseInt(oneCatalogPort.target)){
									return detectCallback(null, true);
								}
							}
						}

						return detectCallback(null, false);
					}, (error, foundPort) => {

						if (foundPort) {
							return concatCallback(null, []);
						}
						let port = {
							FromPort: oneCatalogPort.target,
							IpProtocol: "tcp",
							ToPort: oneCatalogPort.target,
							vpc: !oneCatalogPort.isPublished
						};
						vpc = !oneCatalogPort.isPublished;
						if (oneCatalogPort.name) {
							let supportedProtocols = config.ipProtocolNumbers.concat(config.ipProtocols);
							if (supportedProtocols.indexOf(oneCatalogPort.name.toLowerCase()) !== -1) {
								port.IpProtocol = oneCatalogPort.name.toLowerCase();
							}
							else if (oneCatalogPort.name === "*") {
								port.IpProtocol = -1;
							}
							else {
								port.IpProtocol = "tcp";
							}
						}
						else {
							port.IpProtocol = "tcp"
						}

						return concatCallback(null, [port]);
					});
				}, (error, portsUpdates) => {
					//no error to be handled
					oneSecurityGroup.portsUpdates = portsUpdates;
					return mapCallback(null, oneSecurityGroup);
				});
			}, callback);
		}

		function getVpc(result, callback) {
			if (!result.getSecurityGroups || !Array.isArray(result.getSecurityGroups) || result.getSecurityGroups.length === 0) {
				if (options.params.securityGroups && Array.isArray(options.params.securityGroups) && options.params.securityGroups.length > 0) {
					return callback(new Error(`Security Groups: ${options.params.securityGroups.join(' - ')} not found!`));
				}
				else {
					options.soajs.log.warn("No security groups provided!");
					return callback(null, []);
				}
			}
			ec2.describeVpcs({
				VpcIds: [result.getSecurityGroups[0].networkId]
			}, callback);
		}

		function updateSecurityGroups(result, callback) {

			if (!result.computePorts || !Array.isArray(result.computePorts) || result.computePorts.length === 0) {
				return callback(null, true);
			}

			async.each(result.computePorts, (oneSecurityGroup, eachCallback) => {
				if (!oneSecurityGroup.portsUpdates || oneSecurityGroup.portsUpdates.length === 0) {
					return eachCallback(null, true);
				}

				async.each(oneSecurityGroup.portsUpdates, (onePort, internalCallback) => {
					if(onePort && onePort.vpc) {
						onePort.IpRanges= [
							{
								CidrIp: result.getVpc.Vpcs[0].CidrBlock,
								Description: "Internal Network only"
							}
						];
					}
					else {
						onePort.IpRanges = [{
							CidrIp: "0.0.0.0/0",
							Description: "Anywhere Ipv4"
						}];
						onePort.Ipv6Ranges = [{
							CidrIpv6: "::/0",
							Description: "Anywhere Ipv6"
						}];
					}

					delete onePort.vpc;

					let params = {
						GroupId: oneSecurityGroup.id,
						IpPermissions: [ onePort ]
					};
					return ec2.authorizeSecurityGroupIngress(params, internalCallback);
				}, eachCallback);
			}, callback);
		}

		function getVMS (callback){
			let params = null;
			if(options.params && options.params.vms){
				if (Array.isArray( options.params.vms) &&  options.params.vms.length > 0){
					params = {
						Filters: [
							{
								Name: 'tag:Name',
								Values: options.params.vms
							}
						]
					};
				}
				else if (typeof  options.params.vms === 'string'){
					params = {
						Filters: [
							{
								Name: 'tag:Name',
								Values: [options.params.vms]
							}
						]
					};
				}
			}

			if(!params) {
				return callback(new Error("Vms not found!"));
			}

			//describe instances using instanceIds = options.params.vms
			ec2.describeInstances({
				InstanceIds: [
					options.params.vms
				]
			}, (err, response) => {
				if (err || !response || !response.Reservations || response.Reservations.length === 0 || !response.Reservations[0].Instances || response.Reservations[0].Instances.length === 0) {

					//if nothing was found describe instances using filters generated via params
					ec2.describeInstances(params, callback);
				}
				else {
					return callback(err, response);
				}
			});
		}

		async.auto({
			getSecurityGroups,
			getVpc: ['getSecurityGroups', getVpc],
			computePorts: ['getSecurityGroups', 'getVpc', computePorts],
			updateSecurityGroups: ['getVpc', updateSecurityGroups]
		}, cb);
	}
};

module.exports = securityGroups;
