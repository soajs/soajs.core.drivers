'use strict';

const driver = {
	
	/**
	 * List groups not supported
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	list: function (options, cb) {
		return cb(null, 'N/A');
	},
	
	/**
	 * Create groups not supported
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	create: function (options, cb) {
		
		return cb(null, 'N/A');
	},
	
	/**
	 * Update groups not supported
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	update: function (options, cb) {
		return cb(null, 'N/A');
	},
	
	/**
	 * Delete groups not supported
	 
	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	delete: function (options, cb) {
		return cb(null, 'N/A');
	}
};

module.exports = driver;
