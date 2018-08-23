'use strict';

const async = require('async');
const utils = require('../../../../lib/utils/utils.js');
const helper = require('../../utils/helper.js');
const config = require("../../config");
function getConnector(opts) {
	return utils.getConnector(opts, config);
}

const vms = {
	
	/**
	 * Get information about deployed vitual machine
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	inspect: function (options, cb) {
		const aws = options.infra.api;
		
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		const elb = getConnector({
			api: 'elb',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		async.parallel({
			lb: function (callback) {
				elb.describeLoadBalancers({}, callback)
			},
			vms: function (callback) {
				ec2.describeInstances({
					InstanceIds: [
						options.params.vmName
					]
				}, callback)
			}
		}, function (err, results) {
			let sgParams = {
				GroupIds: []
			};
			let iParams = {
				ImageIds: []
			};
			let vParams = {
				VolumeIds: []
			};
			if (results.vms && results.vms.Reservations
				&& results.vms.Reservations.length > 0
				&& results.vms.Reservations[0].Instances
				&& results.vms.Reservations[0].Instances.length > 0) {
				if (results.vms.Reservations[0].Instances[0].ImageId) {
					iParams.ImageIds.push(results.vms.Reservations[0].Instances[0].ImageId);
				}
				if (results.vms.Reservations[0].Instances[0].SecurityGroups) {
					results.vms.Reservations[0].Instances[0].SecurityGroups.forEach((oneSG) => {
						if (oneSG.GroupId && sgParams.GroupIds.indexOf(oneSG.GroupId) === -1) {
							sgParams.GroupIds.push(oneSG.GroupId)
						}
					});
				}
				if (results.vms.Reservations[0].Instances[0].ImageId) {
					iParams.ImageIds.push(results.vms.Reservations[0].Instances[0].ImageId);
				}
				results.vms.Reservations[0].Instances[0].BlockDeviceMappings.forEach((block) => {
					if (block.Ebs && block.Ebs && block.Ebs.VolumeId && vParams.VolumeIds.indexOf(block.Ebs.VolumeId) === -1) {
						vParams.VolumeIds.push(block.Ebs.VolumeId);
					}
				});
				
				async.parallel({
					getImage: function (callback) {
						if (iParams.ImageIds.length > 0) {
							ec2.describeImages(iParams, callback)
						}
						else {
							return callback(null, true);
						}
					},
					getSecurityGroup: function (callback) {
						if (sgParams.GroupIds.length > 0) {
							ec2.describeSecurityGroups(sgParams, callback)
						}
						else {
							return callback(null, true);
						}
					},
					getVolumes: function (callback) {
						if (vParams.VolumeIds.length > 0) {
							ec2.describeVolumes(vParams, callback)
						}
						else {
							return callback(null, true);
						}
					}
				}, (err, response) => {
					if (err) {
						return cb(err);
					}
					else {
						return cb(null, helper.buildVMRecord({
							vm: results.vms.Reservations[0].Instances[0],
							images: response.getImage ? response.getImage.Images : null,
							securityGroups: response.getSecurityGroup ? response.getSecurityGroup.SecurityGroups : null,
							volumes: response.getVolumes ? response.getVolumes.Volumes : null,
							lb: results.lb,
							region: options.params.region
						}));
					}
				});
			}
			else {
				return cb(null, []);
			}
		});
	},
	
	/**
	 * List available virtual machines by subscription
	 
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
		const elb = getConnector({
			api: 'elb',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let record = [];
		async.parallel({
			lb: function (callback) {
				elb.describeLoadBalancers({}, callback)
			},
			vms: function (callback) {
				ec2.describeInstances({}, callback)
			}
		}, function (err, results) {
			let sgParams = {
				GroupIds: []
			};
			let iParams = {
				ImageIds: []
			};
			let vParams = {
				VolumeIds: []
			};
			if (results.vms) {
				if (results.vms.Reservations) {
					results.vms.Reservations.forEach((oneRes) => {
						if (oneRes.Instances) {
							oneRes.Instances.forEach((oneInstance) => {
								if (oneInstance.ImageId && iParams.ImageIds.indexOf(oneInstance.ImageId) === -1) {
									iParams.ImageIds.push(oneInstance.ImageId);
								}
								oneInstance.SecurityGroups.forEach((oneSG) => {
									if (oneSG.GroupId && sgParams.GroupIds.indexOf(oneSG.GroupId) === -1) {
										sgParams.GroupIds.push(oneSG.GroupId)
									}
								});
								oneInstance.BlockDeviceMappings.forEach((block) => {
									if (block.Ebs && block.Ebs && block.Ebs.VolumeId && vParams.VolumeIds.indexOf(block.Ebs.VolumeId) === -1) {
										vParams.VolumeIds.push(block.Ebs.VolumeId);
									}
								});
							});
						}
					});
				}
				
				async.parallel({
					getImage: function (callback) {
						if (iParams.ImageIds.length > 0) {
							ec2.describeImages(iParams, callback)
						}
						else {
							return callback(null, true);
						}
					},
					getSecurityGroup: function (callback) {
						if (sgParams.GroupIds.length > 0) {
							ec2.describeSecurityGroups(sgParams, callback)
						}
						else {
							return callback(null, true);
						}
					},
					getVolumes: function (callback) {
						if (vParams.VolumeIds.length > 0) {
							ec2.describeVolumes(vParams, callback)
						}
						else {
							return callback(null, true);
						}
					}
				}, (err, response) => {
					if (err) {
						return cb(err);
					}
					else {
						async.each(results.vms.Reservations, function (reservation, rCB) {
							async.map(reservation.Instances, function (vm, iCB) {
								return iCB(null, helper.buildVMRecord({
									vm,
									images: response.getImage ? response.getImage.Images : null,
									securityGroups: response.getSecurityGroup ? response.getSecurityGroup.SecurityGroups : null,
									volumes: response.getVolumes ? response.getVolumes.Volumes : null,
									lb: results.lb,
									region: options.params.region
								}));
							}, function (err, final) {
								record = record.concat(final);
								return rCB(null, true);
							});
						}, function (err) {
							if (err) {
								return cb(err);
							}
							return cb(null, record);
						});
					}
				});
			}
			else {
				return cb(null, []);
			}
		});
	},
	
	/**
	 * Update labels of one or more vm instances
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	updateVmLabels: function (options, cb) {
		const aws = options.infra.api;
		
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {
			InstanceIds: [
				options.params.vmName
			]
		};
		ec2.describeInstances(params, function (err, result) {
			if (err) {
				return cb(err);
			}
			let toBeDeleted = [];
			let toBeAdded = [];
			let newTags = [];
			let tags;
			if (result.Reservations && result.Reservations.length > 0
				&& result.Reservations[0].Instances && result.Reservations[0].Instances.length > 0) {
				tags = result.Reservations[0].Instances[0].Tags;
				
				if (options.params.labels) {
					for (let key in options.params.labels) {
						if (key && options.params.labels[key]) {
							newTags.push({
								Key: key,
								Value: options.params.labels[key]
							})
						}
					}
				}
				toBeDeleted = _.difference(tags, newTags);
				toBeAdded = _.difference(newTags, tags);
				async.parallel({
					modify: function (callback) {
						if (toBeAdded.length > 0) {
							let aParams = {
								Resources: [
									options.params.vmName
								],
								Tags: toBeAdded
							};
							ec2.createTags(aParams, callback);
						}
						else {
							return callback();
						}
					},
					delete: function (callback) {
						if (toBeDeleted.length > 0) {
							let dParams = {
								Resources: [
									"i-01e998eda187b9bfe"
								],
								Tags: toBeAdded
							};
							ec2.deleteTags(dParams, callback);
						}
						else {
							return callback();
						}
					}
				}, cb);
			}
			else {
				return cb (null, {});
			}
		});
	}
};

module.exports = vms;
