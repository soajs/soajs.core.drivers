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
				opts.network.CidrBlockAssociationSet.forEach((oneAddress)=>{
					if (oneAddress && oneAddress.CidrBlock){
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
		if (opts.subnet){
			if(opts.subnet.SubnetId){
				record.id = opts.subnet.SubnetId;
				record.name = opts.subnet.SubnetId;
			}
			if(opts.subnet.CidrBlock){
				record.address = opts.subnet.CidrBlock;
			}
			if(opts.subnet.State){
				record.state = opts.subnet.State;
			}
			if(opts.subnet.AvailabilityZone){
				record.availabilityZone = opts.subnet.AvailabilityZone;
			}
		}
		return record;
	},
};

module.exports = helper;