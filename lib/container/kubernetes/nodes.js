/* jshint esversion: 6 */
'use strict';

const async = require('async');
const utils = require('../../utils/utils.js');
const lib = require('./utils.js');


var engine = {
	
	/**
	 * Inspect a node in the cluster
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	inspectNode(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				utils.checkError(!options.params || !options.params.id, 655, cb, () => {
					deployer.core.node.get({name: options.params.id}, (error, node) => {
						utils.checkError(error, 655, cb, () => {
							return cb(null, lib.buildNodeRecord({node}));
						});
					});
				});
			});
		});
	},
	
	/**
	 * List nodes in a cluster
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	listNodes(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				deployer.core.nodes.get({}, (error, nodeList) => {
					utils.checkError(error, 521, cb, () => {
						async.map(nodeList.items, (oneNode, callback) => {
							return callback(null, lib.buildNodeRecord({node: oneNode}));
						}, cb);
					});
				});
			});
		});
	},
	
	/**
	 * Removes a node from a cluster
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	removeNode(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				deployer.core.node.delete({name: options.params.id}, (error, res) => {
					utils.checkError(error, 523, cb, () => {
						return cb(null, true);
					});
				});
			});
		});
	},
	
	/**
	 * Updates a node's role or availability
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	updateNode(options, cb) {
		//Only supports availability for now, role update not included yet
		let unschedulable;
		if (options && options.params) {
			if (options.params.availability === 'active') unschedulable = false;
			else if (options.params.availability === 'drain') unschedulable = true;
		}
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				deployer.core.node.get({name: options.params.id}, (error, node) => {
					utils.checkError(error, 655, cb, () => {
						node.spec.unschedulable = unschedulable;
						deployer.core.nodes.put({name: options.params.id, body: node}, (error, res) => {
							utils.checkError(error, 524, cb, () => {
								return cb(null, true);
							});
						});
					});
				});
			});
		});
	},
};

module.exports = engine;
