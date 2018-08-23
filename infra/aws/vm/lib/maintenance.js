'use strict';

const async = require('async');
const utils = require('../../../../lib/utils/utils.js');
const helper = require('../../utils/helper.js');

function getConnector(opts) {
	return utils.getConnector(opts, config);
}
const maintenance = {

    /**
	* Delete a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	deleteService: function (options, cb) {
	    const aws = options.infra.api;
	    const ec2 = getConnector({
		    api: 'ec2',
		    region: options.params.region,
		    keyId: aws.keyId,
		    secretAccessKey: aws.secretAccessKey
	    });
	    let params = {};
	    if (typeof options.params.id === "string"){
		    params.InstanceIds = [options.params.id];
	    }
	    else if (Array.isArray(options.params.id) && options.params.id.length > 0){
		    params.InstanceIds = options.params.id
	    }
	    else {
		    return cb(new Error("Instance id must be of type  sting or  array!"));
	    }
	    //Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#terminateInstances-property
	    ec2.terminateInstances(params, cb);
	},

    /**
	* Restart a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	restartService: function (options, cb) {
	    const aws = options.infra.api;
	    const ec2 = getConnector({
		    api: 'ec2',
		    region: options.params.region,
		    keyId: aws.keyId,
		    secretAccessKey: aws.secretAccessKey
	    });
	    let params = {};
	    if (typeof options.params.id === "string"){
		    params.InstanceIds = [options.params.id];
	    }
	    else if (Array.isArray(options.params.id) && options.params.id.length > 0){
		    params.InstanceIds = options.params.id
	    }
	    else {
		    return cb(new Error("Instance id must be of type  sting or  array!"));
	    }
	    //Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#terminateInstances-property
	    ec2.rebootInstances(params, cb);
	},

	/**
	* Redeploy a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	redeployService: function (options, cb) {
		return cb(null, true);
	},

	/**
	* Turn off a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	powerOffVM: function (options, cb) {
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {};
		if (typeof options.params.id === "string"){
			params.InstanceIds = [options.params.id];
		}
		else if (Array.isArray(options.params.id) && options.params.id.length > 0){
			params.InstanceIds = options.params.id
		}
		else {
			return cb(new Error("Instance id must be of type  sting or  array!"));
		}
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#terminateInstances-property
		ec2.stopInstances(params, cb);
	},

	/**
	* Start a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	startVM: function (options, cb) {
		const aws = options.infra.api;
		const ec2 = getConnector({
			api: 'ec2',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});
		let params = {};
		if (typeof options.params.id === "string"){
			params.InstanceIds = [options.params.id];
		}
		else if (Array.isArray(options.params.id) && options.params.id.length > 0){
			params.InstanceIds = options.params.id
		}
		else {
			return cb(new Error("Instance id must be of type  sting or  array!"));
		}
		//Ref: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#terminateInstances-property
		ec2.startInstances(params, cb);
	},

    /**
	* Execute a command inside a running virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	runCommand: function(options, cb) {
	    return cb(null, true);
	},

	/**
	* Get logs of a running virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	getLogs: function(options, cb) {
		return cb(null, true);
	},

};

module.exports = maintenance;
