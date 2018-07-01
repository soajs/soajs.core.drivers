'use strict';

const terraform = require(`${__dirname}/../../../lib/terraform`);
const utils = require('../../../lib/utils/utils.js');

const driver = {

    /**
    * Deploy a new layer using a terraform template
    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    deployCluster: function(options, cb) {
        if(!options.params.input) {
            options.params.input = {};
        }

        options.params.input.clientId = options.infra.api.clientId;
        options.params.input.secret = options.infra.api.secret;
        options.params.input.domain = options.infra.api.domain;
        options.params.input.subscriptionId = options.infra.api.subscriptionId;
        options.params.input.envCode = options.registry.code;
        // in case a deployment fails and a rollback is needed, pass the excluded resources to avoid destroying the resource group when destroying a layer
        options.params.exclude = [`azurerm_resource_group.${options.params.layerName}`];
        terraform.apply(options,function(error, result){
            utils.checkError(error, 738, cb, () => {
                return cb(null, result);
            });
        });
    },

    /**
    * Update an existing layer using a terraform template
    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    updateCluster: function(options, cb) {
        if (typeof options.params.templateState != "object" ) {
            return cb({error: 'Missing template state', code: 739});
        }
        else {
            return driver.deployCluster(options,cb);
        }
    },

    /**
    * Delete a layer created using a terraform template
    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    deleteCluster: function(options, cb) {
        // do not allow terraform to destroy the resource group of the layer. Deleting the resource group will delete the whole environment
        options.params.exclude = [`azurerm_resource_group.${options.params.layerName}`];
        terraform.destroy(options,function(error, result){
            utils.checkError(error, 740, cb, () => {
                return cb(null, result);
            });
        });
    }

};

module.exports = driver;
