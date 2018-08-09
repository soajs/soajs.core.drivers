'use strict';

const async = require('async');
const config = require('./../config');
const utils = require('../../../lib/utils/utils.js');


const securityGroups = {

    /**
    * List available security groups

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    list: function(options, cb) {
	    return cb(null, true);
    },

    /**
    * Get one network security group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    get: function(options, cb) {
	    return cb(null, true);
    },

    /**
    * Create a new security group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    create: function(options, cb) {
	    return cb(null, true);
    },

    /**
    * Update a security group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {
	    return cb(null, true);
    },

    /**
    * Delete a security group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    delete: function(options, cb) {
	    return cb(null, true);
    }
};

module.exports = securityGroups;
