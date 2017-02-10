'use strict';

const utils = require('../utils/utils.js');
const lib = utils.swarmLib;

const errorFile = require('../utils/errors.js');

const async = require('async');
const request = require('request');
const gridfsColl = 'fs.files';

var engine = {
    /**
     * List services/deployments currently available
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    listServices (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let params = {};
                if (options.params && options.params.env && !options.params.custom) {
                    params.filters = { label: [ 'soajs.content=true', 'soajs.env.code=' + options.params.env ] };
                }

                deployer.listServices(params, (error, services) => {
                    utils.checkError(error, 549, cb, () => {
                        /*
                         NOTE: swarm api does not support filtering based on the inequality of specific labels
                         for example: soajs.content != true can't be used to get all non-soajs services
                         filtering of custom services is done manually for now until support is added
                         */
                        if (options.params && options.params.custom) {
                            async.filter(services, (oneService, callback) => {
                                return callback(null, (!oneService.Spec || !oneService.Spec.Labels || !oneService.Spec.Labels['soajs.content']));
                            }, (error, services) => {
                                processServicesData(deployer, services, cb);
                            });
                        }
                        else {
                            processServicesData(deployer, services, cb);
                        }
                    });
                });
            });
        });

        function processServicesData(deployer, services, cb) {
            async.map(services, (oneService, callback) => {
                let record = lib.buildServiceRecord({ service: oneService });

                if (options.params && options.params.excludeTasks) {
                    return callback(null, record);
                }

                let params = {
                    filters: { service: [oneService.Spec.Name] }
                };
                deployer.listTasks(params, (error, serviceTasks) => {
                    if (error) {
                        return callback(error);
                    }

                    async.map(serviceTasks, (oneTask, callback) => {
                        return callback(null, lib.buildTaskRecord({ task: oneTask, serviceName: oneService.Spec.Name }));
                    }, (error, tasks) => {
                        if (error) {
                            return callback(error);
                        }

                        record.tasks = tasks;
                        return callback(null, record);
                    });
                });
            }, cb);
        }
    },

    /**
     * Creates a new deployment for a SOAJS service
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deployService (options, cb) {
        let payload = utils.cloneObj(require(__dirname + '/../schemas/swarm/service.template.js'));
        options.params.variables.push('SOAJS_DEPLOY_HA=swarm');
        options.params.variables.push('SOAJS_HA_NAME={{.Task.Name}}');

        payload.Name = options.params.name;
        payload.TaskTemplate.ContainerSpec.Image = options.params.image;
        payload.TaskTemplate.ContainerSpec.Env = options.params.variables;
        payload.TaskTemplate.ContainerSpec.Dir = ((options.params.containerDir) ? options.params.containerDir : "");
        payload.TaskTemplate.ContainerSpec.Command = [options.params.cmd[0]];
        payload.TaskTemplate.ContainerSpec.Args = options.params.cmd.splice(1);
        payload.TaskTemplate.Resources.Limits.MemoryBytes = options.params.memoryLimit;
        payload.TaskTemplate.RestartPolicy.Condition = options.params.restartPolicy.condition;
        payload.TaskTemplate.RestartPolicy.MaxAttempts = options.params.restartPolicy.maxAttempts;
        payload.Mode[options.params.replication.mode.charAt(0).toUpperCase() + options.params.replication.mode.slice(1)] = {};
        payload.Networks[0].Target = ((options.params.network) ? options.params.network : "");
        payload.Labels = options.params.labels;
        payload.EndpointSpec = { Mode: 'vip' , ports: [] };

        //NOTE: bind docker unix socket only for controller deployments, required tp proxy requests
        //NOTE: static values are set, no need to make it dynamic for now
        if (options.params.labels['soajs.service.name'] === 'controller') {
            payload.TaskTemplate.ContainerSpec.Mounts.push({
                "Type": "bind",
                "ReadOnly": true,
                "Source": "/var/run/docker.sock",
                "Target": "/var/run/docker.sock",
            });
        }

        if (options.params.replication.mode === 'replicated') {
            payload.Mode.Replicated.Replicas = options.params.replication.replicas;
        }

        if (options.params.volume) {
            payload.TaskTemplate.ContainerSpec.Mounts.push({
                Type: options.params.volume.type,
                ReadOnly: options.params.volume.readOnly,
                Source: options.params.volume.source,
                Target: options.params.volume.target,
            });
        }

        if (options.params.ports && options.params.ports.length > 0) {
            options.params.ports.forEach((onePortEntry) => {
                if (onePortEntry.isPublished) {
                    payload.EndpointSpec.ports.push({
                        Protocol: 'tcp',
                        TargetPort: onePortEntry.target,
                        PublishedPort: onePortEntry.published
                    });
                }
            });
        }

        if (process.env.SOAJS_TEST) {
            //using lightweight image and commands to optimize travis builds
            //the purpose of travis builds is to test the dashboard api, not the docker containers
            payload.TaskTemplate.ContainerSpec.Image = 'alpine:latest';
            payload.TaskTemplate.ContainerSpec.Command = ['sh'];
            payload.TaskTemplate.ContainerSpec.Args = ['-c', 'sleep 36000'];
        }

        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                deployer.createService(payload, (error, service) => {
                    utils.checkError(error, 662, cb, () => {
                        return cb(null, service);
                    });
                });
            });
        });
    },

    /**
     * Redeploy a service
     * This update process is simulated by adding/replacing a dummy environment variables that automatically triggers a redeploy command for all service containers
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    redeployService (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let service = deployer.getService(options.params.id);
                service.inspect((error, serviceInfo) => {
                    utils.checkError(error, 550, cb, () => {
                        let update = serviceInfo.Spec;
                        update.version = serviceInfo.Version.Index;

                        if (!update.TaskTemplate) update.TaskTemplate = {};
                        if (!update.TaskTemplate.ContainerSpec) update.TaskTemplate.ContainerSpec = {};
                        if (!update.TaskTemplate.ContainerSpec.Env) update.TaskTemplate.ContainerSpec.Env = [];

                        update.TaskTemplate.ContainerSpec.Env.push('SOAJS_REDEPLOY_TRIGGER=true');
                        if (options.params.ui) { //in case of rebuilding nginx, pass custom ui environment variables
                            update.TaskTemplate.ContainerSpec.Env.push('SOAJS_GIT_REPO=' + options.params.ui.repo);
                            update.TaskTemplate.ContainerSpec.Env.push('SOAJS_GIT_OWNER=' + options.params.ui.owner);
                            update.TaskTemplate.ContainerSpec.Env.push('SOAJS_GIT_BRANCH=' + options.params.ui.branch);
                            update.TaskTemplate.ContainerSpec.Env.push('SOAJS_GIT_COMMIT=' + options.params.ui.commit);
                            update.TaskTemplate.ContainerSpec.Env.push('SOAJS_GIT_PROVIDER=' + options.params.ui.provider);
                            update.TaskTemplate.ContainerSpec.Env.push('SOAJS_GIT_DOMAIN=' + options.params.ui.domain);

                            if (options.params.ui.token) {
                                update.TaskTemplate.ContainerSpec.Env.push('SOAJS_GIT_TOKEN=' + options.params.ui.token);
                            }
                        }

                        service.update(update, (error) => {
                            utils.checkError(error, 653, cb, cb.bind(null, null, true));
                        });
                    });
                });
            });
        });
    },

    /**
     * Scales a deployed services up/down depending on current replica count and new one
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    scaleService (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                //NOTE: not using engine.inspectService() since the required info are not included in its response
                let service = deployer.getService(options.params.id);
                service.inspect((error, serviceInfo) => {
                    utils.checkError(error, 550, cb, () => {
                        let update = serviceInfo.Spec;
                        update.version = serviceInfo.Version.Index;
                        update.Mode.Replicated.Replicas = options.params.scale;
                        service.update(update, (error) => {
                            utils.checkError(error, 551, cb, () => {
                                return cb(null, true);
                            });
                        });
                    });
                });
            });
        });
    },

    /**
     * Gathers and returns information about specified service and a list of its tasks
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    inspectService (options, cb) { //TODO: test again
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let service = deployer.getService(options.params.id);
                service.inspect((error, serviceInfo) => {
                    utils.checkError(error, 550, cb, () => {
                        let service = lib.buildServiceRecord({ service: serviceInfo });

                        if (options.params.excludeTasks) {
                            return cb(null, { service });
                        }

                        let params = {
                            filters: { service: [options.params.id] }
                        };
                        deployer.listTasks(params, (error, serviceTasks) => {
                            utils.checkError(error, 552, cb, () => {

                                async.map(serviceTasks, (oneTask, callback) => {
                                    return callback(null, lib.buildTaskRecord({ task: oneTask, serviceName: options.params.id }));
                                }, (error, tasks) => {
                                    return cb(null, { service, tasks });
                                });
                            });
                        });
                    });
                });
            });
        });
    },

    /**
     * Takes environment code and soajs service name and returns corresponding swarm service
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    findService (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let params = {
                    filters: { label: [ 'soajs.content=true', 'soajs.env.code=' + options.params.env, 'soajs.service.name=' + options.params.serviceName ] }
                };

                if (options.params.version) {
                    params.filters.label.push('soajs.service.version=' + options.params.version);
                }

                deployer.listServices(params, (error, services) => {
                    utils.checkError(error, 549, cb, () => {
                        utils.checkError(services.length === 0, 661, cb, () => {
                            //NOTE: only one service with the same name and version can exist in a given environment
                            return cb(null, lib.buildServiceRecord({ service: services[0] }));
                        });
                    });
                });
            });
        });
    },

    /**
     * Deletes a deployed service
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deleteService (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let service = deployer.getService(options.params.id);
                service.remove((error) => {
                    utils.checkError(error, 553, cb, () => {
                        return cb(null, true);
                    });
                });
            });
        });
    },

    /**
     * Inspects and returns information about a specified task
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    inspectTask (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let task = deployer.getTask(options.params.taskId);
                task.inspect((error, taskInfo) => {
                    utils.checkError(error, 555, cb, () => {
                        options.params.id = taskInfo.ServiceID;
                        options.params.excludeTasks = true;
                        engine.inspectService(options, (error, service) => {
                            utils.checkError(error, 550, cb, () => {
                                return cb(null, lib.buildTaskRecord({ task: taskInfo, serviceName: service.name }));
                            });
                        });
                    });
                });
            });
        });
    },

    /**
     * Collects and returns a container logs from a specific node
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    getContainerLogs (options, cb) {
        /**
         * 1. inspect task provided as input, get container id and node id
         * 2. inspect target node and get its ip
         * 3. connect to target node and get container logs
         */

        let res = options.res;
        delete options.res;
        lib.getDeployer(options, (error, deployer) => {
            check(error, 540, () => {
                //NOTE: engine.inspectTask() does not return the container status
                let task = deployer.getTask(options.params.taskId);
                task.inspect((error, taskInfo) => {
                    check(error, 555, () => {
                        let containerId = taskInfo.Status.ContainerStatus.ContainerID;
                        let nodeId = taskInfo.NodeID;
                        options.params.id = nodeId;
                        options.deployerConfig.flags = { targetNode: true, swarmMember: true };
                        lib.getDeployer(options, (error, deployer) => {
                            check(error, 540, () => {
                                let container = deployer.getContainer(containerId);
                                let logOptions = {
                                    stdout: true,
                                    stderr: true,
                                    tail: options.params.tail || 400
                                };
                                container.logs(logOptions, (error, logStream) => {
                                    check(error, 537, () => {
                                        let data, chunk;
                                        logStream.setEncoding('utf8');
                                        logStream.on('readable', () => {
                                            while((chunk = logStream.read()) !== null) {
                                                data += chunk.toString('utf8');
                                            }
                                        });

                                        logStream.on('end', () => {
                                            logStream.destroy();
                                            //this if statement is used for test cases.
                                            //originally, the data is returned as a response due to the limitations of angular
                                            if(cb)
                                                return cb(null,data);
                                            return res.jsonp(options.soajs.buildResponse(null, { data }));
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        function check(error, code, cb1) {
            if (error && !cb) {
                return res.jsonp(options.soajs.buildResponse({code: code, msg: errorFile[code]}));
            }
            else if (error && cb) {
                return cb({code: code, msg: errorFile[code]});
            }
            return cb1();
        }
    },

    /**
     * Perform a SOAJS maintenance operation on a given service
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    maintenance (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let params = {
                    filters: { service: [options.params.id] }
                };
                deployer.listTasks(params, (error, tasks) => {
                    utils.checkError(error, 552, cb, () => {
                        async.map(tasks, (oneTask, callback) => {
                            async.detect(oneTask.NetworksAttachments, (oneConfig, callback) => {
                                return callback(null, oneConfig.Network && oneConfig.Network.Spec && oneConfig.Network.Spec.Name === options.params.network);
                            }, (error, networkInfo) => {
                                let taskInfo = {
                                    id: oneTask.ID,
                                    networkInfo: networkInfo
                                };
                                return callback(null, taskInfo);
                            });
                        }, (error, targets) => {
                            async.map(targets, (oneTarget, callback) => {
                                if (!oneTarget.networkInfo || !oneTarget.networkInfo.Addresses || oneTarget.networkInfo.Addresses.length === 0) {
                                    return callback(null, {
                                        result: false,
                                        ts: new Date().getTime(),
                                        error: {
                                            msg: 'Unable to get the ip address of the container'
                                        }
                                    });
                                }
                                let oneIp = oneTarget.networkInfo.Addresses[0].split('/')[0];
                                let requestOptions = {
                                    uri: 'http://' + oneIp + ':' + options.params.maintenancePort + '/' + options.params.operation,
                                    json: true
                                };
                                request.get(requestOptions, (error, response, body) => {
                                    let operationResponse = {
                                        id: oneTarget.id,
                                        response: {}
                                    };

                                    if (error) {
                                        operationResponse.response = {
                                            result: false,
                                            ts: new Date().getTime(),
                                            error: error
                                        };
                                    }
                                    else {
                                        operationResponse.response = body;
                                    }
                                    return callback(null, operationResponse);
                                });
                            }, cb);
                        });
                    });
                });
            });
        });
    },

    /**
     * Get the latest version of a deployed service
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    getLatestVersion (options, cb) {
        let latestVersion = 0, v;
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let params = {
                    filters: { label: [ 'soajs.content=true', 'soajs.env.code=' + options.params.env, 'soajs.service.name=' + options.params.serviceName ] }
                };
                deployer.listServices(params, (error, services) => {
                    utils.checkError(error, 549, cb, () => {
                        utils.checkError(services.length == 0, 661, cb, () => {
                            services.forEach((oneService) => {
                                if (oneService.Spec && oneService.Spec.Labels && oneService.Spec.Labels['soajs.service.version']) {
                                    v = parseInt(oneService.Spec.Labels['soajs.service.version']);

                                    if (v > latestVersion) {
                                        latestVersion = v;
                                    }
                                }
                            });

                            return cb(null, latestVersion);
                        });
                    });
                });
            });
        });
    },

    /**
     * Get the domain/host name of a deployed service (per version)
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    getServiceHost (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let params = {
                    filters: { label: [ 'soajs.content=true', 'soajs.env.code=' + options.params.env, 'soajs.service.name=' + options.params.serviceName ] }
                };

                if (options.params.version) {
                    params.filters.label.push('soajs.service.version=' + options.params.version);
                }

                deployer.listServices(params, (error, services) => {
                    utils.checkError(error, 549, cb, () => {
                        if (services.length === 0) {
                            return cb({
                                source: 'driver',
                                value: "error",
                                code: 661,
                                msg: errorFile[661]
                            });
                        }

                        //NOTE: only one service with the same name and version can exist in a given environment
                        return cb(null, services[0].Spec.Name);
                    });
                });
            });
        });
    }
};

module.exports = engine;