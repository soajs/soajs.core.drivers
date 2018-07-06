'use strict';

const async = require('async');
const helper = require('./../helper');
const utils = require('../../../../lib/utils/utils.js');
const driverUtils = require('../../utils/index.js');

const lbs = {

    /**
    * List available load balancers

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    list: function(options, cb) {
        options.soajs.log.debug(`Listing laod balancers for resourcegroup ${options.params.group}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                networkClient.loadBalancers.list(options.params.group, function (error, loadBalancers) {
                    utils.checkError(error, 732, cb, () => {
                        async.map(loadBalancers, function(oneloadBalancer, callback) {
                            return callback(null, helper.buildLoadBalancerRecord({ loadBalancer: oneloadBalancer }));
                        }, function(error, loadBalancersList) {
                            return cb(null, loadBalancersList);
                        });

                    });
                });
            });
        });
    },

    /**
    * Create a new load balancer

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    create: function(options, cb) {

    },

    /**
    * Update a load balancer

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {

    },

    /**
    * Delete a load balancer

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    delete: function(options, cb) {
        options.soajs.log.debug(`Deleting load Balancer ${options.params.lbname}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const resourceClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                resourceClient.loadBalancers.deleteMethod(options.params.group, options.params.lbname, function (error, response) {
                    utils.checkError(error, 741, cb, () => {
                        return cb(null, true);
                    });
                });
            });
        });
    }

};

module.exports = lbs;
