/* jshint esversion: 6 */
'use strict';

const async = require('async');

const utils = require('../utils/utils.js');
const lib = require('../utils/kubernetes.js');

const engine = {

    /**
     * Function that allows creating any kind of kubernetes resources with no restrictions
     * @param  {Object}   options
     * @param  {Function} cb
     *
     */
    manageResources(options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {

                let validInput = (options.params);
                if(validInput) {
                    validInput = validInput && (options.params.action && ['post', 'get', 'delete'].indexOf(options.params.action) !== -1);
                    validInput = validInput && (options.params.resources && Array.isArray(options.params.resources) && options.params.resources.length > 0);
                }

                utils.checkError(!validInput, 674, cb, () => {
                    async.mapSeries(options.params.resources, (oneResource, callback) => {
                        let namespace = (oneResource && oneResource.metadata && oneResource.metadata.namespace) ? oneResource.metadata.namespace : 'default';
                        let apiParams = {};
                        if (['post'].indexOf(options.params.action) !== -1) {
                            apiParams = { body: oneResource };
                        }
                        else if (['get', 'delete'].indexOf(options.params.action) !== -1 && oneResource.metadata && oneResource.metadata.name) {
                            apiParams = { name: oneResource.metadata.name };
                        }

                        deployer.api.group(oneResource).namespaces(namespace).kind(oneResource)[options.params.action](apiParams, function (error, response) {
                            if (error && error.code === 404) {
                                if (options.params.action === 'get') return callback(null, {});
                                else if (options.params.action === 'delete') return callback(null, true);
                            }
                            return callback(error, response);
                        });
                    }, (error, results) => {
                        return utils.checkError(error, 680, cb, cb.bind(null, null, (options.params.action === 'get') ? results : true));
                    });
                });
            });
        });
    }

};

module.exports = engine;
