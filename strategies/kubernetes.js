/*jshint esversion: 6 */

"use strict";

const kubeNodes = require('../strategyFunctions/kubeNodes.js');
const kubeServices = require('../strategyFunctions/kubeServices');
const errorFile = require('../utils/errors.js');

const engine = {
    'inspectNode': function(options, cb){
        kubeNodes.inspectNode(options, cb);
    },

    'listNodes': function(options, cb){
        kubeNodes.listNodes(options, cb);
    },

    'removeNode': function(options, cb){
        kubeNodes.removeNode(options, cb);
    },

    'updateNode': function(options, cb){
        kubeNodes.updateNode(options, cb);
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

    'listServices': function(options, cb){
        kubeServices.listServices(options, cb);
    },

    'deployService': function(options, cb){
        kubeServices.deployService(options, cb);
    },

    'scaleService': function(options, cb){
        kubeServices.scaleService(options, cb);
    },

    'redeployService': function(options, cb){
        kubeServices.redeployService(options, cb);
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
};

module.exports = engine;
