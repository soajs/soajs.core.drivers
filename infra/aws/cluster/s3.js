const async = require('async');
const config = require("../config");
const utils = require("../utils/utils");

function getConnector(opts) {
	return utils.getConnector(opts, config);
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

					let tempFile = {
						id: oneFile.Key,
						name: oneFile.Key,
						tags: {}
					};

					tags.TagSet.forEach((oneTag) => {
						if(oneTag.Key === 'description'){
							tempFile.description = oneTag.Value;
						}
						else if(oneTag.Key === 'type'){
							tempFile.type = oneTag.Value;
						}
						else if(oneTag.Key === 'template'){
							tempFile.template = oneTag.Value;
						}
						else if(oneTag.Key === 'driver'){
							tempFile.driver = oneTag.Value;
						}
						else if(oneTag.Key === 'technology'){
							tempFile.technology = oneTag.Value;
						}
						tempFile.tags[oneTag.Key] = oneTag.Value;
					});

					files.push(tempFile);
					return mCb(null, true);
				});
			}, (error) => {
				return cb(error, files);
			});
		});
	},

	"getTemplateInputs": function(options, cb){
		let aws = options.infra.api;
		let s3 = getConnector({api: 's3', keyId: aws.keyId, secretAccessKey: aws.secretAccessKey});

		s3.listObjectsV2({Bucket: 'soajs'}, (error, data) =>{
			if(error){ return cb(error); }

			let files =[];
			async.map(data.Contents, (oneFile, mCb) => {
				s3.getObjectTagging({Bucket: 'soajs', Key: oneFile.Key}, (error, tags) => {
					if(error){ return mCb(error); }

					let tempFile = {
						id: oneFile.Key,
						name: oneFile.Key,
						tags: {}
					};

					tags.TagSet.forEach((oneTag) => {
						if(oneTag.Key === 'description'){
							tempFile.description = oneTag.Value;
						}
						else if(oneTag.Key === 'type'){
							tempFile.type = oneTag.Value;
						}
						else if(oneTag.Key === 'template'){
							tempFile.template = oneTag.Value;
						}
						else if(oneTag.Key === 'technology'){
							tempFile.technology = oneTag.Value;
						}

						tempFile.tags[oneTag.Key] = oneTag.Value
					});

					files.push(tempFile);
					return mCb(null, true);
				});
			}, (error) => {
				if(error){
					return cb(error);
				}

				let templateToUse;
				files.forEach((oneFile) => {
					if(oneFile.tags.template === options.templateName){
						templateToUse = oneFile;
					}
				});

				if(!templateToUse){ return cb(null, null); }

				options.params.id = templateToUse.name;
				AWSS3.downloadFile(options, (error, response) => {
					if(error){
						return cb(error);
					}
					return cb(null, response.content);
				});
			});
		});
	},

	'downloadFile': function(options, cb) {
		let aws = options.infra.api;
		let s3 = getConnector({api: 's3', keyId: aws.keyId, secretAccessKey: aws.secretAccessKey});

		s3.getObject({Bucket: 'soajs', Key: options.params.id}, (error, data) => {
			if(error) { return cb(error); }
			return cb(null, {'info': {'contenttype': data.ContentType, size: data.ContentLength }, 'content': data.Body.toString()});
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
					Tagging: []
				};

				if(typeof(options.params.tags) !== 'object'){
					try {
						//parse incomming tags to JSON
						options.params.tags = JSON.parse(options.params.tags);
					}
					catch (e) {
						options.params.tags = {};
					}
				}
				
				//check if there are tags and concatenate them to the parameter Tagging
				if (options.params.tags && Object.keys(options.params.tags).length > 0) {
					Object.keys(options.params.tags).forEach(oneTag => {
						params.Tagging.push(`${oneTag}=${options.params.tags[oneTag]}`);
					});
				}
				//check if there is a description and add it to the tags
				if (options.params.description.length > 0) {
					params.Tagging.push(`description=${options.params.description}`);
				}
				params.Tagging = params.Tagging.join("&");
				s3.putObject(params, mCb);
			}
		}, (error) => {
			return cb(error, true);
		});
	}
};

module.exports = AWSS3;
