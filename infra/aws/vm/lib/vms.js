'use strict';

const async = require('async');
const utils = require('../../utils/utils.js');
const helper = require('../../utils/helper.js');
const config = require("../../config");
const index = require('../../index.js');
const hash = require('object-hash');
const network = require("../../cluster/networks");

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
			let sParams = {
				SubnetIds: []
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
				sParams.SubnetIds.push(results.vms.Reservations[0].Instances[0].SubnetId);
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
					},
					getSubnets: function (callback) {
						if (sParams.SubnetIds.length > 0) {
							ec2.describeSubnets(sParams, callback)
						}
						else {
							return callback(null, null);
						}
					},
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
							lb: response.getElb ? response.getElb.LoadBalancerDescriptions : null,
							subnet: response.getSubnets ? response.getSubnets.Subnets : null,
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
		 * region is required
		 * network is optional
		 * 1. get data (security groups, volumes, images) .
		 * 2. call aws and get the specified security groups, volumes, images, and all loadBalancers
		 * 3. compute the vm record
		 */
		const aws = options.infra.api;
		let record = [];
		
		let awsObject = {};
		let region = options.params.region;
		
		awsObject['ec2'] = getConnector({
			api: 'ec2',
			region: region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		awsObject['elb'] = getConnector({
			api: 'elb',
			region: region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		awsObject['iam'] = getConnector({
			api: 'iam',
			region: region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		
		getNetworkIdFromName(options, (error, networkToUse) =>{
			if(error){
				return cb(error);
			}
			
			let params = {};
			if (options.params.network) {
				params.Filters = [
					{
						Name: 'vpc-id',
						Values: [
							//options.params.network // i need the id not the name !
							networkToUse.id
						]
					},
				]
			}
			if (options.params && options.params.ids && Array.isArray(options.params.ids) && options.params.ids.length > 0) {
				params.InstanceIds = options.params.ids;
			}
			awsObject['ec2'].describeInstances(params, (err, reservations) => {
				if (err) {
					return cb(err);
				}
				if (reservations && reservations.Reservations && reservations.Reservations.length > 0) {
					let opts = {
						GroupIds: [], ImageIds: [], VolumeIds: [], SubnetIds: [], roles: []
					};
					
					extractData(reservations.Reservations, opts, () => {
						opts.ec2 = awsObject["ec2"];
						opts.elb = awsObject["elb"];
						opts.iam = awsObject["iam"];
						getVolumesImagesSgroupsElb(opts, (err, results) => {
							if (err) {
								return cb(err);
							}
							async.each(reservations.Reservations, function (reservation, rCB) {
								async.concat(reservation.Instances, function (vm, iCB) {
									if (vm.State && vm.State.Name === "terminated" || vm.State.Name === "shutting-down") {
										return iCB(null, []);
									}
									if (vm.Tags && vm.Tags.length > 0) {
										let container = false;
										for (let i = 0; i < vm.Tags.length; i++) {
											if (vm.Tags[i].Key === "soajs.infra.container") {
												container = true;
												break;
											}
										}
										if (container) return iCB(null, []);
									}
									if (!vm.IamInstanceProfile || !vm.IamInstanceProfile.Arn) {
										return iCB(null, []);
									}
									helper.buildVMRecord({
										vm,
										images: results.getImage ? results.getImage.Images : null,
										securityGroups: results.getSecurityGroup ? results.getSecurityGroup.SecurityGroups : null,
										volumes: results.getVolumes ? results.getVolumes.Volumes : null,
										lb: results.getElb ? results.getElb.LoadBalancerDescriptions : null,
										subnet: results.getSubnets ? results.getSubnets.Subnets : null,
										region: region,
										roles: results.checkRoles,
										connection: results.checkConnection
									}, (err, res) => {
										return iCB(err, [res]);
									});
								}, function (err, final) {
									if (final.length > 0) {
										record = record.concat(final);
									}
									return rCB(err, true);
								});
							}, (err)=>{
								if(err){
									return cb(err);
								}
								return cb(null, record);
							});
						});
					});
				}
				else {
					cb();
				}
			});
		});
		
		function getNetworkIdFromName(options, cb){
			let originalNetworkName = options.params.network;
			network.list(options, (error, response) => {
				if(error){
					return cb(error);
				}
				options.params.network = originalNetworkName;
				
				let data;
				// console.log(response);
				response.forEach((oneNetwork) => {
					if(oneNetwork.name === options.params.network){
						data = oneNetwork;
					}
					else if(oneNetwork.id === options.params.network){
						data = oneNetwork;
					}
				});
				
				return cb(null, data);
			});
		}
		
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
				getSubnets: function (callback) {
					if (opts.SubnetIds.length > 0) {
						opts.ec2.describeSubnets({SubnetIds: opts.SubnetIds}, callback)
					}
					else {
						return callback(null, null);
					}
				},
				checkConnection: function (callback) {
					opts.ec2.describeInternetGateways({}, callback)
				},
				getElb: function (callback) {
					opts.elb.describeLoadBalancers({}, callback)
				},
				checkRoles: function (callback) {
					async.concat(opts.roles, (oneRole, call) => {
						opts.iam.listAttachedRolePolicies({
							RoleName: oneRole
						}, (err, res) => {
							return call(null, [{
								[oneRole]: res ? res : null
							}]);
						})
					}, callback);
				}
			}, cb);
		}
		
		function extractData(reservations, opts, cb) {
			async.each(reservations, function (oneReservation, mainCB) {
				if (oneReservation.Instances && oneReservation.Instances.length > 0) {
					async.each(oneReservation.Instances, function (oneInstance, miniCb) {
						if (oneInstance.State && oneInstance.State.Name === "terminated" || oneInstance.State.Name === "shutting-down") {
							return mainCB();
						}
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
								else {
									callback();
								}
							},
							BlockDeviceMappings: function (callback) {
								if (oneInstance.BlockDeviceMappings && oneInstance.BlockDeviceMappings.length) {
									async.each(oneInstance.BlockDeviceMappings, function (block, call) {
										opts.VolumeIds.push(block.Ebs.VolumeId);
										call();
									}, callback);
								}
								else {
									callback();
								}
							},
							Subnets: function (callback) {
								if (oneInstance.SubnetId) {
									opts.SubnetIds.push(oneInstance.SubnetId);
									return callback();
								}
								else {
									callback();
								}
							},
							roles: function (callback) {
								if (oneInstance.IamInstanceProfile && oneInstance.IamInstanceProfile.Arn) {
									let arn = oneInstance.IamInstanceProfile.Arn.split("/");
									if (!opts.roles.includes(arn[arn.length - 1])) {
										opts.roles.push(arn[arn.length - 1]);
									}
									return callback();
								}
								else {
									callback();
								}
							},
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
		vms.list(options, (err, result) => {
			if (err) {
				return cb(err);
			}
			async.series({
				'validateVm': (iCb) => {
					let images = [];
					let valid = true;
					if (options.params.release) {
						return iCb();
					}
					async.forEach(result, (oneVm, lCb) => {
						if (!oneVm.executeCommand) {
							valid = false;
							return lCb(new Error('We are unable to onBoard your VM Layer because we do not have the ability to deploy in it. ' +
								'This might be caused from insufficient access rights to one or more of the Virtual machines or the VM Layer do not have access public internet.'));
						}
						if (oneVm.tasks[0] && oneVm.tasks[0].ref && oneVm.tasks[0].ref.os) {
							let image = hash(oneVm.tasks[0].ref.os);
							if (images.length === 0) {
								images.push(image);
							}
							else {
								valid = images.indexOf(image) !== -1;
								images.push(image);
							}
						}
						else {
							valid = false;
						}
						
						if (!valid) {
							return lCb(new Error('We are unable to onBoard your VM Layer because we detected a mismatch between the Operating Systems of the Virtual Machine Instance.'));
						}
						return lCb();
					}, iCb)
				},
				'updateTags': (iCb) => {
					async.forEach(result, (vmInfo, mCb) => {
						let tags = [
							{'Key': 'soajs.env.code', 'Value': options.params.env},
							{'Key': 'soajs.layer.name', 'Value': options.params.layerName},
							{'Key': 'soajs.network.name', 'Value': vmInfo.network},
							{'Key': 'soajs.onBoard', 'Value': 'true'}];
						
						if (options.params.release) {
							let dParams = {
								Resources: options.params.ids,
								Tags: tags
							};
							ec2.deleteTags(dParams, mCb);
						}
						else {
							let aParams = {
								Resources: options.params.ids,
								Tags: tags
							};
							ec2.createTags(aParams, mCb);
						}
					}, iCb)
				}
			}, cb);
		})
	}
};

module.exports = vms;
