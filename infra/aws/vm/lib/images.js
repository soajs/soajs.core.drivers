'use strict';

const async = require('async');
const utils = require('../../../../lib/utils/utils.js');

const images = {

    /**
	* List available virtual machine image publishers

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImagePublishers: function (options, cb) {
	    return cb(null, true);
	},

	/**
	*

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImagePublisherOffers: function (options, cb) {
		return cb(null, true);
	},

	/**
	*

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImageVersions: function (options, cb) {
		return cb(null, true);
	}

};

module.exports = images;
