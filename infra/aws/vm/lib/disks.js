'use strict';

const async = require('async');
const utils = require('../../../../lib/utils/utils.js');

const disks = {
	
	/**
	 * List available disks
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	list: function(options, cb) {
		return cb(null, true);
	},
	
	/**
	 * Create a new disk
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	create: function(options, cb) {
		return cb(null, true);
	},
	
	/**
	 * Update a disk
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	update: function(options, cb) {
		return cb(null, true);
	},
	
	/**
	 * Delete a disk
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	delete: function(options, cb) {
		return cb(null, true);
	}
	
};

module.exports = disks;
