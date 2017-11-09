/* jshint esversion: 6 */
'use strict';

const utils = require('../utils/utils.js');
const lib = require('../utils/swarm.js');
const async = require('async');

const engine = {
	/**
	 * Function that gets Services Metrics
	 * @param  {Object}   options Options passed to function
	 * @param  {Function} cb      Callback function
	 * @returns {*}
	 */
	getServicesMetrics(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				deployer.listNodes((error, nodesList) => {
					utils.checkError(error, 540, cb, () => {
						async.concat(nodesList, (oneNode, callback) => {
							options.params = {};
							options.params.targetHost = oneNode.Status.Addr;
							lib.getDeployer(options, (error, deployer) => {
								utils.checkError(error, 540, cb, () => {
									deployer.listContainers({}, (error, containers) => {
										utils.checkError(error, 688, cb, () => {
											let params = {
												"stream": false
											};
											async.map(containers, (oneContainer, callback) => {
												let container = deployer.getContainer(oneContainer.Id);
												container.stats(params, (error, containerStats) => {
													callback(error, containerStats);
												});
											}, callback);
										});
									});
								});
							});
						}, (error, stats) => {
							utils.checkError(error, 688, cb, () => {
								processServicesMetrics(stats, cb);
							});
						});
						
					});
				});
			});
		});
		
		function processServicesMetrics(stats, cb) {
			let servicesMetrics = {};
			async.each(stats, (oneStat, callback) => {
				let usage = {
					cpuPercent: 0.00,
					memory: 0.00
				};
				try {
					const containerName = oneStat.name.replace(/^\//, "");
					usage.cpuPercent = getCPU(oneStat);
					usage.online_cpus = oneStat.precpu_stats.online_cpus;
					usage.memory = oneStat.memory_stats.usage;
					usage.memoryLimit = oneStat.memory_stats.limit;
					usage.memPercent = (usage.memory / usage.memoryLimit * 100).toFixed(2);
					usage.timestamp = oneStat.read;
					if(oneStat.blkio_stats.io_service_bytes_recursive){
						getBlockIO(oneStat.blkio_stats.io_service_bytes_recursive, usage);
					}
					if(oneStat.networks) {
						getNetIO(oneStat.networks, usage);
					}
					servicesMetrics[containerName] = usage;
				}
				catch (e) {
					return callback(e);
				}
				callback();
			}, function (error) {
				utils.checkError(error, 688, cb, () => {
					cb(error, servicesMetrics);
				});
			});
		}
		
		
		function getCPU(oneStat) {
			const postCpuStats = oneStat.cpu_stats;
			const preCpuStats = oneStat.precpu_stats;
			const cpuDelta = preCpuStats.cpu_usage.total_usage - postCpuStats.cpu_usage.total_usage;
			const systemDelta = preCpuStats.system_cpu_usage - postCpuStats.system_cpu_usage;
			const cpuPercent = ((cpuDelta / systemDelta) * preCpuStats.online_cpus * 100).toFixed(2);
			return isNaN(cpuPercent) ? 0 : cpuPercent
		}
		
		function getBlockIO(blk, usage) {
			blk.forEach(function (oneBlk) {
				if (oneBlk.op && (oneBlk.op === 'Read' || oneBlk.op === 'Write')) {
					usage["blk" + oneBlk.op] = oneBlk.value;
				}
			});
		}
		
		function getNetIO(nets, usage) {
			usage.netIn = 0;
			usage.netOut = 0;
			for (let oneNet in nets) {
				if (nets.hasOwnProperty(oneNet)) {
					if (nets[oneNet].hasOwnProperty("rx_bytes")) {
						usage.netIn += nets[oneNet].rx_bytes;
					}
					if (nets[oneNet].hasOwnProperty("tx_bytes")) {
						usage.netOut += nets[oneNet].tx_bytes;
					}
				}
			}
		}
	},
};

module.exports = engine;
