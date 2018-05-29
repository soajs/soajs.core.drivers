/* jshint esversion: 6 */

"use strict";

const swarmNodes = require('./nodes.js');
const swarmServices = require('./services');
const swarmTasks = require('./task');
const swarmMetrics = require('./metrics');
const swarmSecrets = require('./secrets');

const engine = {
	
	'inspectCluster': function (options, cb) {
		swarmNodes.inspectCluster(options, cb);
	},
	
	'addNode': function (options, cb) {
		swarmNodes.addNode(options, cb);
	},
	
	'removeNode': function (options, cb) {
		swarmNodes.removeNode(options, cb);
	},
	
	'updateNode': function (options, cb) {
		swarmNodes.updateNode(options, cb);
	},
	
	'inspectNode': function (options, cb) {
		swarmNodes.inspectNode(options, cb);
	},
	
	'listNodes': function (options, cb) {
		swarmNodes.listNodes(options, cb);
	},
	
	'listServices': function (options, cb) {
		swarmServices.listServices(options, cb);
	},
	
	'deployService': function (options, cb) {
		swarmServices.deployService(options, cb);
	},
	
	'redeployService': function (options, cb) {
		swarmServices.redeployService(options, cb);
	},
	
	'scaleService': function (options, cb) {
		swarmServices.scaleService(options, cb);
	},
	
	'inspectService': function (options, cb) {
		swarmServices.inspectService(options, cb);
	},
	
	'findService': function (options, cb) {
		swarmServices.findService(options, cb);
	},
	
	'deleteService': function (options, cb) {
		swarmServices.deleteService(options, cb);
	},
	
	'inspectTask': function (options, cb) {
		swarmTasks.inspectTask(options, cb);
	},
	
	'getContainerLogs': function (options, cb) {
		swarmTasks.getContainerLogs(options, cb);
	},
	
	'maintenance': function (options, cb) {
		swarmTasks.maintenance(options, cb);
	},
	
	'getLatestVersion': function (options, cb) {
		swarmServices.getLatestVersion(options, cb);
	},
	
	'getServiceHost': function (options, cb) {
		swarmServices.getServiceHost(options, cb);
	},
	
	'getNodesMetrics': function (options, cb) {
		return cb(null, {});
	},
	
	'getServicesMetrics': function (options, cb) {
		swarmMetrics.getServicesMetrics(options, cb);
	},
	
	'getSecret': function (options, cb) {
		swarmSecrets.getSecret(options, cb);
	},
	
	'createSecret': function (options, cb) {
		swarmSecrets.createSecret(options, cb);
	},
	
	'deleteSecret': function (options, cb) {
		swarmSecrets.deleteSecret(options, cb);
	},
	
	'listSecrets': function (options, cb) {
		swarmSecrets.listSecrets(options, cb);
	},
	
	'createNameSpace': function (options, cb) {
		return cb(null, true);
	},
	
	'listNameSpaces': function (options, cb) {
		return cb(null, []);
	},
	
	'deleteNameSpace': function (options, cb) {
		return cb(null, true);
	},
	
	'listKubeServices': function (options, cb) {
		return cb(null, []);
	},
	
	'getAutoscaler': function (options, cb) {
		return cb(null, {});
	},
	
	'createAutoscaler': function (options, cb) {
		return cb(null, true);
	},
	
	'updateAutoscaler': function (options, cb) {
		return cb(null, true);
	},
	
	'deleteAutoscaler': function (options, cb) {
		return cb(null, true);
	},
	
	'manageResources': function (options, cb) {
		return cb(null, true);
	}
	
};

module.exports = engine;
