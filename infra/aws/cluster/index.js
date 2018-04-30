'use strict';
const async = require('async');
const fs = require('fs');
const AWS = require('aws-sdk');

const config = require("./config");
const defaultDriver = 'docker';

function getConnector(opts) {
	AWS.config.update({
		credentials: {
			accessKeyId: opts.keyId,
			secretAccessKey: opts.secretAccessKey
		},
		region: opts.region || config.api.region
	});
	
	switch (opts.api) {
		case 'ec2':
			return new AWS.EC2({apiVersion: '2016-11-15'});
			break;
		case 's3':
			return new AWS.S3();
			break;
		default:
			return new AWS.EC2({apiVersion: '2016-11-15'});
	}
}

function runCorrespondingDriver(method, options, cb) {
	let driverName = (options.infra && options.infra.stack && options.infra.stack.technology) ? options.infra.stack.technology : defaultDriver;
	driverName = (options.params && options.params.technology) ? options.params.tehcnology : driverName;
	fs.exists(__dirname + "/" + driverName + ".js", (exists) => {
		if (!exists) {
			return cb(new Error("Requested Driver does not exist!"));
		}
		
		let driver = require("./" + driverName);
		driver[method](options, cb);
	});
}

const driver = {
	/**
	 * this method authenticates the credentials provided by invoking the aws api
	 * Note: data.options provided to this method is different from other methods as this method is invoked via 3rd parties systems ( projects )
	 * @param options {Object}
	 * @param cb {Function}
	 */
	"authenticate": function (options, cb) {
		let aws = options.infra.api;
		let ec2 = getConnector({api: 'ec2', keyId: aws.keyId, secretAccessKey: aws.secretAccessKey});
		let params = {};
		
		// Retrieves all regions/endpoints that work with EC2
		ec2.describeRegions(params, function (error, data) {
			if (error) {
				return cb(error);
			}
			if (!data) {
				return cb(new Error("Unable to reach AWS API!"));
			}
			return cb(null, true);
		});
	},
	
	"getExtras": function (options, cb) {
		return cb(null, {technologies: ['docker'], templates: ['external']});
	},
	
	"deployCluster": function (options, cb) {
		runCorrespondingDriver('deployCluster', options, cb);
	},
	
	"getDeployClusterStatus": function (options, cb) {
		runCorrespondingDriver('getDeployClusterStatus', options, cb);
	},
	
	"getDNSInfo": function (options, cb) {
		runCorrespondingDriver('getDNSInfo', options, cb);
	},
	
	/**
	 * This method returns the available deployment regions at aws
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getRegions": function (options, cb) {
		let response = {
			"regions": []
		};
		response.regions = [
			{v: 'us-east-1', 'l': 'US East (N. Virginia)'},
			{v: 'us-east-2', 'l': 'US East (Ohio)'},
			{v: 'us-west-1', 'l': 'US West (N. California)'},
			{v: 'us-west-2', 'l': 'US West (Oregon)'},
			{v: 'ca-central-1', 'l': 'Canada (Central)'},
			{v: 'eu-west-1', 'l': 'EU (Ireland)'},
			{v: 'eu-west-2', 'l': 'EU (London)'},
			{v: 'eu-central-1', 'l': 'EU (Frankfurt)'},
			{v: 'ap-northeast-1', 'l': 'Asia Pacific (Tokyo)'},
			{v: 'ap-northeast-2', 'l': 'Asia Pacific (Seoul)'},
			{v: 'ap-south-1', 'l': 'Asia Pacific (Mumbai)'},
			{v: 'ap-southeast-1', 'l': 'Asia Pacific (Singapore)'},
			{v: 'ap-southeast-2', 'l': 'Asia Pacific (Sydney)'},
			{v: 'sa-east-1', 'l': 'South America (São Paulo)'}
		];
		
		return cb(null, response);
	},
	
	"scaleCluster": function (options, cb) {
		runCorrespondingDriver('scaleCluster', options, cb);
	},
	
	"getCluster": function (options, cb) {
		runCorrespondingDriver('getCluster', options, cb);
	},
	
	"updateCluster": function (options, cb) {
		runCorrespondingDriver('updateCluster', options, cb);
	},
	
	"deleteCluster": function (options, cb) {
		runCorrespondingDriver('deleteCluster', options, cb);
	},
	
	"publishPorts": function (options, cb) {
		runCorrespondingDriver('publishPorts', options, cb);
	},
	
	"deployExternalLb": function (options, cb) {
		runCorrespondingDriver('deployExternalLb', options, cb);
	},
	
	"updateExternalLB": function (options, cb) {
		runCorrespondingDriver('updateExternalLB', options, cb);
	},
	
	"deleteExternalLB": function (options, cb) {
		runCorrespondingDriver('deleteExternalLB', options, cb);
	},
	
	"getFiles": function(options, cb) {
		let aws = options.infra.api;
		let s3 = getConnector({api: 's3', keyId: aws.keyId, secretAccessKey: aws.secretAccessKey});
		
		s3.listObjectsV2({Bucket: 'soajs'}, (error, data) =>{
			if(error){ return cb(error); }
			
			let files =[];
			async.map(data.Contents, (oneFile, mCb) => {
				s3.getObjectTagging({Bucket: 'soajs', Key: oneFile.Key}, (error, tags) => {
					if(error){ return mCb(error); }
					
					let description = '';
					tags.TagSet.forEach((oneTag) => {
						if(oneTag.Key === 'description'){
							description = oneTag.Value;
						}
					});
					
					files.push({
						id: oneFile.Key,
						name: oneFile.Key,
						description: description
					});
					return mCb(null, true);
				});
			}, (error) => {
				return cb(error, files);
			});
		});
	},
	
	'downloadFile': function(options, cb) {
		let aws = options.infra.api;
		let s3 = getConnector({api: 's3', keyId: aws.keyId, secretAccessKey: aws.secretAccessKey});
		
		s3.getObject({Bucket: 'soajs', Key: options.params.id}, (error, data) => {
			if(error) { return cb(error); }
			
			delete data.Body;
			try{
				let readStream = s3.getObject({Bucket: 'soajs', Key: options.params.id}).createReadStream();
				return cb(null, {'info': {'contenttype': data.ContentType, size: data.ContentLength }, 'stream': readStream});
			}
			catch(e){
				return cb(e);
			}
		});
		
	},
	
	'deleteFile': function(options, cb) {
		let aws = options.infra.api;
		let s3 = getConnector({api: 's3', keyId: aws.keyId, secretAccessKey: aws.secretAccessKey});
		s3.deleteObject({Bucket: 'soajs', Key: options.params.id}, (error) => {
			return cb(error, true);
		});
	},
	
	"uploadFile": function (options, cb) {
		
		let aws = options.infra.api;
		let s3 = getConnector({api: 's3', keyId: aws.keyId, secretAccessKey: aws.secretAccessKey});
		
		async.series({
			'assertSoajsBucket': (mCb) => {
				//list buckets
				//if soajs is not found
				//create soajs bucket
				s3.listBuckets({}, function (error, buckets) {
					if (error) {
						return mCb(error);
					}
					
					let found = false;
					buckets.Buckets.forEach((oneBucket) => {
						if (oneBucket.Name === 'soajs') {
							found = true;
						}
					});
					
					if (!found) {
						s3.createBucket({ Bucket: "soajs" }, mCb);
					}
					else return mCb();
				});
			},
			'uploadFileToBucket': (mCb) => {
				let params = {
					Bucket: 'soajs',
					Key: options.params.name,
					Body: options.params.stream,
					ContentLength: options.params.size,
					ContentType: options.params.contenttype,
					Tagging: "description=" + options.params.description
				};
				
				s3.putObject(params, mCb);
			}
		}, (error) => {
			return cb(error, true);
		});
	}
};

module.exports = driver;
