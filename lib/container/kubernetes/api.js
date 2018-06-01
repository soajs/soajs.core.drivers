/* jshint esversion: 6 */
'use strict';

const async = require('async');
const path = require('path');
const fs = require('fs');

const utils = require('../../utils/utils.js');
const lib = require('./utils.js');

const engine = {

    /**
     * Function that loads resource predefined templates and returns them
     * @param  {Object}   options
     * @param  {Function} cb
     *
     */
    loadResourceTemplates(options, cb) {
        let validInput = (options.params);
        if(validInput) {
            validInput = validInput && (options.params.resource || options.params.templates);
        }

        //NOTE: if user provides templates in params, use them instead of trying to load resource from file
        if(options.params.templates && Array.isArray(options.params.templates)) {
            return cb(null, options.params.templates);
        }

        utils.checkError(!validInput, 674, cb, () => {
            let resourcePath = path.join(__dirname, '../../schemas/kubernetes/resources/', options.params.resource);
            fs.access(resourcePath, fs.constants.F_OK | fs.constants.R_OK, (error) => {
                utils.checkError(error, 681, cb, () => {
                    fs.readdir(resourcePath, (error, content) => {
                        utils.checkError(error, 681, cb, () => {
                            async.map(content, (oneContent, callback) => {
                                let jsonContent = {};
                                try {
                                    jsonContent = require(path.join(resourcePath, oneContent));
                                }
                                catch (e) {
                                    return callback(e);
                                }

                                return callback(null, jsonContent);
                            }, (error, templates) => {
                                utils.checkError(error, 681, cb, () => {
                                    return cb(null, templates);
                                });
                            });
                        });
                    });
                });
            });
        });
    },

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
                    validInput = validInput && (options.params.resource || options.params.templates);
                    validInput = validInput && (options.params.action && ['post', 'get', 'delete'].indexOf(options.params.action) !== -1);
                }
                utils.checkError(!validInput, 674, cb, () => {
                    engine.loadResourceTemplates(options, (error, templates) => {
                        utils.checkError(error, 681, cb, () => {
                            options.params.resources = templates;
                            async.mapSeries(options.params.resources, (oneResource, callback) => {
                                let namespace = (oneResource && oneResource.metadata && oneResource.metadata.namespace) ? oneResource.metadata.namespace : null;
                                let apiParams = {};
                                if (['post'].indexOf(options.params.action) !== -1) {
                                    apiParams = { body: oneResource };
                                }
                                else if (['get', 'delete'].indexOf(options.params.action) !== -1 && oneResource.metadata && oneResource.metadata.name) {
                                    apiParams = { name: oneResource.metadata.name };
                                }
	                            if (namespace) {
		                            deployer.api.group(oneResource).namespaces(namespace).kind(oneResource)[options.params.action](apiParams, function (error, response) {
		                            	// if not found (get, delete) or already exists (post) don't return an error
			                            if (error && (error.code === 404 || error.code === 409)) {
				                            if (options.params.action === 'get' || options.params.action === 'post') return callback(null, {});
				                            else if (options.params.action === 'delete') return callback(null, true);
			                            }
			                            return callback(error, response);
		                            });
	                            } else {
		                            deployer.api.group(oneResource).kind(oneResource)[options.params.action](apiParams, function (error, response) {
			                            if (error && (error.code === 404 || error.code === 409)) {
				                            if (options.params.action === 'get' || options.params.action === 'post') return callback(null, {});
				                            else if (options.params.action === 'delete') return callback(null, true);
			                            }
			                            return callback(error, response);
		                            });
	                            }
                            }, (error, results) => {
                                return utils.checkError(error, 680, cb, cb.bind(null, null, (options.params.action === 'get') ? results : true));
                            });
                        });
                    });
                });
            });
        });
    }

};

module.exports = engine;
