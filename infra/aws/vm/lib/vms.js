'use strict';

const async = require('async');
const utils = require('../../../../lib/utils/utils.js');

const vms = {

    /**
	* Get information about deployed vitual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	inspect: function (options, cb) {
	    return cb(null, true);
	},

	/**
	* List available virtual machines by subscription

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	list: function (options, cb) {
		return cb(null, true);
	},

	/**
	* Update labels of one or more vm instances

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	updateVmLabels: function(options, cb) {
		return cb(null, true);
	}
};

module.exports = vms;
