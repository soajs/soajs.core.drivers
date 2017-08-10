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
    createResources(options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {

                let validInput = (options.params);
                if(validInput) {
                    validInput = validInput && (options.params.resources && Array.isArray(options.params.resources) && options.params.resources.length > 0)
                }

                utils.checkError(!validInput, 674, cb, () => {
                    async.eachSeries(options.params.resources, (oneResource, callback) => {
                        let namespace = (oneResource && oneResource.metadata && oneResource.metadata.namespace) ? oneResource.metadata.namespace : 'default';
                        return deployer.api.group(oneResource).namespaces(namespace).kind(oneResource).post({ body: oneResource }, callback);
                    }, (error) => {
                        return utils.checkError(error, 680, cb, cb.bind(null, null, true));
                    });
                });
            });
        });
    }

};

module.exports = engine;
