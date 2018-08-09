'use strict';

const async = require('async');
const utils = require('../../../lib/utils/utils.js');

const networks = {

    /**
    * List available networks

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    list: function(options, cb) {
	    return cb(null, true);
    },

    /**
    * Create a new network

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    create: function(options, cb) {
	    return cb(null, true);
    },

    /**
    * Update a network

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {
        return networks.create(options, cb);
    },

    /**
    * Delete a network

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    delete: function(options, cb) {
	    return cb(null, true);
    }

};

module.exports = networks;
