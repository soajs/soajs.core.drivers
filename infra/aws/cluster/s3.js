const async = require('async');
const fs = require('fs');
const AWS = require('aws-sdk');

const config = require("../config");

function getConnector(opts) {
	AWS.config.update({
		credentials: {
			accessKeyId: opts.keyId,
			secretAccessKey: opts.secretAccessKey
		},
		region: opts.region || config.api.region
	});
	
	return new AWS.S3({apiVersion: '2006-03-01'});
}

const AWSS3 = {
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

module.exports = AWSS3;