/* jshint esversion: 6 */
'use strict';

const path = require('path');
const async = require('async');

const utils = require('../../utils/utils.js');
const lib = require('./utils.js');

const engine = {

    /**
     * Function that gets a horizontal pod autoscaler for a deployment
     * @param  {Object}   options Options passed to function
     * @param  {Function} cb      Callback function
     * @return {void}
     */
    getAutoscaler (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {

                let validInput = (options.params);
                if(validInput) {
                    validInput = validInput && options.params.id;
                }

                utils.checkError(!validInput, 674, cb, () => {
                    let namespace = lib.buildNameSpace(options);
                    deployer.autoscaling.namespaces(namespace).hpa.get({ name: options.params.id }, (error, hpa) => {
                        if (error && error.code === 404) { //NOTE: autoscaler not found, return empty object instead of error
                            return cb(null, {});
                        }
                        else {
                            utils.checkError(error, 675, cb, () => {
                                return cb(null, lib.buildAutoscalerRecord({ hpa }));
                            });
                        }
                    });
                });
            });
        });
    },

    /**
     * Function that creates a horizontal pod autoscaler for a deployment
     * @param  {Object}   options Options passed to function
     * @param  {Function} cb      Callback function
     * @return {void}
     */
    createAutoscaler (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {
                let templatePath = path.join(__dirname, '../../schemas/kubernetes/autoscaler.template.js');
                if (require.resolve(templatePath)) {
                    delete require.cache[require.resolve(templatePath)];
                }
                let autoscaler = utils.cloneObj(require(templatePath));

                //if driver detected kubernetes server v1.7, use autoscaling v1 instead of v2alpha1
                if(deployer.autoscaling && deployer.autoscaling.version === 'v1') {
                    autoscaler.apiVersion = 'autoscaling/v1';
                }

                let validInput = (options.params);
                if(validInput) {
                    validInput = validInput && (options.params.id && options.params.type);
                    validInput = validInput && (options.params.min && options.params.max);
                    validInput = validInput && (options.params.metrics && Object.keys(options.params.metrics).length > 0)
                }

                utils.checkError(options.params.type !== 'deployment', 679, cb, () => {
                    utils.checkError(!validInput, 674, cb, () => {
                        autoscaler.metadata.name = options.params.id;
                        autoscaler.spec.scaleTargetRef.name = options.params.id;
                        autoscaler.spec.scaleTargetRef.kind = options.params.type.charAt(0).toUpperCase() + options.params.type.substring(1);

                        autoscaler.spec.minReplicas = options.params.min;
                        autoscaler.spec.maxReplicas = options.params.max;

                        async.map(Object.keys(options.params.metrics), (oneMetric, callback) => {
                            //NOTE: only supported metric for now is CPU
                            let resource = {};
                            if(oneMetric === 'cpu') {
                                resource = {
                                    type: "Resource",
                                    resource: {
                                        name: "cpu",
                                        targetAverageUtilization: options.params.metrics[oneMetric].percent
                                    }
                                };
                            }

                            return callback(null, resource);
                        }, (error, metrics) => {
                            if(deployer.autoscaling && deployer.autoscaling.version === 'v2alpha1') {
                                autoscaler.spec.metrics = metrics;
                            }
                            else if(deployer.autoscaling && deployer.autoscaling.version === 'v1') {
                                //NOTE: only cpu metric is supported for now
                                autoscaler.spec.targetCPUUtilizationPercentage  = metrics[0].resource.targetAverageUtilization;
                            }

                            let namespace = lib.buildNameSpace(options);
                            deployer.autoscaling.namespaces(namespace).hpa.post({ body: autoscaler }, (error) => {
                                utils.checkError(error, 676, cb, () => {
                                    return cb(null, true);
                                });
                            });
                        });
                    });
                });
            });
        });
    },

    /**
     * Function that updates a horizontal pod autoscaler for a deployment
     * @param  {Object}   options Options passed to function
     * @param  {Function} cb      Callback function
     * @return {void}
     */
    updateAutoscaler (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {

                let validInput = (options.params);
                if(validInput) {
                    validInput = validInput && (options.params.id);
                    validInput = validInput && (options.params.min && options.params.max);
                    validInput = validInput && (options.params.metrics && Object.keys(options.params.metrics).length > 0)
                }
                utils.checkError(!validInput, 674, cb, () => {
                    let namespace = lib.buildNameSpace(options);
                    deployer.autoscaling.namespaces(namespace).hpa.get({ name: options.params.id }, (error, hpa) => {
                        utils.checkError(error, 675, cb, () => {

                            hpa.spec.minReplicas = options.params.min;
                            hpa.spec.maxReplicas = options.params.max;

                            async.map(Object.keys(options.params.metrics), (oneMetric, callback) => {
                                //NOTE: only supported metric for now is CPU
                                let resource = {};
                                if(oneMetric === 'cpu') {
                                    resource = {
                                        type: "Resource",
                                        resource: {
                                            name: "cpu",
                                            targetAverageUtilization: options.params.metrics[oneMetric].percent
                                        }
                                    };
                                }

                                return callback(null, resource);
                            }, (error, metrics) => {
                                if(deployer.autoscaling && deployer.autoscaling.version === 'v2alpha1') {
                                    hpa.spec.metrics = metrics;
                                }
                                else if(deployer.autoscaling && deployer.autoscaling.version === 'v1') {
                                    //NOTE: only cpu metric is supported for now
                                    hpa.spec.targetCPUUtilizationPercentage  = metrics[0].resource.targetAverageUtilization;
                                }
                                deployer.autoscaling.namespaces(namespace).hpa.put({ name: options.params.id, body: hpa }, (error) => {
                                    utils.checkError(error, 677, cb, () => {
                                        return cb(null, true);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    },

    /**
     * Function that deletes a deployment's autoscaler
     * @param  {Object}   options Options passed to function
     * @param  {Function} cb      Callback function
     * @return {void}
     */
    deleteAutoscaler (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {

                let validInput = (options.params && options.params.id);
                utils.checkError(!validInput, 674, cb, () => {
                    let namespace = lib.buildNameSpace(options);
                    deployer.autoscaling.namespaces(namespace).hpa.delete({ name: options.params.id }, (error) => {
                        utils.checkError(error, 678, cb, () => {
                            return cb(null, true);
                        });
                    });
                });
            });
        });
    }

};

module.exports = engine;
