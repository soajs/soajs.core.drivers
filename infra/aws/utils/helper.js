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
	buildCertificateRecord: function(opts) {
		let output = {};
		output.region = opts.region;
		
		if(opts.tags) {
			let nameTag = opts.tags.find((oneEntry) => { return oneEntry.Key === 'Name' });
			if(nameTag) output.name = nameTag.Value;
		}
		
		if(opts.certificate) {
			if(opts.certificate.CertificateArn) output.id = opts.certificate.CertificateArn;
			if(opts.certificate.DomainName) output.domain = opts.certificate.DomainName;
			if(opts.certificate.SubjectAlternativeNames) output.alternativeDomains = opts.certificate.SubjectAlternativeNames;
			if(opts.certificate.Type) output.type = opts.certificate.Type.toLowerCase();
			if(opts.certificate.InUseBy && Array.isArray(opts.certificate.InUseBy)) {
				output.loadBalancers = [];
				opts.certificate.InUseBy.forEach((oneEntry) => {
					if(oneEntry.match(/:loadbalancer\/.*/g)) {
						output.loadBalancers.push({
							id: oneEntry,
							region: oneEntry.split(':')[3], // find a better way to parse the id
							name: oneEntry.split(':loadbalancer/')[1]
						});
					}
				});
			}
			
			output.details = {};
			if(opts.certificate.Issuer) output.details.issuer = opts.certificate.Issuer;
			else if(opts.certificate.Type === 'AMAZON_ISSUED') output.details.issuer = 'Amazon';
			
			if(opts.certificate.ImportedAt) output.details.importDate = opts.certificate.ImportedAt;
			if(opts.certificate.Status) output.details.status = helper.getCertificateStatus({ status: opts.certificate.Status });
			if(opts.certificate.NotBefore) output.details.validFrom = opts.certificate.NotBefore;
			if(opts.certificate.NotAfter) output.details.validTo = opts.certificate.NotAfter;
		}
		
		return output;
	},
	
	getCertificateStatus: function(opts) {
		if(!opts.status) opts.status = '';
		
		let availableStatuses = {
			issued: 'active',
			pending_validation: 'pending',
			inactive: 'inactive',
			expired: 'expired',
			validation_timed_out: 'validation_timed_out',
			revoked: 'revoked',
			failed: 'failed'
		};
		
		return availableStatuses[opts.status.toLowerCase()] || 'unknown';
	}
};

module.exports = helper;
