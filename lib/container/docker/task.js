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
						engine.inspectService(options, (error, inspect) => {
							utils.checkError(error, 550, cb, () => {
								return cb(null, lib.buildTaskRecord({task: taskInfo, serviceName: inspect.service.name}));
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
					if(error || (response && response.error)) {
						return cb({
							source: 'driver',
							value: error || (response && response.error),
							code: 689,
							msg: 'Unable to perform maintenance operation'
						});
					}

					return cb(null, response);
				});
			});
		});
	}
};

module.exports = engine;
