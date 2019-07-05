"use strict";
const WebSocket = require('ws');
const async = require('async');

const utils = require('../../utils/utils.js');
const lib = require('./utils.js');

const parse = require('parse-large-json')
const maxChunkSize = 100e3;

var engine = {
	
	/**
	 * Gathers and returns information about a specified pod in a namespace
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	inspectTask(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let namespace = lib.buildNameSpace(options);
				deployer.core.namespaces(namespace).pods.get({name: options.params.taskId}, (error, pod) => {
					utils.checkError(error, 656, cb, () => {
						return cb(null, lib.buildPodRecord({pod}));
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
	getContainerLogs(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let params = {
					qs: {
						tailLines: options.params.tail || 400,
						follow: options.params.follow || false
					}
				};
				let namespace = lib.buildNameSpace(options);
				deployer.core.namespaces(namespace).pods.get({name: options.params.taskId}, (error) => {
					utils.checkError(error, 656, cb, () => {
						if (options.params.follow) {
							let stream = deployer.core.namespaces(namespace).pods(options.params.taskId).log.getStream(params);
							return cb(null, stream);
						}
						else {
							deployer.core.namespaces(namespace).pods(options.params.taskId).log.get(params, (error, logs) => {
								utils.checkError(error, 537, cb, () => {
									return cb(null, logs);
								});
							});
						}
					});
				});
			});
		});
	},
	
	/**
	 * Perform a SOAJS maintenance operation on a given service in a namespace
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	maintenance(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let filter = {
					labelSelector: 'soajs.service.label=' + options.params.id //kubernetes references content by name not id, therefore id field is set to content name
				};
				let namespace = lib.buildNameSpace(options);
				deployer.core.namespaces(namespace).pods.get({qs: filter}, (error, podList) => {
					utils.checkError(error, 659, cb, () => {
						utils.checkError(!podList || !podList.items || podList.items.length === 0, 657, cb, () => {
							async.map(podList.items, (onePod, callback) => {
								process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
								
								function exec(pod, cmd, callback) {
									let response = '', wsError = {}, uri = '';
									
									if (deployer.config && deployer.config.url) {
										uri = `wss://${deployer.config.url.split('//')[1]}`; //remove the https protocol
									}
									
									uri += `/api/v1/namespaces/${namespace}/pods/${pod}/exec?`;
									uri += 'stdout=1&stdin=1&stderr=1';
									cmd.forEach(subCmd => uri += `&command=${encodeURIComponent(subCmd)}`);
									
									let wsOptions = {};
									wsOptions.payload = 1024;
									if (deployer.config && deployer.config.auth && deployer.config.auth.bearer) {
										wsOptions.headers = {
											'Authorization': `Bearer ${deployer.config.auth.bearer}`
										}
									}
									try {
										let ws = new WebSocket(uri, "base64.channel.k8s.io", wsOptions);
										ws.on('message', (data) => {
											if (data[0].match(/^[0-3]$/)) {
												response += Buffer.from(data.slice(1), 'base64').toString();
											}
										});
										
										ws.on('error', (error) => {
											console.log(error);
											wsError = error;
										});
										
										ws.on('close', () => {
											if (wsError && Object.keys(wsError).length > 0) {
												return callback({
													result: false,
													ts: new Date().getTime(),
													error: {
														msg: 'An error occured when trying to reach the target container'
													}
												});
											}
											response = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);
											///console.log(response)
											let operationResponse = {
												id: onePod.metadata.name,
												response: {}
											};
											
											try {
												parse(response.toString(), maxChunkSize).then(({val, rest}) => {
													if (rest) {
														console.log("Unable to parse maintenance operation output");
														operationResponse.response = true;
														return callback(operationResponse);
													}
													operationResponse.response = val;
													return callback(operationResponse);
												});
											}
											catch (e) {
												console.log("Unable to parse maintenance operation output");
												operationResponse.response = true;
												return callback(operationResponse);
											}
										});
									}
									catch (e) {
										return callback(e);
									}
								}
								exec(onePod.metadata.name, ['/bin/bash', '-c', `curl -s -X GET http://localhost:${options.params.maintenancePort}/${options.params.operation}`], (response) => {
										return callback(null, response);
									}
								)
							}, cb);
						});
					});
				});
			});
		});
	}
};

module.exports = engine;