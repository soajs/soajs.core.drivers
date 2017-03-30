/* jshint esversion: 6 */
'use strict';

const utils = require('../utils/utils.js');
const lib = require('../utils/kubernetes.js');

const errorFile = require('../utils/errors.js');

const async = require('async');
const request = require('request');
var utilLog = require('util');
const gridfsColl = 'fs.files';

var engine = {

    /**
     * Creates a new namespace
     * @param options
     * @param cb
     */
    createNameSpace (options, cb){
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {
                deployer.core.namespaces.get({}, function (error, namespacesList) {
                    utils.checkError(error, 670, cb, () => {
                        let namespaceName = lib.buildNameSpace(options);
                        async.detect(namespacesList.items, function (oneNamespace, callback) {
                            return callback(null, oneNamespace.metadata.name === namespaceName);
                        }, function (error, foundNamespace) {
                            utils.checkError(foundNamespace, 672, cb, () => {
                                utilLog.log('Creating a new namespace: ' + namespaceName + ' ...');
                                var namespace = {
                                    kind: 'Namespace',
                                    apiVersion: 'v1',
                                    metadata: {
                                        name: namespaceName,
                                        labels: {
                                            'soajs.content': 'true',
                                            'name': namespaceName
                                        }
                                    }
                                };
                                deployer.core.namespace.post({body: namespace}, cb);
                            });
                        });
                    });
                });
            });
        });
    },

    /**
     * Returns a list of namespaces in the kubernetes cluster
     * @param options
     * @param cb
     */
    listNameSpaces (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {
                deployer.core.namespaces.get({}, function (error, namespacesList) {
                    utils.checkError(error, 670, cb, () => {
                        async.map(namespacesList.items, function (oneNamespace, callback) {
                            return callback(null, lib.buildNameSpaceRecord(oneNamespace));
                        }, function (error, namespaces) {
                            return cb(null, namespaces);
                        });
                    });
                });
            });
        });
    },

    /**
     * Deletes a namespace
     * @param options
     * @param cb
     */
    deleteNameSpace (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {
                let namespaceName = lib.buildNameSpace(options);

                deployer.core.namespaces.delete({name: namespaceName}, function (error, namespacesList) {
                    utils.checkError(error, 671, cb, () => {
                        return cb(null, namespacesList.items);
                    });
                });
            });
        });
    },

    /**
     * List services of all namespaces
     * @param {Object} options
     * @param {Function} cb
     *
     */
    listServices (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {
                let filter = {};
                if (options.params && options.params.env && !options.params.custom) {
                    filter = {
                        labelSelector: 'soajs.content=true, soajs.env.code=' + options.params.env.toLowerCase()
                    };
                }
                else if (options.params && options.params.custom) {
                    filter = {
                        labelSelector: 'soajs.content != true'
                    };
                }
                //get deployments from all namespaces
                deployer.extensions.deployments.get({qs: filter}, (error, deploymentList) => {
                    utils.checkError(error, 536, cb, () => {
                        //get daemonset from all namespaces
                        deployer.extensions.daemonsets.get({qs: filter}, (error, daemonsetList) => {
                            utils.checkError(error, 663, cb, () => {
                                let deployments = [];
                                if (deploymentList && deploymentList.items) deployments = deployments.concat(deploymentList.items);
                                if (daemonsetList && daemonsetList.items) deployments = deployments.concat(daemonsetList.items);

                                async.map(deployments, (oneDeployment, callback) => {
                                    let filter = {};
                                    if (options.params && options.params.env && !options.params.custom) {
                                        filter.labelSelector = 'soajs.content=true, soajs.env.code=' + options.params.env.toLowerCase() + ', soajs.service.label= ' + oneDeployment.metadata.name;
                                    }
                                    else if (options.params && options.params.custom) {
                                        if (oneDeployment.spec && oneDeployment.spec.selector && oneDeployment.spec.selector.matchLabels) {
                                            filter.labelSelector = lib.buildLabelSelector(oneDeployment.spec.selector);
                                        }
                                    }
                                    //get services from all namespaces
                                    deployer.core.services.get({qs: filter}, (error, serviceList) => {
                                        if (error) {
                                            return callback(error);
                                        }

                                        let service = {};
                                        if (serviceList && serviceList.items && Array.isArray(serviceList.items) && serviceList.items.length > 0) {
                                            service = serviceList.items[0];
                                        }

                                        let record = lib.buildDeploymentRecord({ deployment: oneDeployment , service });

                                        if (options.params && options.params.excludeTasks) {
                                            return callback(null, record);
                                        }

                                        //get pods from all namespaces
                                        deployer.core.pods.get({qs: filter}, (error, podsList) => {
                                            if (error) {
                                                return callback(error);
                                            }

                                            async.map(podsList.items, (onePod, callback) => {
                                                if (options.params && !options.params.custom) {
                                                    return callback(null, lib.buildPodRecord({ pod: onePod }));
                                                }
                                                else { //custom services do not include soajs labels that identify deployment name
                                                    return callback(null, lib.buildPodRecord({ pod: onePod, deployment: oneDeployment }));
                                                }
                                            }, (error, pods) => {
                                                if (error) {
                                                    return callback(error);
                                                }

                                                record.tasks = pods;
                                                return callback(null, record);
                                            });
                                        });
                                    });
                                }, cb);
                            });
                        });
                    });
                });
            });
        });
    },

    /**
     * Creates a new deployment for a SOAJS service inside a namespace
     *
     * @param {Object} options
     * @param {Function} cb
     *
     */
    deployService (options, cb) {
        options.params.variables.push('SOAJS_DEPLOY_HA=kubernetes');

        let service = utils.cloneObj(require(__dirname + '/../schemas/kubernetes/service.template.js'));
        service.metadata.name = cleanLabel(options.params.name) + '-service';

        service.metadata.labels = options.params.labels;
        service.spec.selector = { 'soajs.service.label': options.params.labels['soajs.service.label'] };

        let ports = [];
        if (options.params.ports && options.params.ports.length > 0) {
            options.params.ports.forEach((onePortEntry, portIndex) => {
                let portConfig = {
                    protocol: 'TCP',
                    name: onePortEntry.name || 'port' + portIndex,
                    port: onePortEntry.target,
                    targetPort: onePortEntry.target
                };

                if (onePortEntry.isPublished) {
                	if(options.deployerConfig.nginxDeployType === 'LoadBalancer'){
			            service.spec.type = 'LoadBalancer';
		                delete portConfig.nodePort;
	                }
	                else{
		                if (!service.spec.type || service.spec.type !== 'NodePort') {
			                service.spec.type = 'NodePort';
		                }
		                portConfig.nodePort = onePortEntry.published;
	                }

                    portConfig.name = onePortEntry.name || 'published' + portConfig.name;
                }

                ports.push(portConfig);
            });

            service.spec.ports = ports;
        }
        let payload = {};
        if (options.params.replication.mode === 'deployment') {
            let deploymentSchemaPath = __dirname + '/../schemas/kubernetes/deployment.template.js';
            if (require.resolve(deploymentSchemaPath)) {
                delete require.cache[require.resolve(deploymentSchemaPath)];
            }
            payload = utils.cloneObj(require(deploymentSchemaPath));
            options.params.type = 'deployment';
        }
        else if (options.params.replication.mode === 'daemonset') {
            let daemonsetSchemaPath = __dirname + '/../schemas/kubernetes/daemonset.template.js';
            if (require.resolve(daemonsetSchemaPath)) {
                delete require.cache[require.resolve(daemonsetSchemaPath)];
            }
            payload = utils.cloneObj(require(daemonsetSchemaPath));
            options.params.type = 'daemonset';
        }

        payload.metadata.name = cleanLabel(options.params.name);
        payload.metadata.labels = options.params.labels;
        payload.metadata.labels['soajs.service.label'] = cleanLabel(payload.metadata.labels['soajs.service.label']);

        if (options.params.type === 'deployment') {
            payload.spec.replicas = options.params.replication.replicas;
        }

        payload.spec.selector.matchLabels = { 'soajs.service.label': cleanLabel(options.params.labels['soajs.service.label']) };
        payload.spec.template.metadata.name = cleanLabel(options.params.labels['soajs.service.name']);
        payload.spec.template.metadata.labels = options.params.labels;
        //NOTE: only one container is being set per pod
        payload.spec.template.spec.containers[0].name = cleanLabel(options.params.labels['soajs.service.name']);
        payload.spec.template.spec.containers[0].image = options.params.image;
        payload.spec.template.spec.containers[0].workingDir = ((options.params.containerDir) ? options.params.containerDir : '');
        payload.spec.template.spec.containers[0].command = [options.params.cmd[0]];
        payload.spec.template.spec.containers[0].args = options.params.cmd.splice(1);
        payload.spec.template.spec.containers[0].env = lib.buildEnvList({ envs: options.params.variables });

        if (options.params.memoryLimit) {
            payload.spec.template.spec.containers[0].resources = {
                limits: {
                    memory: options.params.memoryLimit
                }
            };
        }

        if (ports && ports.length > 0) {
            payload.spec.template.spec.containers[0].ports = [];
            ports.forEach((onePort) => {
                payload.spec.template.spec.containers[0].ports.push({
                    name: onePort.name,
                    containerPort: onePort.port
                });
            });
        }

        //NOTE: only one volume is supported for now
        if (options.params.volume) {
            payload.spec.volumes.push({
                name: options.params.volume.name,
                hostPath: {
                    path: options.params.volume.source
                }
            });

            payload.spec.template.spec.containers[0].volumeMounts.push({
                mountPath: options.params.volume.target,
                name: options.params.volume.name
            });
        }

        if (options.params.readinessProbe) {
            payload.spec.template.spec.containers[0].readinessProbe = { httpGet: {} };
            if (options.params.labels && options.params.labels.hasOwnProperty('soajs.service.type')) {
                if (options.params.labels['soajs.service.type'] === 'service' || options.params.labels['soajs.service.type'] === 'daemon') {
                    payload.spec.template.spec.containers[0].readinessProbe.httpGet.path = '/heartbeat';
                    payload.spec.template.spec.containers[0].readinessProbe.httpGet.port = 'maintenance';
                }
                else if (options.params.labels['soajs.service.type'] === 'nginx') {
                    payload.spec.template.spec.containers[0].readinessProbe.httpGet.path = '/';
                    payload.spec.template.spec.containers[0].readinessProbe.httpGet.port = 'http';
                }
            }
            else {
                //NOTE: in case of deploying a custom service, the values will be supplied by the user
                payload.spec.template.spec.containers[0].readinessProbe.httpGet.path = options.params.readinessProbe.path || '/';
                payload.spec.template.spec.containers[0].readinessProbe.httpGet.port = options.params.readinessProbe.port;
            }

            payload.spec.template.spec.containers[0].readinessProbe.initialDelaySeconds = options.params.readinessProbe.initialDelaySeconds;
            payload.spec.template.spec.containers[0].readinessProbe.timeoutSeconds = options.params.readinessProbe.timeoutSeconds;
            payload.spec.template.spec.containers[0].readinessProbe.periodSeconds = options.params.readinessProbe.periodSeconds;
            payload.spec.template.spec.containers[0].readinessProbe.successThreshold = options.params.readinessProbe.successThreshold;
            payload.spec.template.spec.containers[0].readinessProbe.failureThreshold = options.params.readinessProbe.failureThreshold;
        }

        //Check if SSL is enabled and if the user specified a secret name
        if (options.params.labels['soajs.service.type'] === 'nginx') {
            if (options.params.ssl && options.params.ssl.enabled && options.params.ssl.secret) {
                payload.spec.template.spec.volumes.push({
                    name: 'ssl',
                    secret: {
                        secretName: options.params.ssl.secret
                    }
                });

                payload.spec.template.spec.containers[0].volumeMounts.push({
                    name: 'ssl',
                    mountPath: '/etc/soajs/ssl',
                    readOnly: true
                });
            }
        }

        let namespace = null;

        if(options.params.namespace){
            namespace = options.params.namespace;
        } else{
            options.params.serviceCreation = true;
            namespace = lib.buildNameSpace(options);
        }
        //namespace to be checked by initNamespace function
        options.checkNamespace = namespace;

        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                initNamespace(deployer, options, function(error){
                    deployer.core.namespaces(namespace).services.post({ body: service }, (error) => {
                        utils.checkError(error, 525, cb, () => {
                            deployer.extensions.namespaces(namespace)[options.params.type].post({ body: payload }, (error) => {
                                utils.checkError(error, 526, cb, cb.bind(null, null, true));
                            });
                        });
                    });
                });
            });
        });

        function cleanLabel(label) {
            return label.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
        }

        function initNamespace(deployer, options, cb) {
            //options.namespace
            //1. check if namespace already exists. if it does, return true
            //2. if namespace does not exist create it and return true
            deployer.core.namespaces.get({}, function (error, namespacesList) {
                if (error) return cb(error);

                async.detect(namespacesList.items, function (oneNamespace, callback) {
                    return callback(null, oneNamespace.metadata.name === options.checkNamespace);
                }, function (error, foundNamespace) {
                    if (foundNamespace) {
                        return cb(null, true);
                    }

                    var namespace = {
                        kind: 'Namespace',
                        apiVersion: 'v1',
                        metadata: {
                            name: options.checkNamespace,
                            labels: {
                                'soajs.content': 'true'
                            }
                        }
                    };
                    deployer.core.namespace.post({body: namespace}, cb);
                });
            });
        }
    },

    /**
     * Scales a deployed service in a specific namespace up/down depending on current replica count and new one
     * @param {Object} options
     * @param {Function} cb
     *
     */
    scaleService (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {
                let namespace = lib.buildNameSpace(options);
                deployer.extensions.namespaces(namespace).deployments.get({name: options.params.id}, (error, deployment) => {
                    utils.checkError(error, 536, cb, () => {
                        deployment.spec.replicas = options.params.scale;
                        deployer.extensions.namespaces(namespace).deployments.put({name: options.params.id, body: deployment}, (error, result) => {
                            utils.checkError(error, 527, cb, cb.bind(null, null, true));
                        });
                    });
                });
            });
        });
    },

    /**
     * Redeploy a service in a namespace
     *
     * @param {Object} options
     * @param {Function} cb
     *
     */
    redeployService (options, cb) {
        let contentType = options.params.mode;
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {
                let namespace = lib.buildNameSpace(options);
                deployer.extensions.namespaces(namespace)[contentType].get({name: options.params.id}, (error, deployment) => {
                    utils.checkError(error, 536, cb, () => {
                        let check = (deployment.spec && deployment.spec.template && deployment.spec.template.spec && deployment.spec.template.spec.containers && deployment.spec.template.spec.containers[0]);
                        utils.checkError(!check, 653, cb, () => {
                            if (!deployment.spec.template.spec.containers[0].env) deployment.spec.template.spec.containers[0].env = [];
                            deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_REDEPLOY_TRIGGER', value: 'true' });

                            if (options.params.ui) { //in case of rebuilding nginx, pass custom ui environment variables
                                deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_REPO', value: options.params.ui.repo });
                                deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_OWNER', value: options.params.ui.owner });
                                deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_BRANCH', value: options.params.ui.branch });
                                deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_COMMIT', value: options.params.ui.commit });
                                deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_COMMIT', value: options.params.ui.commit });
                                deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_PROVIDER', value: options.params.ui.provider });
                                deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_DOMAIN', value: options.params.ui.domain });

                                if (options.params.ui.token) {
                                    deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_GIT_TOKEN', value: options.params.ui.token });
                                }
                            }

                            if (options.params.ssl) {
                                //Check if SSL is enabled and if the user specified a secret name
                                if (options.params.ssl.enabled) {
                                    deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_NX_API_HTTPS', value: '1' });
                                    deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_NX_API_HTTP_REDIRECT', value: '1' });
                                    deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_NX_SITE_HTTPS', value: '1' });
                                    deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_NX_SITE_HTTP_REDIRECT', value: '1' });

                                    if (deployment.spec.template.spec.containers[0].args.indexOf('-s') === -1) {
                                        deployment.spec.template.spec.containers[0].args.push('-s');
                                    }

                                    if (options.params.ssl.kubeSecret) {
                                        deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_NX_CUSTOM_SSL', value: '1' });
                                        deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_NX_SSL_CERTS_LOCATION', value: '/etc/soajs/ssl' });
                                        deployment.spec.template.spec.containers[0].env.push({ name: 'SOAJS_NX_SSL_SECRET', value: options.params.ssl.secret });

                                        deployment.spec.template.spec.volumes.push({
                                            name: 'ssl',
                                            secret: {
                                                secretName: options.params.ssl.kubeSecret
                                            }
                                        });

                                        deployment.spec.template.spec.containers[0].volumeMounts.push({
                                            name: 'ssl',
                                            mountPath: '/etc/soajs/ssl',
                                            readOnly: true
                                        });
                                    }
                                    else {
                                        let customSSLVars = [ 'SOAJS_NX_CUSTOM_SSL', 'SOAJS_NX_SSL_CERTS_LOCATION', 'SOAJS_NX_SSL_SECRET' ];
                                        for (let i = deployment.spec.template.spec.containers[0].env.length - 1; i <= 0; i--) {
                                            let oneVar = deployment.spec.template.spec.containers[0].env[i];
                                            if (customSSLVars.indexOf(oneVar.name) !== -1) {
                                                deployment.spec.template.spec.containers[0].env.splice(i, 1);
                                            }
                                        }

                                        if (deployment.spec.template.spec.volumes) {
                                            for (let i = 0; i < deployment.spec.template.spec.volumes.length; i++) {
                                                if (deployment.spec.template.spec.volumes[i].name === 'ssl') {
                                                    deployment.spec.template.spec.volumes.splice(i, 1);
                                                    break;
                                                }
                                            }
                                        }

                                        if (deployment.spec.template.spec.containers[0].volumeMounts) {
                                            for (let i = 0; i < deployment.spec.template.spec.containers[0].volumeMounts.length; i++) {
                                                if (deployment.spec.template.spec.containers[0].volumeMounts[i].name === 'ssl') {
                                                    deployment.spec.template.spec.containers[0].volumeMounts.splice(i, 1);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                let sslEnvVars = [ 'SOAJS_NX_API_HTTPS', 'SOAJS_NX_API_HTTP_REDIRECT', 'SOAJS_NX_SITE_HTTPS', 'SOAJS_NX_SITE_HTTP_REDIRECT' ];

                                for (let i = deployment.spec.template.spec.containers[0].env.length - 1; i <= 0; i--) {
                                    let oneVar = deployment.spec.template.spec.containers[0].env[i];
                                    if (sslEnvVars.indexOf(oneVar.name) !== -1) {
                                        deployment.spec.template.spec.containers[0].env.splice(i, 1);
                                    }
                                }

                                if (deployment.spec.template.spec.containers[0].args.indexOf('-s') !== -1) {
                                    deployment.spec.template.spec.containers[0].args.splice(deployment.spec.template.spec.containers[0].args.indexOf('-s'), 1);
                                }
                            }
                            let namespace = lib.buildNameSpace(options);
                            deployer.extensions.namespaces(namespace)[contentType].put({ name: options.params.id, body: deployment }, (error) => {
                                utils.checkError(error, 653, cb, cb.bind(null, null, true));
                            });
                        });
                    });
                });
            });
        });
    },

    /**
     * Gathers and returns information about specified service in a namespace and a list of its tasks/pods
     *
     * @param {Object} options
     * @param {Function} cb
     *
     */
    inspectService (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {
                let namespace = lib.buildNameSpace(options);
                deployer.extensions.namespaces(namespace).deployment.get(options.params.id, (error, deployment) => {
                    utils.checkError(error, 536, cb, () => {
                        let deploymentRecord = lib.buildDeploymentRecord({ deployment });

                        if (options.params.excludeTasks) {
                            return cb(null, { deployment: deploymentRecord });
                        }

                        deployer.core.namespaces(namespace).pods.get({qs: {labelSelector: 'soajs.service.label=' + options.params.id}}, (error, podList) => {
                            utils.checkError(error, 529, cb, () => {
                                async.map(podList.items, (onePod, callback) => {
                                    return callback(null, lib.buildPodRecord({ pod: onePod }));
                                }, (error, pods) => {
                                    return cb(null, { service: deploymentRecord, tasks: pods });
                                });
                            });
                        });
                    });
                });
            });
        });
    },

    /**
     * Takes environment code and soajs service name and returns corresponding swarm service in a namespace
     *
     * @param {Object} options
     * @param {Function} cb
     *
     */
    findService (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {
                let namespace = lib.buildNameSpace(options);

                let filter = {
                    labelSelector: 'soajs.content=true, soajs.env.code=' + options.params.env.toLowerCase() + ', soajs.service.name=' + options.params.serviceName
                };

                if (options.params.version) {
                    filter.labelSelector += ', soajs.service.version=' + options.params.version;
                    if (options.deployerConfig.namespace.perService) {
                        namespace += '-v' + options.params.version;
                    }
                }

                deployer.extensions.namespaces(namespace).deployments.get({qs: filter}, (error, deploymentList) => {
                    utils.checkError(error, 549, cb, () => {
                        deployer.extensions.namespaces(namespace).daemonsets.get({qs: filter}, (error, daemonsetList) => {
                            utils.checkError(error, 663, cb, () => {
                                let deployments = [];
                                if (deploymentList && deploymentList.items && deploymentList.items.length > 0) deployments = deployments.concat(deploymentList.items);
                                if (daemonsetList && daemonsetList.items && daemonsetList.items.length > 0) deployments = deployments.concat(daemonsetList.items);

                                utils.checkError(deployments.length === 0, 657, cb, () => {
                                    deployer.core.namespaces(namespace).services.get({qs: filter}, (error, serviceList) => {
                                        utils.checkError(error, 533, cb, () => {
                                            return cb(null, lib.buildDeploymentRecord ({ deployment: deployments[0], service: serviceList.items[0] }));
                                        });
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
     * Deletes a deployed service, kubernetes deployment, or daemonset in a namespace
     *
     * @param {Object} options
     * @param {Function} cb
     *
     */
    deleteService (options, cb) {
        let contentType = options.params.mode;
        if (contentType === 'deployment') {
            options.params.scale = 0;
            engine.scaleService(options, (error) => {
                utils.checkError(error, 527, cb, () => {
                    deleteContent();
                });
            });
        }
        else {
            deleteContent();
        }

        function deleteContent() {
            lib.getDeployer(options, (error, deployer) => {
                utils.checkError(error, 520, cb, () => {
                    let namespace = lib.buildNameSpace(options);
                    deployer.extensions.namespaces(namespace)[contentType].delete({name: options.params.id, qs: { gracePeriodSeconds: 0 }}, (error) => {
                        utils.checkError(error, 534, cb, () => {
                            let filter = {
                                labelSelector: 'soajs.service.label=' + options.params.id //kubernetes references content by name not id, therefore id field is set to content name
                            };
                            deployer.core.namespaces(namespace).services.get({qs: filter}, (error, servicesList) => { //only one service for a given service can exist
                                utils.checkError(error, 533, cb, () => {
                                    if (servicesList && servicesList.items && servicesList.items.length > 0) {
                                        async.each(servicesList.items, (oneService, callback) => {
                                            deployer.core.namespaces(namespace).services.delete({name: oneService.metadata.name}, callback);
                                        }, (error) => {
                                            utils.checkError(error, 534, cb, () => {
                                                cleanup(deployer, filter);
                                            });
                                        });
                                    }
                                    else {
                                        cleanup(deployer, filter);
                                    }
                                });
                            });
                        });
                    });
                });
            });
        }

        function cleanup(deployer, filter) {
            let namespace = lib.buildNameSpace(options);
            deployer.extensions.namespaces(namespace).replicasets.delete({qs: filter}, (error) => {
                utils.checkError(error, 532, cb, () => {
                    deployer.core.namespaces(namespace).pods.delete({qs: filter}, (error) => {
                        utils.checkError(error, 660, cb, cb.bind(null, null, true));
                    });
                });
            });
        }
    },

    /**
     * Gathers and returns information about a specified pod in a namespace
     *
     * @param {Object} options
     * @param {Function} cb
     *
     */
    inspectTask (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 540, cb, () => {
                let namespace = lib.buildNameSpace(options);
                deployer.core.namespaces(namespace).pods.get({ name: options.params.taskId }, (error, pod) => {
                    utils.checkError(error, 656, cb, () => {
                        return cb(null, lib.buildPodRecord({ pod }));
                    });
                });
            });
        });
    },

    /**
     * Collects and returns a container logs based on a pre-defined 'tail' value
     *
     * @param {Object} options
     * @param {Function} cb
     *
     */
    getContainerLogs (options, cb) {

        let res = options.res;
        delete options.res;
        lib.getDeployer(options, (error, deployer) => {
            check(error, 520, () => {

                let params = {
                    qs: {
                        tailLines: options.params.tail || 400
                    }
                };
                let namespace = lib.buildNameSpace(options);
                deployer.core.namespaces(namespace).pods.get({name: options.params.taskId}, (error, pod) => {
                    check(error, 656, () => {
                        if (pod.spec && pod.spec.containers && pod.spec.containers.length > 0) {
                            let controllerContainer = {};
                            for (let i = 0; i < pod.spec.containers.length; i++) {
                                if (pod.spec.containers[i].name.indexOf('controller') !== -1) {
                                    controllerContainer = pod.spec.containers[i];
                                    break;
                                }
                            }

                            if (controllerContainer) {
                                params.qs.container = controllerContainer.name;
                            }


                            deployer.core.namespaces(namespace).pods(options.params.taskId).log.get(params, (error, logs) => {
                                check(error, 537, () => {
                                    if(cb)
                                        return cb(null,logs);
                                    return res.jsonp(options.soajs.buildResponse(null, { data: logs }));
                                });
                            });
                        }
                    });
                });
            });
        });

        function check(error, code, cb1) {
            if (error && !cb) {
                console.log (error);
                return res.jsonp(options.soajs.buildResponse({code: code, msg: errorFile[code]}));
            }
            else if (error && cb) {
                console.log (error);
                return cb({code: code, msg: errorFile[code]});
            }
            return cb1();
        }
    },

    /**
     * Perform a SOAJS maintenance operation on a given service in a namespace
     *
     * @param {Object} options
     * @param {Function} cb
     *
     */
    maintenance (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {
                let filter = {
                    labelSelector: 'soajs.service.label=' + options.params.id //kubernetes references content by name not id, therefore id field is set to content name
                };
                let namespace = lib.buildNameSpace(options);
                deployer.core.namespaces(namespace).pods.get({qs: filter}, (error, podsList) => {
                    utils.checkError(error, 659, cb, () => {
                        utils.checkError(!podsList || !podsList.items || podsList.items.length === 0, 657, cb, () => {
                            async.map(podsList.items, (onePod, callback) => {
                                let podInfo = {
                                    id: onePod.metadata.name,
                                    ipAddress: ((onePod.status && onePod.status.podIP) ? onePod.status.podIP : null)
                                };
                                return callback(null, podInfo);
                            }, (error, targets) => {
                                async.map(targets, (oneTarget, callback) => {
                                    if (!oneTarget.ipAddress) {
                                        return callback(null, {
                                            result: false,
                                            ts: new Date().getTime(),
                                            error: {
                                                msg: 'Unable to get the ip address of the pod'
                                            }
                                        });
                                    }

                                    let requestOptions = {
                                        uri: 'http://' + oneTarget.ipAddress + ':' + options.params.maintenancePort + '/' + options.params.operation,
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
        });
    },

    /**
     * Get the latest version of a deployed service
     * Returns integer: service version
     * @param {Object} options
     * @param {Function} cb
     *
     */
    getLatestVersion (options, cb) {
        let latestVersion = 0;
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {
                let filter = {
                    labelSelector: 'soajs.content=true, soajs.env.code=' + options.params.env.toLowerCase() + ', soajs.service.name=' + options.params.serviceName
                };

                //NOTE: this function cannot include a namespace while accessing the kubernetes api
                //NOTE: namespace contains version but since this function's role is to get the version, adding the version to the namespace is impossible
                let namespaceRegExp;
                if (options.deployerConfig.namespace.perService) {
                    namespaceRegExp = new RegExp(options.deployerConfig.namespace.default + '-.*', 'g');
                }
                else {
                    namespaceRegExp = new RegExp(options.deployerConfig.namespace.default, 'g');
                }

                deployer.extensions.deployments.get({qs: filter}, (error, deploymentList) => {
                    utils.checkError(error, 536, cb, () => {
                        deployer.extensions.daemonsets.get({qs: filter}, (error, daemonsetList) => {
                            utils.checkError(error, 663, cb, () => {
                                let deployments = [];
                                if (deploymentList && deploymentList.items && deploymentList.items.length > 0) deployments = deployments.concat(deploymentList.items);
                                if (daemonsetList && daemonsetList.items && daemonsetList.items.length > 0) deployments = deployments.concat(daemonsetList.items);

                                utils.checkError(deployments.length === 0, 657, cb, () => {
                                    async.filter(deployments, (oneDeployment, callback) => {
                                        return callback(null, (oneDeployment.metadata.namespace.match(namespaceRegExp)));
                                    }, function (error, namespaceDeployments) {
                                        namespaceDeployments.forEach((oneDeployment) => {
                                            if (oneDeployment.metadata && oneDeployment.metadata.labels && oneDeployment.metadata.labels['soajs.service.version']) {
                                                let v = oneDeployment.metadata.labels['soajs.service.version'];

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
                });
            });
        });
    },

    /**
     * Get the domain/host name of a deployed service (per version)
     *
     * @param {Object} options
     * @param {Function} cb
     *
     */
    getServiceHost (options, cb) {
        lib.getDeployer(options, (error, deployer) => {
            utils.checkError(error, 520, cb, () => {
                let namespace = lib.buildNameSpace(options);

                let filter = {
                    labelSelector: 'soajs.content=true, soajs.env.code=' + options.params.env.toLowerCase() + ', soajs.service.name=' + options.params.serviceName
                };

                if (options.params.version) {
                    filter.labelSelector += ', soajs.service.version=' + options.params.version;
                    if (options.deployerConfig.namespace.perService) {
                        namespace += '-v' + options.params.version;
                    }
                }

                deployer.core.namespaces(namespace).services.get({qs: filter}, (error, serviceList) => {
                    utils.checkError(error, 549, cb, () => {
                        if (!serviceList || !serviceList.items || serviceList.items.length === 0) {
                            return cb({message: 'Service not found'});
                        }

                        if (!serviceList.items[0].metadata || !serviceList.items[0].metadata.name) {
                            return cb({message: 'Unable to get service host'});
                        }

                        let namespaceName = (serviceList.items[0].metadata.namespace) ? serviceList.items[0].metadata.namespace : 'default';

                        //only one service must match the filter, therefore serviceList will contain only one item
                        return cb(null, serviceList.items[0].metadata.name + '.' + namespaceName);
                    });
                });
            });
        });
    }
};

module.exports = engine;
