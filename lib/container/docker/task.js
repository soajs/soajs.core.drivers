"use strict";
const async = require('async');
const request = require('request');

const utils = require('../../utils/utils.js');
const lib = require('./utils');

var engine = {
	
	/**
	 * Inspects and returns information about a specified task
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	inspectTask(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let task = deployer.getTask(options.params.taskId);
				task.inspect((error, taskInfo) => {
					utils.checkError(error, 555, cb, () => {
						options.params.id = taskInfo.ServiceID;
						options.params.excludeTasks = true;
						engine.inspectService(options, (error, service) => {
							utils.checkError(error, 550, cb, () => {
								return cb(null, lib.buildTaskRecord({task: taskInfo, serviceName: service.name}));
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
	getContainerLogs(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let task = deployer.getTask(options.params.taskId);
				let logOptions = {
					stdout: true,
					stderr: true,
					tail: options.params.tail || 400,
					follow: options.params.follow || false
				};
				task.defaultOptions = {log: {}};
				task.logs(logOptions, (error, data) => {
					utils.checkError(error, 537, cb, () => {
						if (options.params.follow) {
							//return stream object
							return cb(null, data);
						}
						else {
							//return logs inside object
							return cb(null, {data});
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
	maintenance(options, cb) {
		if (options && options.deployerConfig && options.deployerConfig.auth && options.deployerConfig.auth.token) {
			return engine.maintenanceApi(options, cb);
		}
		
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				getNodes(deployer, (error, nodesList) => {
					getTasks(deployer, (error, tasksList) => {
						async.map(tasksList, (oneTask, callback) => {
							if (!(oneTask.Status && oneTask.Status.ContainerStatus && oneTask.Status.ContainerStatus.ContainerID && oneTask.Status.State === 'running')) {
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
								if (!taskNode) {
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
									if (error) {
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
										container.exec({Cmd: command, AttachStdout: true}, (error, exec) => {
											if (error) return callback(error);
											
											exec.start({}, (error, stream) => {
												if (error) return callback(error);
												
												let out = '';
												stream.setEncoding('utf8');
												stream.on('data', (data) => {
													out += data;
												});
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
													catch (e) {
														console.log("Unable to parse maintenance operation output");
														operationResponse.response = true;
														return callback(null, operationResponse);
													}
												});
												stream.on('error', (error) => {
													return callback(error);
												});
											});
										});
									}
									
									let command = [`curl`, '-s', `-X`, `GET`, `http://localhost:${options.params.maintenancePort}/${options.params.operation}`];
									return exec(oneTask.containerId, command, (error, response) => {
										if (error) {
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
			let params = {filters: {service: [options.params.id]}};
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
	}
};

module.exports = engine;