'use strict';

const terraform = require(`${__dirname}/../../../lib/terraform`);

const driver = {

    /**
     * Deploy a new layer using a terraform template
     * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
     */
    deployCluster: function(options, cb) {
        // inject auth data from options.infra.api to options.params.input
        // pass options to terraform driver, apply function
        // return callback with data drom terrafor driver
    },

    /**
     * Update an existing layer using a terraform template
     * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
     */
    updateCluster: function(options, cb) {
        //verify that options.params.templateState is available and is an object
        //pass to first function deployCluster
        // return callback with data drom terrafor driver
    },

    /**
     * Delete a layer created using a terraform template
     * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
     */
    deleteCluster: function(options, cb) {
        // inject auth data from options.infra.api to options.params.input
        // pass options to terraform driver, destroy function
        // return callback with data drom terrafor driver
    }

};

module.exports = driver;
