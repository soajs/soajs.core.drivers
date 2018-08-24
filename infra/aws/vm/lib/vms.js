'use strict';

const async = require('async');
const utils = require('../../utils/utils.js');
const helper = require('../../utils/helper.js');
const config = require("../../config");
const index = require('../../index.js')

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
						return helper.buildVMRecord({
							vm: results.vms.Reservations[0].Instances[0],
							images: response.getImage ? response.getImage.Images : null,
							securityGroups: response.getSecurityGroup ? response.getSecurityGroup.SecurityGroups : null,
							volumes: response.getVolumes ? response.getVolumes.Volumes : null,
							lb: results.lb,
							region: options.params.region
						}, cb);
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
		/**
		 * index.getRegions will be replaced later with regions params coming from the user
		 *
		 * 1. get the regions needed
		 * 2. async call all regions to get all vm in each region ( 12 calls at max)
		 *      * The variables are dynamically created to lessen error effects
		 * 3. get data (security groups, volumes, images) for each region.
		 * 4. call aws and get the specified security groups, volumes, images, and all load balancers ( 4 calls per region, 12 * 4 at max, 0 at min)
		 *      * This call is done in parallel to all regions as soon as [describeInstances] is done for each region
		 *      * This call does not wait all describeInstances to finish
		 *      * If a region have no vm allocated to it, this call is skipped
		 * 5. compute the vm record
		 */
		const aws = options.infra.api;
		let record = [];
		index.getRegions({}, (err, response) => {
			let awsObject = {};
			async.each(response.regions, function (region, mainCB) {
				awsObject["ec2" + region.v] = getConnector({
					api: 'ec2',
					region: region.v,
					keyId: aws.keyId,
					secretAccessKey: aws.secretAccessKey
				});
				awsObject["elb" + region.v] = getConnector({
					api: 'elb',
					region: region.v,
					keyId: aws.keyId,
					secretAccessKey: aws.secretAccessKey
				});
				
				awsObject["ec2" + region.v].describeInstances({}, (err, reservations) => {
					if (reservations && reservations.Reservations && reservations.Reservations.length > 0) {
						let opts = {
							GroupIds: [], ImageIds: [], VolumeIds: []
						};
						extractData(reservations.Reservations, opts, () => {
							opts.ec2 = awsObject["ec2" + region.v];
							opts.elb = awsObject["elb" + region.v];
							getVolumesImagesSgroupsElb(opts, (err, results) => {
								async.each(reservations.Reservations, function (reservation, rCB) {
									async.map(reservation.Instances, function (vm, iCB) {
										helper.buildVMRecord({
											vm,
											images: results.getImage ? results.getImage.Images : null,
											securityGroups: results.getSecurityGroup ? results.getSecurityGroup.SecurityGroups : null,
											volumes: results.getVolumes ? results.getVolumes.Volumes : null,
											lb: results.getElb ? results.getElb.LoadBalancerDescriptions : null,
											region: region.v
										}, iCB);
									}, function (err, final) {
										record = record.concat(final);
										return rCB(err, true);
									});
								}, mainCB);
							});
						});
					}
					else {
						mainCB();
					}
				});
			}, (err) => {
				if(err){
					return cb(err);
				}
				return cb(err, record);
			});
		});
		
		function getVolumesImagesSgroupsElb(opts, cb) {
			async.parallel({
				getImage: function (callback) {
					if (opts.ImageIds.length > 0) {
						opts.ec2.describeImages({ImageIds: opts.ImageIds}, callback)
					}
					else {
						return callback(null, null);
					}
				},
				getSecurityGroup: function (callback) {
					if (opts.GroupIds.length > 0) {
						opts.ec2.describeSecurityGroups({GroupIds: opts.GroupIds}, callback)
					}
					else {
						return callback(null, null);
					}
				},
				getVolumes: function (callback) {
					if (opts.VolumeIds.length > 0) {
						opts.ec2.describeVolumes({VolumeIds: opts.VolumeIds}, callback)
					}
					else {
						return callback(null, null);
					}
				},
				getElb: function (callback) {
					opts.elb.describeLoadBalancers({}, callback)
				}
			}, cb);
		}
		
		function extractData(reservations, opts, cb) {
			async.each(reservations, function (oneReservation, mainCB) {
				if (oneReservation.Instances && oneReservation.Instances.length > 0) {
					async.each(oneReservation.Instances, function (oneInstance, miniCb) {
						if (oneInstance.ImageId && opts.ImageIds.indexOf(oneInstance.ImageId) === -1) {
							opts.ImageIds.push(oneInstance.ImageId);
						}
						async.parallel({
							SecurityGroups: function (callback) {
								if (oneInstance.SecurityGroups && oneInstance.SecurityGroups.length) {
									async.each(oneInstance.SecurityGroups, function (oneSG, call) {
										opts.GroupIds.push(oneSG.GroupId);
										call();
									}, callback);
								}
								
							},
							BlockDeviceMappings: function (callback) {
								if (oneInstance.SecurityGroups && oneInstance.SecurityGroups.length) {
									async.each(oneInstance.BlockDeviceMappings, function (block, call) {
										opts.VolumeIds.push(block.Ebs.VolumeId);
										call();
									}, callback);
								}
								else {
									callback();
								}
							}
						}, miniCb);
					}, mainCB);
				}
				else {
					mainCB();
				}
			}, cb);
		}
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
				return cb(null, {});
			}
		});
	}
};

module.exports = vms;
