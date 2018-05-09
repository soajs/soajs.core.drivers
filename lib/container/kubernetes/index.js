/* jshint esversion: 6 */

"use strict";

const kubeNodes = require('./nodes.js');
const kubeServices = require('./services.js');
const kubeAutoscale = require('./autoscale.js');
const kubeApi = require('./api.js');
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
        kubeServices.inspectTask(options, cb);
    },

    'getContainerLogs': function(options, cb){
        kubeServices.getContainerLogs(options, cb);
    },

    'maintenance': function(options, cb){
        kubeServices.maintenance(options, cb);
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
		kubeServices.getSecret(options, cb);
	},

	'createSecret': function(options, cb){
		kubeServices.createSecret(options, cb);
	},

	'deleteSecret': function(options, cb){
		kubeServices.deleteSecret(options, cb);
	},

	'listSecrets': function(options, cb){
		kubeServices.listSecrets(options, cb);
	},
	
	'createNameSpace' : function(options, cb) {
		kubeServices.createNameSpace(options, cb);
	},
	
	'listNameSpaces' : function(options, cb){
		kubeServices.listNameSpaces(options, cb);
	},
	
	'deleteNameSpace' : function(options, cb){
		kubeServices.deleteNameSpace(options, cb);
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
