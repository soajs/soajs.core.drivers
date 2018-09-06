'use strict';

const utilGlobal = require("../../../lib/utils/utils");
const randomString = require("randomstring");

function runCorrespondingDriver(method, options, cb) {
	utilGlobal.runCorrespondingDriver(method, options, '', cb);
}

const driver = {

    "authenticate": function(options, cb){
        options.technology = options.strategy;
        runCorrespondingDriver('authenticate', options, cb);
	},

	"getExtras": function(options, cb) {
        options.technology = options.strategy;
        runCorrespondingDriver('getExtras', options, cb);
	},

	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getRegions": function(options, cb){
        options.technology = options.strategy;
        runCorrespondingDriver('getRegions', options, cb);
	},

	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deployCluster": function (options, cb) {
        options.technology = options.strategy;
        runCorrespondingDriver('deployCluster', options, cb);
	},

	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getDeployClusterStatus": function (options, cb) {
        options.technology = options.strategy;
        runCorrespondingDriver('getDeployClusterStatus', options, cb);
	},

	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getDNSInfo": function (options, cb) {
        options.technology = options.strategy;
        runCorrespondingDriver('getDNSInfo', options, cb);
	},

	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"scaleCluster": function (options, cb) {
        options.technology = options.strategy;
        runCorrespondingDriver('scaleCluster', options, cb);
	},

	/**
	 * @param options
	 * @param cb
	 */
	"getCluster": function (options, cb) {
        options.technology = options.strategy;
        runCorrespondingDriver('getCluster', options, cb);
	},

	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"updateCluster": function (options, cb) {
        options.technology = options.strategy;
        runCorrespondingDriver('updateCluster', options, cb);
	},

	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deleteCluster": function (options, cb) {
        options.technology = options.strategy;
        runCorrespondingDriver('deleteCluster', options, cb);
	},

	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"publishPorts": function (options, cb) {
        options.technology = options.strategy;
        runCorrespondingDriver('publishPorts', options, cb);
	},

	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */

	"createLoadBalancer": function (options, cb) {
        options.technology = options.strategy;
        runCorrespondingDriver('createLoadBalancer', options, cb);
	},

	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"updateLoadBalancer": function (options, cb) {
        options.technology = options.strategy;
        runCorrespondingDriver('updateLoadBalancer', options, cb);
	},

	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deleteLoadBalancer": function (options, cb) {
        options.technology = options.strategy;
        runCorrespondingDriver('deleteLoadBalancer', options, cb);
	}
};

module.exports = driver;
