/* jshint esversion: 6 */

"use strict";

const kubeNodes = require('./nodes.js');
const kubeNamespace = require('./namespace.js');
const kubeServices = require('./services.js');
const kubeTasks = require('./task.js');
const kubeAutoscale = require('./autoscale.js');
const kubeApi = require('./api.js');
const kubeSecrets = require('./secrets.js');
const kubeMetrics = require('./metrics.js');

const engine = {

	'inspectCluster': function(options, cb){
		return cb(null, {});
	},

	'addNode': function(options, cb){
		return cb(null, true);
	},

    'removeNode': function(options, cb){
        kubeNodes.removeNode(options, cb);
    },

    'updateNode': function(options, cb){
        kubeNodes.updateNode(options, cb);
    },

	'inspectNode': function(options, cb){
		kubeNodes.inspectNode(options, cb);
	},

	'listNodes': function(options, cb){
		kubeNodes.listNodes(options, cb);
	},

    'listServices': function(options, cb){
        kubeServices.listServices(options, cb);
    },

    'deployService': function(options, cb){
        kubeServices.deployService(options, cb);
    },

    'redeployService': function(options, cb){
        kubeServices.redeployService(options, cb);
    },

	'scaleService': function(options, cb){
		kubeServices.scaleService(options, cb);
	},

    'inspectService': function(options, cb){
        kubeServices.inspectService(options, cb);
    },

    'findService': function(options, cb){
        kubeServices.findService(options, cb);
    },

    'deleteService': function(options, cb){
        kubeServices.deleteService(options, cb);
    },

    'inspectTask': function(options, cb){
	    kubeTasks.inspectTask(options, cb);
    },

    'getContainerLogs': function(options, cb){
	    kubeTasks.getContainerLogs(options, cb);
    },

    'maintenance': function(options, cb){
	    kubeTasks.maintenance(options, cb);
    },

    'getLatestVersion': function(options, cb){
        kubeServices.getLatestVersion(options, cb);
    },

    'getServiceHost': function(options, cb){
        kubeServices.getServiceHost(options, cb);
    },
	
	'getNodesMetrics': function(options, cb){
		kubeMetrics.getNodesMetrics(options, cb);
	},
	
	'getServicesMetrics': function(options, cb){
		kubeMetrics.getServicesMetrics(options, cb);
	},

	'getSecret': function(options, cb){
		kubeSecrets.getSecret(options, cb);
	},

	'createSecret': function(options, cb){
		kubeSecrets.createSecret(options, cb);
	},

	'deleteSecret': function(options, cb){
		kubeSecrets.deleteSecret(options, cb);
	},

	'listSecrets': function(options, cb){
		kubeSecrets.listSecrets(options, cb);
	},
	
	'createNameSpace' : function(options, cb) {
		kubeNamespace.createNameSpace(options, cb);
	},
	
	'listNameSpaces' : function(options, cb){
		kubeNamespace.listNameSpaces(options, cb);
	},
	
	'deleteNameSpace' : function(options, cb){
		kubeNamespace.deleteNameSpace(options, cb);
	},
	
	'listKubeServices': function(options, cb) {
		kubeServices.listKubeServices(options, cb);
	},
	
	'getAutoscaler': function(options, cb) {
		kubeAutoscale.getAutoscaler(options, cb);
	},
	
	'createAutoscaler': function(options, cb) {
		kubeAutoscale.createAutoscaler(options, cb);
	},
	
	'updateAutoscaler': function(options, cb) {
		kubeAutoscale.updateAutoscaler(options, cb);
	},
	
	'deleteAutoscaler': function(options, cb) {
		kubeAutoscale.deleteAutoscaler(options, cb);
	},
	
	'manageResources': function(options, cb) {
		kubeApi.manageResources(options, cb);
	}

};

module.exports = engine;
