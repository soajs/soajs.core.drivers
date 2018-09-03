'use strict';

const async = require('async');
const utils = require("../utils/utils");
const helper = require('../utils/helper.js');
const subnetDriver = require('./subnets.js');
const _ = require('lodash');

const config = require("../config");

function getConnector(opts) {
	return utils.getConnector(opts, config);
}

const driver = {
	
	/**
	 * List available networks
	 
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
		
		ec2.describeVpcs({}, function (err, networks) {
			if (err) {
				return cb(err);
			}
			if (networks && networks.Vpcs && Array.isArray(networks.Vpcs) && networks.Vpcs.length > 0) {
				async.map(networks.Vpcs, function (network, callback) {
					options.params.network = network.VpcId;
					async.parallel({
						internetGateway: (call) => {
							ec2.describeInternetGateways({
								Filters: [
									{
										Name: "attachment.vpc-id",
										Values: [
											network.VpcId
										]
									}
								]
							}, call)
						},
						subnet: (call) => {
							subnetDriver.list(options, call);
						}
					}, (err, result) => {
						return callback(err, helper.buildNetworkRecord({
							network,
							region: options.params.region,
							subnets: result.subnet,
							attachInternetGateway: result.internetGateway
						}));
					});
					
				}, cb);
			}
			else {
				return cb(null, []);
			}
		});
	},
	
	/**
	 * Create a new network
	 
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
			CidrBlock: options.params.address, /* required */
			AmazonProvidedIpv6CidrBlock: options.params.ipv6Address || false,
			DryRun: false,
			InstanceTenancy: options.params.instanceTenancy || "default", // "host" || "dedicated" || "default"
		};
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#createVpc-property
		ec2.createVpc(params, function (err, response) {
			if (err) {
				return cb(err);
			}
			async.parallel({
				tags: function (callback) {
					if (options.params.name && response && response.Vpc && response.Vpc.VpcId) {
						params = {
							Resources: [
								response.Vpc.VpcId
							],
							Tags: [
								{
									Key: "Name",
									Value: options.params.name
								}
							]
						};
						ec2.createTags(params, function (err) {
							options.soajs.log.error(err);
							return callback(null, response);
						});
					}
					else {
						return callback(null, response);
					}
				},
				internetGateway: function (callback) {
					if (options.params.attachInternetGateway && response && response.Vpc && response.Vpc.VpcId){
						ec2.createInternetGateway({}, (err, gateway) => {
							if (err) {
								return callback(err);
							}
							else {
								ec2.attachInternetGateway({
									VpcId: response.Vpc.VpcId,
									InternetGatewayId: gateway.InternetGateway.InternetGatewayId
								}, callback);
							}
						});
					}
					else{
						return callback();
					}
				}
			}, cb);
		});
	},
	
	/**
	 * Update a network
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	update: function (options, cb) {
		//get the vpc
		//update tenancy to default
		//associate a new address
		//disassociate an address other than primary
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		
		async.parallel({
			vpc: function (callback) {
				ec2.describeVpcs({
					VpcIds: [
						options.params.id
					]
				}, callback)
			},
			subnets: function (callback) {
				ec2.describeSubnets({
					Filters: [
						{
							Name: "vpc-id",
							Values: [
								options.params.id
							]
						}
					]
				}, callback)
			},
			internetGateway: function (callback) {
				ec2.describeInternetGateways({
					Filters: [
						{
							Name: "attachment.vpc-id",
							Values: [
								options.params.id
							]
						}
					]
				}, callback)
			}
		}, function (err, results) {
			if (err) {
				return cb(err);
			}
			let networks = results.vpc;
			if (networks && networks.Vpcs && Array.isArray(networks.Vpcs) && networks.Vpcs.length > 0) {
				let network = networks.Vpcs[0];
				let cidR = [];
				let addresses = [];
				let addSubnets = [];
				let deleteSubnets = [];
				// get addresses without primary
				network.CidrBlockAssociationSet.forEach((oneCidR) => {
					if (oneCidR.CidrBlock !== network.CidrBlock) {
						cidR.push(oneCidR.CidrBlock);
					}
				});
				if (options.params && options.params.addresses) {
					options.params.addresses.forEach((oneAddress) => {
						if (oneAddress) {
							addresses.push((oneAddress.address));
						}
					});
				}
				async.parallel({
					address: function (callback) {
						if (addresses && Array.isArray(addresses) && addresses.length > 0) {
							//get primary address
							let primIndex = addresses.indexOf(network.CidrBlock);
							if (primIndex === -1) {
								return callback(new Error("Primary Network address can't be modified."));
							}
							else {
								addresses.splice(primIndex, 1);
								async.parallel({
									addedCidr: function (mini) {
										//associateVpcCidrBlock
										driver.addNetworkAddresses(ec2, options.params.id, _.difference(addresses, cidR), options.params.addresses, mini);
									},
									removedCidr: function (mini) {
										//disassociateAddress
										driver.removeNetworkAddresses(ec2, _.difference(cidR, options.params.address), network, options.params.addresses, mini);
									}
								}, callback);
							}
						}
						else {
							return callback(new Error("Invalid network address"));
						}
					},
					InstanceTenancy: function (callback) {
						if (options.params.instanceTenancy && options.params.instanceTenancy !== network.InstanceTenancy) {
							if (options.params.instanceTenancy === "default") {
								let params = {
									VpcId: options.params.id, /* required */
									InstanceTenancy: "default", /* required */
								};
								ec2.modifyVpcTenancy(params, callback);
							}
							else {
								return callback(new Error(`You cannot change the instance tenancy attribute to ${options.params.instanceTenancy}`));
							}
						}
						else {
							callback();
						}
					},
					subnet: function (callback) {
						async.parallel({
							add: function (mini) {
								async.each(options.params.subnets, (subnet, pcb) => {
									let found = false;
									async.each(results.subnets.Subnets, (oneSubnet, scb) => {
										if (oneSubnet.CidrBlock === subnet.address) {
											found = true;
										}
										scb();
									}, () => {
										if (!found) {
											let temp = {
												CidrBlock: subnet.address, /* required */
												VpcId: options.params.id, /* required */
											};
											if (subnet.availabilityZone) {
												temp.AvailabilityZone = subnet.availabilityZone;
											}
											addSubnets.push(temp);
										}
										pcb();
									});
								}, mini)
							},
							delete: function (mini) {
								async.each(results.subnets.Subnets, (oneSubnet, pcb) => {
									let found = false;
									async.each(options.params.subnets, (subnet, scb) => {
										if (oneSubnet.CidrBlock === subnet.address) {
											found = true;
										}
										scb();
									}, () => {
										if (!found) {
											deleteSubnets.push({
												SubnetId: oneSubnet.SubnetId,
											});
										}
										pcb();
									});
								}, mini)
							}
						}, () => {
							async.parallel({
								add: function (mini) {
									async.each(addSubnets, (params, pcb) => {
										ec2.createSubnet(params, pcb);
									}, mini)
								},
								delete: function (mini) {
									async.each(deleteSubnets, (params, miniCb) => {
										ec2.deleteSubnet(params, miniCb);
									}, mini)
								}
							}, callback);
						});
					},
					internetGateway: function (callback) {
						if (results.internetGateway && results.internetGateway.InternetGateways && results.internetGateway.InternetGateways.length > 0) {
							if (options.params.attachInternetGateway) {
								return callback();
							}
							else {
								ec2.detachInternetGateway({
									VpcId: options.params.id,
									InternetGatewayId: results.internetGateway.InternetGateways[0].InternetGatewayId
								}, (err) => {
									if (err) {
										return callback(err);
									}
									else {
										ec2.deleteInternetGateway({
											InternetGatewayId: results.internetGateway.InternetGateways[0].InternetGatewayId
										}, callback);
									}
								});
							}
						}
						else {
							if (options.params.attachInternetGateway) {
								ec2.createInternetGateway({}, (err, gateway) => {
									if (err) {
										return callback(err);
									}
									else {
										ec2.attachInternetGateway({
											VpcId: options.params.id,
											InternetGatewayId: gateway.InternetGateway.InternetGatewayId
										}, callback);
									}
								});
							}
							else {
								return callback();
							}
						}
					}
				}, cb);
			}
			else {
				return cb(new Error("Vpc network not found"));
			}
		});
	},
	
	/**
	 * Delete a network
	 
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
		
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#deleteVpc-property
		async.parallel({
			vpcs: (callback) => {
				ec2.describeVpcs({VpcIds: [options.params.id]}, callback)
			},
			subnets: (callback) => {
				ec2.describeSubnets({
					Filters: [
						{
							Name: "vpc-id",
							Values: [
								options.params.id
							]
						}
					]
				}, callback)
			},
			gatways: (callback) => {
				ec2.describeInternetGateways({
					Filters: [
						{
							Name: "attachment.vpc-id",
							Values: [
								options.params.id
							]
						}
					]
				}, callback)
			},
		}, (err, response) => {
			if (err) {
				return cb(err);
			}
			async.auto({
				deleteSubnets: (call) => {
					if (response && response.subnets && response.subnets.Subnets && Array.isArray(response.subnets.Subnets) && response.subnets.Subnets.length > 0) {
						async.each(response.subnets.Subnets, (oneSubnet, callback) => {
							ec2.deleteSubnet({SubnetId: oneSubnet.SubnetId}, callback);
						}, call);
					}
					else {
						return call();
					}
				},
				deleteInternetGateway: (call) => {
					if (response && response.gatways && response.gatways.InternetGateways && Array.isArray(response.gatways.InternetGateways) && response.gatways.InternetGateways.length > 0) {
						ec2.detachInternetGateway({
							InternetGatewayId: response.gatways.InternetGateways[0].InternetGatewayId,
							VpcId: options.params.id
						}, function (err) {
							if (err) {
								return call(err);
							}
							else {
								ec2.deleteInternetGateway({InternetGatewayId: response.gatways.InternetGateways[0].InternetGatewayId}, call);
							}
						});
						
					}
					else {
						return call();
					}
				},
				deleteVpc: ['deleteSubnets', 'deleteInternetGateway', (results, call) => {
					ec2.deleteVpc({VpcId: options.params.id}, call)
				}]
			}, cb);
		});
	},
	/**
	 * add multiple network addresses
	 * @param ec2
	 * @param network
	 * @param addresses
	 * @param list
	 * @param cb
	 */
	addNetworkAddresses: function (ec2, network, addresses, list, cb) {
		async.each(addresses, function (oneAddress, callback) {
			let params = {
				VpcId: network,
				CidrBlock: oneAddress
			};
			let found = _.find(list, {address: oneAddress});
			params.AmazonProvidedIpv6CidrBlock = found && found.ipv6 ? found.ipv6 : false;
			ec2.associateVpcCidrBlock(params, callback);
		}, cb);
	},
	/**
	 * remove multiple network addresses
	 * @param ec2
	 * @param addresses
	 * @param network
	 * @param list
	 * @param cb
	 */
	removeNetworkAddresses: function (ec2, addresses, network, list, cb) {
		async.each(addresses, function (oneAddress, callback) {
			async.each(network.CidrBlockAssociationSet, function (oneBlock, miniCB) {
				if (oneBlock.CidrBlock !== oneAddress) {
					return miniCB();
				}
				let params = {
					AssociationId: oneBlock.AssociationId
				};
				ec2.disassociateVpcCidrBlock(params, miniCB);
			}, callback);
		}, cb);
	},
	
};

module.exports = driver;
