"use strict";

const kubeDriver = require("../../../lib/container/kubernetes/index.js");

let driver = {
	
	/**
	 * Execute Deploy Cluster Pre Operation
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deployClusterPre": function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * Execute Deploy Cluster Post
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deployClusterPost": function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getDeployClusterStatusPre": function (options, cb) {
		return cb(null, true);
	},
	
	/**
	 * This method deploys the default soajsnet for docker
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getDeployClusterStatusPost": function (options, cb) {
		return cb(err, true);
	}
};

Object.assign(driver, kubeDriver);

module.exports = driver;