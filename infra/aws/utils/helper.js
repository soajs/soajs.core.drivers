'use strict';

const async = require('async');
const config = require('../config')
const helper = {

	buildNetworkRecord: function (opts) {
		let record = {};
		if (opts.region) {
			record.region = opts.region;
		}

		if (opts.subnets) {
			record.subnets = opts.subnets;
		}
		record.attachInternetGateway = false;
		if (opts.attachInternetGateway && opts.attachInternetGateway.InternetGateways && opts.attachInternetGateway.InternetGateways.length > 0) {
			record.attachInternetGateway = true;
		}

		if (opts.network) {
			if (opts.network.VpcId) {
				record.name = opts.network.VpcId;
				record.id = opts.network.VpcId;
			}
			if (opts.network.Tags && opts.network.Tags.length > 0) {
				for (let i = 0; i < opts.network.Tags.length; i++) {
					if (opts.network.Tags[i].Key === "Name") {
						record.name = opts.network.Tags[i].Value;
						break;
					}
				}
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
			if (opts.subnet.Tags && opts.subnet.Tags.length > 0) {
				for (let i = 0; i < opts.subnet.Tags.length; i++) {
					if (opts.subnet.Tags[i].Key === "Name") {
						record.name = opts.subnet.Tags[i].Value;
						break;
					}
				}
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
				record.mode = opts.lb.Scheme === 'internet-facing' ? "public" : "private";
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
					"healthProbeInterval": opts.lb.HealthCheck.Interval,
					"healthProbeTimeout": opts.lb.HealthCheck.Timeout,
					"maxFailureAttempts": opts.lb.HealthCheck.UnhealthyThreshold,
					"maxSuccessAttempts": opts.lb.HealthCheck.HealthyThreshold
				};
				if (opts.lb.HealthCheck.Target) {
					record.healthProbe.healthProbeProtocol = opts.lb.HealthCheck.Target.split(":")[0];
					if (opts.lb.HealthCheck.Target.split(":")[1]) {
						let temp = opts.lb.HealthCheck.Target.split(":")[1].split("/");
						record.healthProbe.healthProbePort = opts.lb.HealthCheck.Target.split(":")[1].split("/")[0];
						temp.shift();
						record.healthProbe.healthProbePath = "/" + temp.join("/");
					}
				}
			}
			if (opts.lb.ListenerDescriptions) {
				record.rules = [];
				opts.lb.ListenerDescriptions.forEach((oneListener) => {
					let rule = {};
					if (oneListener.Listener) {
						if (oneListener.Listener.InstanceProtocol) {
							rule.backendProtocol = oneListener.Listener.InstanceProtocol.toLowerCase();
						}
						if (oneListener.Listener.InstancePort) {
							rule.backendPort = oneListener.Listener.InstancePort;
						}
						if (oneListener.Listener.Protocol) {
							rule.frontendProtocol = oneListener.Listener.Protocol.toLowerCase();
						}
						if (oneListener.Listener.LoadBalancerPort) {
							rule.frontendPort = oneListener.Listener.LoadBalancerPort;
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

	buildCertificateRecord: function (opts) {
		let output = {};
		output.region = opts.region;

		if (opts.tags) {
			let nameTag = opts.tags.find((oneEntry) => {
				return oneEntry.Key === 'Name'
			});
			if (nameTag) output.name = nameTag.Value;
		}

		if (opts.certificate) {
			if (opts.certificate.CertificateArn) output.id = opts.certificate.CertificateArn;
			if (opts.certificate.DomainName) output.domain = opts.certificate.DomainName;
			if (opts.certificate.SubjectAlternativeNames) output.alternativeDomains = opts.certificate.SubjectAlternativeNames;
			if (opts.certificate.Type) output.type = opts.certificate.Type.toLowerCase();
			if (opts.certificate.InUseBy && Array.isArray(opts.certificate.InUseBy)) {
				output.loadBalancers = [];
				opts.certificate.InUseBy.forEach((oneEntry) => {
					if (oneEntry.match(/:loadbalancer\/.*/g)) {
						output.loadBalancers.push({
							id: oneEntry,
							region: oneEntry.split(':')[3], // find a better way to parse the id
							name: oneEntry.split(':loadbalancer/')[1]
						});
					}
				});
			}

			output.details = {};
			if (opts.certificate.Issuer) output.details.issuer = opts.certificate.Issuer;
			else if (opts.certificate.Type === 'AMAZON_ISSUED') output.details.issuer = 'Amazon';

			if (opts.certificate.ImportedAt) output.details.importDate = opts.certificate.ImportedAt;
			if (opts.certificate.Status) output.details.status = helper.getCertificateStatus({status: opts.certificate.Status});
			if (opts.certificate.NotBefore) output.details.validFrom = opts.certificate.NotBefore;
			if (opts.certificate.NotAfter) output.details.validTo = opts.certificate.NotAfter;

			output.dnsConfig = [];
			if (opts.certificate.DomainValidationOptions && Array.isArray(opts.certificate.DomainValidationOptions)) {
				opts.certificate.DomainValidationOptions.forEach((oneOption) => {
					if (oneOption.ValidationMethod === 'DNS' && oneOption.ResourceRecord) {
						output.dnsConfig.push({
							domain: oneOption.DomainName,
							name: oneOption.ResourceRecord.Name,
							type: oneOption.ResourceRecord.Type,
							value: oneOption.ResourceRecord.Value
						});
					}
				});
			}
		}

		return output;
	},

	getCertificateStatus: function (opts) {
		if (!opts.status) opts.status = '';

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
	},

	buildVMRecord: (opts, cb) => {
		let record = {
			ip: []
		};
		let region = opts.region;
		record.region = region;
		record.executeCommand = true;
		if (opts.vm) {
			if (opts.vm.InstanceId) {
				record.id = opts.vm.InstanceId;
				record.name = opts.vm.InstanceId;
			}
			if (opts.vm.InstanceType) {
				record.type = opts.vm.InstanceType;
			}
			if (opts.vm.KeyName) {
				record.keyPair = opts.vm.KeyName;
			}

			record.labels = {};
			if (opts.vm.Tags.length > 0) {
				let soajsName, name;
				for (let i = 0; i < opts.vm.Tags.length; i++) {
					if (opts.vm.Tags[i].Key && opts.vm.Tags[i].Value){
						record.labels[opts.vm.Tags[i].Key] = opts.vm.Tags[i].Value;
						if (opts.vm.Tags[i].Key === "soajs.vm.name") {
							soajsName = opts.vm.Tags[i].Value;
							
						}
						if (opts.vm.Tags[i].Key === "Name") {
							name = opts.vm.Tags[i].Value;
						}
					}
				}
				if (soajsName) {
					record.name = soajsName;
				}
				else if (name) {
					record.name = name;
				}
			}
			record.labels['soajs.service.vm.location'] = region;
			record.labels['soajs.service.vm.size'] = (opts.vm.InstanceType) ? opts.vm.InstanceType : '';

			if (opts.vm.SubnetId) {
				record.layer = opts.vm.SubnetId;
			}
			if (opts.vm.VpcId) {
				record.network = opts.vm.VpcId;
			}

			if (opts.vm.PrivateIpAddress || opts.vm.PrivateDnsName) {
				let privateIp = {};
				privateIp.type = "private";
				privateIp.allocatedTo = "instance";
				if (opts.vm.PrivateIpAddress) {
					privateIp.address = opts.vm.PrivateIpAddress;
				}
				if (opts.vm.PrivateDnsName) {
					privateIp.dns = opts.vm.PrivateDnsName;
				}
				record.ip.push(privateIp);
			}
			if (opts.vm.PublicDnsName || opts.vm.PublicIpAddress) {
				let publicIp = {};
				publicIp.type = "public";
				publicIp.allocatedTo = "instance";
				if (opts.vm.PublicDnsName) {
					publicIp.dns = opts.vm.PublicDnsName;
				}
				if (opts.vm.PublicIpAddress) {
					publicIp.address = opts.vm.PublicIpAddress;
				}
				record.ip.push(publicIp);
			}
			record.volumes = [];
			if (opts.vm.BlockDeviceMappings && opts.vm.BlockDeviceMappings.length > 0) {
				opts.vm.BlockDeviceMappings.forEach((block) => {
					if (block.Ebs && block.Ebs.VolumeId && opts.volumes) {
						opts.volumes.forEach((oneVolume) => {
							if (oneVolume.VolumeId === block.Ebs.VolumeId) {
								record.volumes.push(helper.computeVolumes({volumes: oneVolume, region}))
							}
						});
					}
				});
			}
			record.tasks = [{
				"id": record.id,
				"name": record.name,
				"status": {
					"state": helper.computeState(opts.vm.State.Name),
					"ts": new Date(opts.vm.LaunchTime).getTime()
				}
			}];
			if (opts.vm.ImageId && opts.images) {
				opts.images.forEach((oneImage) => {
					if (opts.vm.ImageId === oneImage.ImageId) {
						record.tasks[0].ref = {
							"os": {
								architecture: oneImage.Architecture,
								id: oneImage.ImageId,
								description: oneImage.Description,
								name: oneImage.Name
							}
						};
					}
				});
			}
		}
		record.ports = [];
		record.securityGroup = [];
		if (opts.vm.SecurityGroups && opts.vm.SecurityGroups.length > 0 && opts.securityGroups && opts.securityGroups.length > 0) {
			opts.vm.SecurityGroups.forEach((group) => {
				record.securityGroup.push(group.GroupId);
				opts.securityGroups.forEach((listGroup) => {
					if (group.GroupId === listGroup.GroupId) {
						if (listGroup.IpPermissions) {
							listGroup.IpPermissions.forEach((inbound) => {
								record.ports.push(helper.buildPorts({
									ports: inbound,
									type: "inbound",
									securityGroupId: group.GroupId
								}));
							});
						}
						if (listGroup.IpPermissionsEgress) {
							listGroup.IpPermissionsEgress.forEach((outbound) => {
								record.ports.push(helper.buildPorts({
									ports: outbound,
									type: "outbound",
									securityGroupId: group.GroupId
								}));
							});
						}
					}
				});
			});
		}
		if (opts.lb) {
			opts.lb.forEach((oneLb) => {
				if (oneLb.Instances && oneLb.Instances.length) {
					oneLb.Instances.forEach((vm) => {
						if (vm.InstanceId === opts.vm.InstanceId) {
							record.ip.push({
								type: oneLb.Scheme === 'internet-facing' ? "public" : "private",
								allocatedTo: "loadBalancer",
								address: oneLb.DNSName,
								dns: oneLb.DNSName
							});
						}
					});
				}
			});
		}
		if (opts.subnet) {
			for (let i = 0; i < opts.subnet.length; i++) {
				if (opts.vm.SubnetId === opts.subnet[i].SubnetId) {
					if (opts.subnet[i].Tags.length > 0) {
						for (let j = 0; j < opts.subnet[i].Tags.length; j++) {
							if (opts.subnet[i].Tags[j].Key === "Name") {
								record.layer = opts.subnet[i].Tags[j].Value;
								break;
							}
						}
						break;
					}
				}
			}
		}
		if (opts.vm && opts.vm.VpcId && opts.connection && opts.connection.InternetGateways && opts.connection && opts.connection.InternetGateways.length > 0) {
			let found = false;
			for (let i = 0; i < opts.connection.InternetGateways.length; i++) {
				let gateway = opts.connection.InternetGateways[i];
				for (let j = 0; j < gateway.Attachments.length; j++) {
					if (opts.vm.VpcId === gateway.Attachments[j].VpcId) {
						found = true;
						break;
					}
				}
				if (found) {
					break;
				}
			}
			if (!found) {
				record.executeCommand = false;
			}
		}
		else {
			record.executeCommand = false;
		}
		if (opts.roles && Array.isArray(opts.roles) && opts.vm && opts.vm.IamInstanceProfile) {
			let found = false;
			let arn = opts.vm.IamInstanceProfile.Arn.split("/");
			let role = arn[arn.length - 1];
			for (let i = 0; i < opts.roles.length; i++) {
				if (opts.roles[i] && typeof  opts.roles[i] === 'object' && opts.roles[i][role]){
                    let keys = Object.keys(opts.roles[i]);
                    if (keys[0] === role) {
                        for (let j = 0; j < opts.roles[i][role].AttachedPolicies.length; j++) {
                            if (config.aws.ssmSupportedPolicy.includes(opts.roles[i][role].AttachedPolicies[j].PolicyName)) {
                                found = true;
                                break;
                            }
                        }
                    }
                    if (found) {
                        break;
                    }
				}
			}
			if (!found) {
				record.executeCommand = false;
			}
		} else {
			record.executeCommand = false;
		}
		return cb(null, record);

	},

	buildSecurityGroupsRecord: (opts) => {
		let securityGroup = {};
		securityGroup.ports = [];
		securityGroup.region = opts.region;
		if (opts.securityGroup) {
			if (opts.securityGroup.GroupId) {
				securityGroup.id = opts.securityGroup.GroupId;
				securityGroup.name = opts.securityGroup.GroupId;
				securityGroup.groupName = opts.securityGroup.GroupName;
			}
			if (opts.securityGroup.Tags && Array.isArray(opts.securityGroup.Tags) && opts.securityGroup.Tags.length > 0) {
				for (let i = 0; i < opts.securityGroup.Tags.length; i++) {
					if (opts.securityGroup.Tags[i] && opts.securityGroup.Tags[i].Key && opts.securityGroup.Tags[i].Key === "Name") {
						securityGroup.name = opts.securityGroup.Tags[i].Value;
						break;
					}
				}
			}
			if (opts.securityGroup.Description) {
				securityGroup.description = opts.securityGroup.Description;
			}
			if (opts.securityGroup.VpcId) {
				securityGroup.networkId = opts.securityGroup.VpcId;
			}
			if (opts.securityGroup.IpPermissions) {
				opts.securityGroup.IpPermissions.forEach((inbound) => {
					securityGroup.ports.push(helper.buildPorts({ports: inbound, type: "inbound"}));
				});
			}
			if (opts.securityGroup.IpPermissionsEgress) {
				opts.securityGroup.IpPermissionsEgress.forEach((outbound) => {
					securityGroup.ports.push(helper.buildPorts({ports: outbound, type: "outbound"}));
				});
			}
		}
		return securityGroup;
	},

	buildPorts: (opts) => {
		let ports = {};
		ports.direction = opts.type;
		if (opts.ports) {
			if (opts.ports.IpProtocol) {
				if (opts.ports.IpProtocol === "-1") {
					ports.protocol = "*";
					ports.published = "0 - 65535";
				}
				else {
					ports.protocol = opts.ports.IpProtocol;
					if (opts.ports.hasOwnProperty('FromPort')) {
						ports.published = opts.ports.FromPort.toString();
					}
					if (opts.ports.hasOwnProperty('ToPort') && opts.ports.ToPort != opts.ports.FromPort) {
						ports.published += ' - ' + opts.ports.ToPort;
					}
				}
			}
			ports.access = "allow";
			ports.isPublished = false;
			ports.source = [];
			if (opts.ports.IpRanges && opts.ports.IpRanges.length > 0) {
				opts.ports.IpRanges.forEach((range) => {
					ports.source.push(range.CidrIp);
					if (["*", "0.0.0.0/0"].includes(range.CidrIp) && ports.direction === 'inbound') {
						ports.isPublished = true;
					}
				});
			}
			if (opts.ports.UserIdGroupPairs && opts.ports.UserIdGroupPairs.length > 0) {
				opts.ports.UserIdGroupPairs.forEach((range) => {
					ports.source.push(range.GroupId);
					if (ports.direction === 'inbound') {
						ports.isPublished = false;
					}
				});
			}
			ports.ipv6 = [];
			if (opts.ports.Ipv6Ranges && opts.ports.Ipv6Ranges.length > 0) {
				opts.ports.Ipv6Ranges.forEach((v6) => {
					ports.ipv6.push(v6.CidrIpv6);
				});
			}
		}
		return ports;
	},

	computeState: (state) => {
		let states = ["running", "succeeded", "available"];
		return states.indexOf(state) !== -1 ? "succeeded" : "failed";
	},

	computeVolumes: (opts) => {
		let volume = {};
		if (opts.volumes) {
			if (opts.volumes.AvailabilityZone) {
				volume.zone = opts.volumes.AvailabilityZone;
			}
			if (opts.volumes.VolumeId) {
				volume.id = opts.volumes.VolumeId;
			}
			if (opts.volumes.Size) {
				volume.diskSizeGB = opts.volumes.Size;
			}
			if (opts.volumes.State) {
				volume.state = helper.computeState(opts.volumes.State);
			}
			if (opts.volumes.Iops) {
				volume.iops = opts.volumes.Iops;
			}
			if (opts.volumes.VolumeType) {
				volume.type = opts.volumes.VolumeType;
			}
			if (Object.prototype.hasOwnProperty.call(opts.volumes, "Encrypted")) {
				volume.encrypted = opts.volumes.Encrypted;
			}
		}
		if (opts.region) {
			volume.region = opts.region;
		}
		return volume;
	}
};

module.exports = helper;
