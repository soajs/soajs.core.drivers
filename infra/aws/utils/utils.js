"use strict";
const AWS = require('aws-sdk');

const utils = {
	getConnector: (opts, config)=> {
		AWS.config.update({
			credentials: {
				accessKeyId: opts.keyId,
				secretAccessKey: opts.secretAccessKey
			},
			region: opts.region || config.api.region
		});
		
		switch (opts.api) {
			case 'ec2':
				return new AWS.EC2({ apiVersion: '2016-11-15' });
			case 'cloudFormation':
				return new AWS.CloudFormation({ apiVersion: '2010-05-15' });
			case 'acm':
				return new AWS.ACM({ apiVersion: "2016-11-15" });
			case 'elb':
				return new AWS.ELB({ apiVersion: '2015-12-01' });
			case 's3':
				return new AWS.S3({ apiVersion: '2006-03-01' });
			default:
				return new AWS.EC2({ apiVersion: '2016-11-15' });
		}
	}
};

module.exports = utils;