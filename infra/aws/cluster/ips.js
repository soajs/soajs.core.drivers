'use strict';

const async = require('async');
const utils = require('../../../lib/utils/utils.js');

const ips = {

    /**
    * List available ip addresses

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    list: function(options, cb) {
	    return cb(null, true);
    },

    /**
    * Create a new ip address

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    create: function(options, cb) {
	    return cb(null, true);
    },

    /**
    * Update an ip address

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {
        return ips.create(options, cb);
    },

    /**
    * Delete an ip address

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    delete: function(options, cb) {
	    return cb(null, true);
    }

};

module.exports = ips;
