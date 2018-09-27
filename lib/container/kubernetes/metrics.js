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
				engine.getVersion (deployer, (err, version)=>{
					if (err){
						return cb(null, {});
					}
					if (version === "v1"){
						getMetrics(deployer.metrics, cb);
					}
					else if (version === "v2"){
						getMetrics(deployer.metricsV2, cb);
					}
				});
			});
		});
		
		function getMetrics(deployer, cb) {
			deployer.po.get((error, servicesMetrics) => {
				if (error && error.code === 404) { //NOTE: metrics not found, return empty Object instead of error
					return cb(null, {});
				}
				else {
					utils.checkError((error || !servicesMetrics.items), 688, cb, () => {
						processServicesMetrics(servicesMetrics.items, cb);
					});
				}
			});
		}
		
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
				engine.getVersion (deployer, (err, version)=>{
					if (err){
						return cb(null, {});
					}
					if (version === "v1"){
						getMetrics(deployer.metrics, cb);
					}
					else if (version === "v2"){
						getMetrics(deployer.metricsV2, cb);
					}
				});
			});
		});
		
		function getMetrics(metricDeployer, cb) {
			metricDeployer.no.get((error, nodesMetrics) => {
				if (error && error.code === 404) { //NOTE: metrics not found, return empty Array instead of error
					return cb(null, {});
				}
				else {
					utils.checkError((error || !nodesMetrics.items), 688, cb, () => {
						processNodesMetrics(nodesMetrics.items, cb);
					});
				}
			});
		}
		
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
	},
	
	/**
	 * get metric server version
	 * @param deployer
	 * @param cb Callback function
	 */
	getVersion(deployer, cb){
		let filter = {
			labelSelector: 'k8s-app=metrics-server'
		};
		deployer.extensions.deployments.get({qs: filter}, (error, deploymentList) => {
			utils.checkError(error, 536, cb, () => {
				if (deploymentList && deploymentList.items && deploymentList.items.length > 0) {
					if (deploymentList.items[0]
						&& deploymentList.items[0].metadata
						&& deploymentList.items[0].metadata.labels
						&& deploymentList.items[0].metadata.labels.version) {
						let version = deploymentList.items[0].metadata.labels.version;
						version = version.replace("v", "");
						try {
							if (parseFloat(version) >= 0.2) {
								return cb(null, "v2");
							}
							else {
								return cb(null, "v1");
							}
						}
						catch (e) {
							return cb(null, "v1");
						}
					}
					else {
						return cb(null, "v1");
					}
				}
				else {
					return cb(new Error("Metric server not found!"));
				}
			});
		});
	}
};

module.exports = engine;
