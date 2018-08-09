'use strict';

const async = require('async');
const utils = require('../../../../lib/utils/utils.js');

const sizes = {

    /**
	* List available virtual machine sizes

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	list: function (options, cb) {
	    return cb(null, true);
	}

};

module.exports = sizes;
