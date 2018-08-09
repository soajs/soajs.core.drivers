'use strict';

const async = require('async');
const utils = require('../../../lib/utils/utils.js');

const subnets = {

    /**
    * List available subnets

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}listsub
    */
    list: function (options, cb) {
	    return cb(null, true);
    },

    /**
    * Create a new subnet

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}listsub
    */
    create: function(options, cb) {
	    return cb(null, true);
    },

    /**
    * Update an existing subnet

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}listsub
    */
    update: function(options, cb) {
	    return cb(null, true);
    },

    /**
    * Delete a subnet

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}listsub
    */
    delete: function(options, cb) {
	    return cb(null, true);
    }

};

module.exports = subnets;
