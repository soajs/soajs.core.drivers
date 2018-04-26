/* jshint esversion: 6 */
'use strict';

const async = require('async');
const utils = require('../../utils/utils.js');
const lib = require('./utils.js');

const engine = {
	
	/**
	 * Function that gets Services Metrics
	 * @param  {Object}   options Options passed to function
	 * @param  {Function} cb      Callback function
	 * @returns {*}
	 */
	getServicesMetrics(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				deployer.metrics.po.get((error, servicesMetrics) => {
					if (error && error.code === 404) { //NOTE: metrics not found, return empty Object instead of error
						return cb(null, {});
					}
					else {
						utils.checkError((error || !servicesMetrics.items), 688, cb, () => {
							processServicesMetrics(servicesMetrics.items, cb);
						});
					}
				});
			});
		});
		
		function processServicesMetrics(metrics, cb) {
			let servicesMetrics = {};
			async.each(metrics, (oneMetric, callback) => {
				let usage = {
					cpu: 0,
					memory: 0
				};
				async.each(oneMetric.containers, (oneContainer, callback) => {
					try {
						usage.cpu += parseInt(oneContainer.usage.cpu.replace("m", ""));
						// convert memory from ki to Bytes.
						usage.memory += parseInt(oneContainer.usage.memory.replace("ki", "")) * 1024;
						usage.timestamp = oneMetric.metadata.creationTimestamp;
					}
					catch (e) {
						return callback(e);
					}
					callback();
				}, function (error) {
					servicesMetrics[oneMetric.metadata.name] = usage;
					callback(error);
				});
				
			}, function (error) {
				utils.checkError(error, 688, cb, () => {
					cb(error, servicesMetrics);
				});
			});
		}
	},
	
	/**
	 * Function that gets Nodes Metrics
	 * @param  {Object}   options Options passed to function
	 * @param  {Function} cb      Callback function
	 * @returns {*}
	 */
	getNodesMetrics(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				deployer.metrics.no.get((error, nodesMetrics) => {
					if (error && error.code === 404) { //NOTE: metrics not found, return empty Array instead of error
						return cb(null, {});
					}
					else {
						utils.checkError((error || !nodesMetrics.items), 688, cb, () => {
							processNodesMetrics(nodesMetrics.items, cb);
						});
					}
				});
			});
		});
		
		function processNodesMetrics(metrics, cb) {
			let servicesMetrics = {};
			async.each(metrics, (oneMetric, callback) => {
				let usage = {
					cpu: 0,
					memory: 0
				};
				try {
					usage.cpu += parseInt(oneMetric.usage.cpu.replace("m", ""));
					// convert memory from ki to Bytes.
					usage.memory += parseInt(oneMetric.usage.memory.replace("ki", "")) * 1024;
					usage.timestamp = oneMetric.metadata.creationTimestamp;
				}
				catch (e) {
					return callback(e);
				}
				servicesMetrics[oneMetric.metadata.name] = usage;
				callback();
			}, function (error) {
				utils.checkError(error, 688, cb, () => {
					cb(error, servicesMetrics);
				});
			});
		}
	}
};

module.exports = engine;
