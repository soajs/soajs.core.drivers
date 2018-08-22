'use strict';

const async = require('async');

const helper = {
	
	buildNetworkRecord: function (opts) {
		let record = {};
		if (opts.region) {
			record.region = opts.region;
		}
		
		if (opts.subnets) {
			record.subnets = opts.subnets;
		}
		
		if (opts.network) {
			if (opts.network.VpcId) {
				record.name = opts.network.VpcId;
				record.id = opts.network.VpcId;
			}
			if (opts.network.CidrBlock) {
				record.primaryAddress = opts.network.CidrBlock;
			}
			if (opts.network.InstanceTenancy) {
				record.instanceTenancy = opts.network.InstanceTenancy;
			}
			if (opts.network.IsDefault) {
				record.IsDefault = !!opts.network.IsDefault;
			}
			if (opts.network.State) {
				record.state = opts.network.State;
			}
			record.address = [];
			if (opts.network.CidrBlockAssociationSet
				&& Array.isArray(opts.network.CidrBlockAssociationSet)
				&& opts.network.CidrBlockAssociationSet.length > 0) {
				opts.network.CidrBlockAssociationSet.forEach((oneAddress) => {
					if (oneAddress && oneAddress.CidrBlock) {
						record.address.push(oneAddress.CidrBlock
						);
					}
				});
			}
			else {
				record.address.push(opts.network.CidrBlock);
			}
		}
		
		
		return record;
	},
	
	buildSubnetkRecord: function (opts) {
		let record = {};
		if (opts.subnet) {
			if (opts.subnet.SubnetId) {
				record.id = opts.subnet.SubnetId;
				record.name = opts.subnet.SubnetId;
			}
			if (opts.subnet.CidrBlock) {
				record.address = opts.subnet.CidrBlock;
			}
			if (opts.subnet.State) {
				record.state = opts.subnet.State;
			}
			if (opts.subnet.AvailabilityZone) {
				record.availabilityZone = opts.subnet.AvailabilityZone;
			}
		}
		return record;
	},
	
	buildClassicLbRecord: function (opts) {
		let record = {};
		record.type = "classic";
		record.region = opts.region;
		if (opts.lb) {
			if (opts.lb.LoadBalancerName) {
				record.id = opts.lb.LoadBalancerName;
				record.name = opts.lb.LoadBalancerName;
			}
			if (opts.lb.Scheme) {
				record.mode = opts.lb.Scheme;
			}
			if (opts.lb.VPCId) {
				record.networkId = opts.lb.VPCId;
			}
			if (opts.lb.DNSName) {
				record.domain = opts.lb.DNSName;
			}
			if (opts.lb.SecurityGroups) {
				record.securityGroupIds = opts.lb.SecurityGroups;
			}
			if (opts.lb.CreatedTime) {
				record.createdTime = opts.lb.CreatedTime;
			}
			if (opts.lb.HealthCheck) {
				record.healthProbe = {
					"healthProbePath": opts.lb.HealthCheck.Target,
					"healthProbeInterval": opts.lb.HealthCheck.Interval,
					"healthProbeTimeout": opts.lb.HealthCheck.Timeout,
					"maxFailureAttempts": opts.lb.HealthCheck.UnhealthyThreshold,
					"maxSuccessAttempts": opts.lb.HealthCheck.HealthyThreshold
				};
			}
			if (opts.lb.ListenerDescriptions) {
				record.rules = [];
				opts.lb.ListenerDescriptions.forEach((oneListener) => {
					let rule = {};
					if (oneListener.Listener) {
						if (oneListener.Listener.InstanceProtocol) {
							rule.backendProtocol = oneListener.Listener.InstanceProtocol;
						}
						if (oneListener.Listener.InstancePort) {
							rule.backendPort = oneListener.Listener.InstancePort;
						}
						if (oneListener.Listener.Protocol) {
							rule.frontendProtocol = oneListener.Listener.Protocol;
						}
						if (oneListener.Listener.LoadBalancerPort) {
							rule.frontendPPort = oneListener.Listener.LoadBalancerPort;
						}
						if (oneListener.Listener.SSLCertificateId) {
							rule.certificate = oneListener.Listener.SSLCertificateId;
						}
					}
					record.rules.push(rule);
				});
			}
		}
		record.zones = [];
		if (opts.subnets && Array.isArray(opts.subnets) && opts.subnets.length > 0) {
			opts.subnets.forEach((oneSubnet) => {
				record.zones.push({
					name: oneSubnet.AvailabilityZone,
					subnetId: oneSubnet.SubnetId
				})
			});
		}
		record.instances = [];
		if (opts.instances && Array.isArray(opts.instances) && opts.instances.length > 0) {
			opts.instances.forEach((onVm) => {
				record.instances.push({
					id: onVm.InstanceId,
					state: onVm.State
				})
			});
		}
		return record;
	},
};

module.exports = helper;