/* jshint esversion: 6 */

'use strict';

const utils = require('../utils/utils.js');
const lib = require('../utils/swarm.js');

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
                    params.filters = { label: [ 'soajs.env.code=' + options.params.env ] };
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
                                if (!oneService.Spec || !oneService.Spec.Labels) return callback(null, true);
                                if (!oneService.Spec.Labels['soajs.env.code']) return callback(null, true);
                                return callback(null, false);
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
                let record = lib.buildServiceRecord({ service: oneService }, options);

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
                        return callback(null, lib.buildTaskRecord({ task: oneTask, serviceName: oneService.Spec.Name, service: record }));
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
        let serviceSchemaPath = __dirname + '/../schemas/swarm/service.template.js';
        if (require.resolve(serviceSchemaPath)) {
            delete require.cache[require.resolve(serviceSchemaPath)];
        }

        let payload = utils.cloneObj(require(serviceSchemaPath));

        for(let i =0; i < options.params.variables.length; i++){
	        if(options.params.variables[i].indexOf('$SOAJS_DEPLOY_HA') !== -1){
		        options.params.variables[i] = options.params.variables[i].replace("$SOAJS_DEPLOY_HA", "swarm");
	        }

	        if(options.params.variables[i].indexOf('$SOAJS_HA_NAME') !== -1){
		        options.params.variables[i] = options.params.variables[i].replace("$SOAJS_HA_NAME", "{{.Task.Name}}");
	        }
        }

        payload.Name = options.params.name;
        payload.TaskTemplate.ContainerSpec.Image = options.params.image;
        payload.TaskTemplate.ContainerSpec.Env = options.params.variables;
        payload.TaskTemplate.ContainerSpec.Dir = ((options.params.containerDir) ? options.params.containerDir : "");
        payload.TaskTemplate.Resources.Limits.MemoryBytes = options.params.memoryLimit;
        payload.TaskTemplate.RestartPolicy.Condition = options.params.restartPolicy.condition;
        payload.TaskTemplate.RestartPolicy.MaxAttempts = options.params.restartPolicy.maxAttempts;
        payload.Mode[options.params.replication.mode.charAt(0).toUpperCase() + options.params.replication.mode.slice(1)] = {};
        payload.Networks[0].Target = ((options.params.network) ? options.params.network : "");
        payload.Labels = options.params.labels;
        payload.EndpointSpec = { Mode: 'vip' , ports: [] };

        if (options.params.command && Array.isArray(options.params.command) && options.params.command.length > 0) {
            payload.TaskTemplate.ContainerSpec.Command = options.params.command;
        }
        else {
            delete payload.TaskTemplate.ContainerSpec.Command;
        }

        if (options.params.args && Array.isArray(options.params.args) && options.params.args.length > 0) {
            payload.TaskTemplate.ContainerSpec.Args = options.params.args;
        }
        else {
            delete payload.TaskTemplate.ContainerSpec.Args;
        }

        //NOTE: in local deployments, controllers should only be deployed on manager nodes, needed for /proxySocket route
        if(options && options.driver && options.driver.split('.')[1] === 'local') {
            if (options.params.labels['soajs.service.name'] === 'controller') {
                payload.TaskTemplate.Placement = {
                    Constraints: [ 'node.role == manager' ]
                };
            }
        }

        if (options.params.replication.mode === 'replicated') {
            payload.Mode.Replicated.Replicas = options.params.replication.replicas;
        }

        if (options.params.voluming && options.params.voluming.volumes && options.params.voluming.volumes.length > 0) {
            payload.TaskTemplate.ContainerSpec.Mounts = payload.TaskTemplate.ContainerSpec.Mounts.concat(options.params.voluming.volumes);
        }

        if (options.params.ports && options.params.ports.length > 0) {
            options.params.ports.forEach((onePortEntry) => {
                if (onePortEntry.isPublished) {
                    let port = {
                        Protocol: onePortEntry.protocol || 'tcp',
                        TargetPort: onePortEntry.target
                    };

                    if(onePortEntry.published){
	                    port.PublishedPort = onePortEntry.published;
                    }

                    if(onePortEntry.preserveClientIP) {
                        port.PublishMode = 'host';
                    }

                    payload.EndpointSpec.ports.push(port);
                }
            });
        }

        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                deployer.createService(payload, (error, service) => {
                    utils.checkError(error, 662, cb, () => {
                        return cb(null, { id: service.id });
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

                        if (options.params.action === 'redeploy') {
                            update.TaskTemplate.ContainerSpec.Env.push('SOAJS_REDEPLOY_TRIGGER=true');
                            service.update(update, (error) => {
                                utils.checkError(error, 653, cb, cb.bind(null, null, true));
                            });
                        }
                        else if (options.params.action === 'rebuild') {
                            for(let i =0; i < options.params.newBuild.variables.length; i++){
                    	        if(options.params.newBuild.variables[i].indexOf('$SOAJS_DEPLOY_HA') !== -1){
                    		        options.params.newBuild.variables[i] = options.params.newBuild.variables[i].replace("$SOAJS_DEPLOY_HA", "swarm");
                    	        }

                    	        if(options.params.newBuild.variables[i].indexOf('$SOAJS_HA_NAME') !== -1){
                    		        options.params.newBuild.variables[i] = options.params.newBuild.variables[i].replace("$SOAJS_HA_NAME", "{{.Task.Name}}");
                    	        }
                            }

                            update.TaskTemplate.ContainerSpec.Env = options.params.newBuild.variables;
                            update.TaskTemplate.ContainerSpec.Image = options.params.newBuild.image;
                            update.TaskTemplate.ContainerSpec.Command = options.params.newBuild.command;
                            update.TaskTemplate.ContainerSpec.Args = options.params.newBuild.args;
                            update.Labels = options.params.newBuild.labels;
                            update.TaskTemplate.ContainerSpec.Labels = options.params.newBuild.labels;
                            if (options.params.newBuild.voluming && options.params.newBuild.voluming.volumes) {
                                update.TaskTemplate.ContainerSpec.Mounts = options.params.newBuild.voluming.volumes;
                            }

                            if(options.params.newBuild.memoryLimit) {
                                if(!update.TaskTemplate.Resources) update.TaskTemplate.Resources = {};
                                if(!update.TaskTemplate.Resources.Limits) update.TaskTemplate.Resources.Limits = {};
                                if(!update.TaskTemplate.Resources.Limits.MemoryBytes) update.TaskTemplate.Resources.Limits.MemoryBytes = {};
                                update.TaskTemplate.Resources.Limits.MemoryBytes = options.params.newBuild.memoryLimit;
                            }

                            if (options.params.newBuild.ports && options.params.newBuild.ports.length > 0) {
                                if (!update.EndpointSpec) update.EndpointSpec = { Mode: 'vip' };
                                update.EndpointSpec.Ports = [];

                                options.params.newBuild.ports.forEach((onePortEntry) => {
                                    if (onePortEntry.isPublished) {
                                        let port = {
                                            Protocol: onePortEntry.protocol || 'tcp',
                                            TargetPort: onePortEntry.target
                                        };

                                        if(onePortEntry.published){
	                                        port.PublishedPort = onePortEntry.published;
                                        }

                                        if(onePortEntry.preserveClientIP) {
                                            port.PublishMode = 'host';
                                        }

	                                    update.EndpointSpec.Ports.push(port);
                                    }
                                });
                            }

                            service.update(update, (error) => {
                                utils.checkError(error, 653, cb, cb.bind(null, null, true));
                            });
                        }
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
                        let service = lib.buildServiceRecord({ service: serviceInfo }, options);

                        if (options.params.excludeTasks) {
                            return cb(null, { service });
                        }

                        let params = {
                            filters: { service: [options.params.id] }
                        };
                        deployer.listTasks(params, (error, serviceTasks) => {
                            utils.checkError(error, 552, cb, () => {

                                async.map(serviceTasks, (oneTask, callback) => {
                                    return callback(null, lib.buildTaskRecord({ task: oneTask, serviceName: options.params.id, service: service }));
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
                    filters: { label: [ 'soajs.env.code=' + options.params.env, 'soajs.service.name=' + options.params.serviceName ] }
                };

                if (options.params.version) {
                    params.filters.label.push('soajs.service.version=' + options.params.version);
                }

                deployer.listServices(params, (error, services) => {
                    utils.checkError(error, 549, cb, () => {
                        utils.checkError(services.length === 0, 661, cb, () => {
                            //NOTE: only one service with the same name and version can exist in a given environment
                            return cb(null, lib.buildServiceRecord({ service: services[0] }, options));
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
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let task = deployer.getTask(options.params.taskId);
                let logOptions = {
                    stdout: true,
                    stderr: true,
                    tail: options.params.tail || 400,
                    follow: options.params.follow || false
                };
                task.defaultOptions = { log: {} };
                task.logs(logOptions, (error, data) => {
                    utils.checkError(error, 537, cb, () => {
                        if(options.params.follow) {
                            //return stream object
                            return cb(null, data);
                        }
                        else {
                            //return logs inside object
                            return cb(null, { data });
                        }
                    });
                });
            });
        });
    },

    /**
     * Perform a SOAJS maintenance operation on a given service
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    maintenance (options, cb) {
        if(options && options.deployerConfig && options.deployerConfig.auth && options.deployerConfig.auth.token) {
            return engine.maintenanceApi(options, cb);
        }

        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                getNodes(deployer, (error, nodesList) => {
                    getTasks(deployer, (error, tasksList) => {
                        async.map(tasksList, (oneTask, callback) => {
                            if(!(oneTask.Status && oneTask.Status.ContainerStatus && oneTask.Status.ContainerStatus.ContainerID && oneTask.Status.State === 'running')) {
                                return callback(null, {
                                    result: false,
                                    ts: new Date().getTime(),
                                    error: {
                                        msg: 'Unable to get the ip address of the container'
                                    }
                                });
                            }

                            oneTask.containerId = oneTask.Status.ContainerStatus.ContainerID;
                            //get the node record of every task and add it to its record
                            async.detect(nodesList, (oneNode, callback) => {
                                return callback(null, oneTask.NodeID === oneNode.ID && (oneNode.Status && oneNode.Status.State === 'ready' && oneNode.Status.Addr));
                            }, (error, taskNode) => {
                                if(!taskNode) {
                                    return callback(null, {
                                        result: false,
                                        ts: new Date().getTime(),
                                        error: {
                                            msg: 'Unable to get the container\'s node or node is not ready'
                                        }
                                    });
                                }

                                oneTask.nodeRecord = taskNode;
                                options.params.targetHost = oneTask.nodeRecord.Status.Addr;
                                lib.getDeployer(options, (error, targetDeployer) => {
                                    if(error) {
                                        return callback(null, {
                                            result: false,
                                            ts: new Date().getTime(),
                                            error: {
                                                msg: 'Unable to get the container\'s node or node is not ready'
                                            }
                                        });
                                    }

                                    function exec(containerId, cmd, callback) {
                                        let container = targetDeployer.getContainer(containerId);
                                        container.exec({ Cmd: command, AttachStdout: true }, (error, exec) => {
                                            if(error) return callback(error);

                                            exec.start({}, (error, stream) => {
                                                if(error) return callback(error);

                                                let out = '';
                                                stream.setEncoding('utf8');
                                                stream.on('data', (data) => { out += data; });
                                                stream.on('end', () => {
                                                    out = out.toString();
                                                    out = out.substring(out.indexOf('{'), out.lastIndexOf('}') + 1);

                                                    let operationResponse = {
                                                        id: oneTask.ID,
                                                        response: {}
                                                    };

                                                    try {
                                                        out = JSON.parse(out);
                                                        operationResponse.response = out;
                                                        return callback(null, operationResponse);
                                                    }
                                                    catch(e) {
                                                        console.log("Unable to parse maintenance operation output");
                                                        operationResponse.response = true;
                                                        return callback(null, operationResponse);
                                                    }
                                                });
                                                stream.on('error', (error) => { return callback(error); });
                                            });
                                        });
                                    }

                                    let command = [`curl`, '-s', `-X`, `GET`, `http://localhost:${options.params.maintenancePort}/${options.params.operation}`];
                                    return exec(oneTask.containerId, command, (error, response) => {
                                        if(error) {
                                            return callback(null, {
                                                result: false,
                                                ts: new Date().getTime(),
                                                error: {
                                                    msg: 'Unable to perform maintenance operation on container, error: ' + error.message
                                                }
                                            });
                                        }

                                        return callback(null, response);
                                    });
                                });
                            });
                        }, cb);
                    });
                })
            });
        });

        function getNodes(deployer, cb) {
            deployer.listNodes((error, nodesList) => {
                utils.checkError(error, 540, cb, () => {
                    return cb(null, nodesList);
                });
            });
        }

        function getTasks(deployer, cb) {
            let params = { filters: { service: [options.params.id] } };
            deployer.listTasks(params, (error, tasksList) => {
                utils.checkError(error, 552, cb, () => {
                    return cb(null, tasksList);
                });
            });
        }
    },

    /**
     * Perform a SOAJS maintenance operation using cloud api
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    maintenanceApi(options, cb) {
        options.returnApiInfo = true;
        lib.getDeployer(options, (error, deployerInfo) => {
            utils.checkError(error, 540, cb, () => {
                let requestOptions = {
        			uri: `${deployerInfo.host}/maintenance`,
        			headers: {
        				'Content-Type': 'application/json',
                        'token': deployerInfo.token
        			},
        			json: true,
                    qs: options.params
        		};
                request.get(requestOptions, (error, body, response) => {
                    utils.checkError(error, 689, cb, () => {
                        return cb(null, response);
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
                    filters: { label: [ 'soajs.env.code=' + options.params.env, 'soajs.service.name=' + options.params.serviceName ] }
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
                    filters: { label: [ 'soajs.env.code=' + options.params.env, 'soajs.service.name=' + options.params.serviceName ] }
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
                        // return cb(null, services[0].Spec.Name);
                        let vip = null;
                        if (services[0].Endpoint && services[0].Endpoint.VirtualIPs && services[0].Endpoint.VirtualIPs[0]) {
                            vip = services[0].Endpoint.VirtualIPs[0].Addr;
                            if (vip.indexOf('/') !== -1) {
                                vip = services[0].Endpoint.VirtualIPs[0].Addr.split('/')[0];
                            }
                        }
                        return cb(null, vip);
                    });
                });
            });
        });
    }

    /**
     * Get Docker Secret(s)
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    getSecrets (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => { //TODO: change to correct error code not 540

            });
        });
    }

    /**
     * Create Docker Secret
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    createSecret (options, cb) {

    }

    /**
     * Update Docker Secret
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    updateSecret (options, cb) {

    }

    /**
     * Delete Docker Secret
     *
     * @param {Object} options
     * @param {Function} cb
     * @returns {*}
     */
    deleteSecret (options, cb) {

    }
};

module.exports = engine;
