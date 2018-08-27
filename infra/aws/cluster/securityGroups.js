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
		ec2.describeSecurityGroups({}, (err, response) => {
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
				inbound.IpPermissions = IpPermissions.inbound;
				outbound.IpPermissions = IpPermissions.outbound;
			}
			async.parallel({
				inbound: function (callback) {
					if (inbound.IpPermissions > 0) {
						ec2.authorizeSecurityGroupIngress(inbound, callback);
					}
					else {
						callback();
					}
				},
				outbound: function (callback) {
					if (outbound.IpPermissions > 0) {
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
			GroupId: options.params.id,
		};
		let inbound = {
			GroupId: response.GroupId,
			IpPermissions: []
			
		};
		let outbound = {
			GroupId: response.GroupId,
			IpPermissions: []
		};
		ec2.describeSecurityGroups(params, (err, response) => {
			if (response && response.SecurityGroups && Array.isArray(response.SecurityGroups) && response.SecurityGroups.length > 0) {
				async.series({
					delete: (minCb) => {
						let oneSG = data.SecurityGroups[0];
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
								ec2.revokeSecurityGroupIngress(Ingress, call);
							},
							outbound: function (call) {
								ec2.revokeSecurityGroupEgress(Egress, call);
							}
						}, minCb)
					},
					create: (minCb) => {
						if (options.params.ports) {
							let IpPermissions = securityGroups.computeSecurityGroupPorts(options.params.ports);
							inbound.IpPermissions = IpPermissions.inbound;
							outbound.IpPermissions = IpPermissions.outbound;
						}
						async.parallel({
							inbound: function (call) {
								if (inbound.pPermissions > 0) {
									ec2.authorizeSecurityGroupIngress(inbound, call);
								}
								else {
									call();
								}
							},
							outbound: function (call) {
								if (inbound.pPermissions > 0) {
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
				return cb(null, new Error("Security Group not Found"));
			}
		});
		
		function stripIps(oneSG) {
			oneSG.forEach((ip) => {
				if (ip.PrefixListIds && ip.PrefixListIds.length === 0) {
					delete ip.PrefixListIds;
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
			GroupId: options.params.securityGroup, /* required */
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
					IpProtocol: onePort.protocol,
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
				if (onePort.direction === "inbound") {
					inbound.IpPermissions.push(port);
				}
				else if (onePort.direction === "outbound") {
					outbound.IpPermissions.push(port);
				}
			});
		}
		return {inbound, outbound}
	}
};

module.exports = securityGroups;
