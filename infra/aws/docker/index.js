"use strict";
const crypto = require('crypto');
const Docker = require('dockerode');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const dockerDriver = require("../../../lib/container/docker/index.js");

let driver = {
	
	/**
	 * Execute Deploy Cluster Pre Operation
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deployClusterPre": function (options, cb) {
		
		options.soajs.log.debug("Generating docker token");
		crypto.randomBytes(1024, function (err, buffer) {
			if (err) {
				return cb(err);
			}
			options.soajs.registry.deployer.container.docker.remote.apiProtocol = 'https';
			options.soajs.registry.deployer.container.docker.remote.apiPort = 32376;
			options.soajs.registry.deployer.container.docker.remote.auth = {
				token: buffer.toString('hex')
			};
			return cb(null, true);
		});
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
		let out = options.out;
		let stack = options.infra.stack;
		
		if (out.ip && stack.options.ElbName) {
			options.soajs.log.debug("Creating SOAJS network.");
			const deployer = new Docker({
				protocol: options.soajs.registry.deployer.container.docker.remote.apiProtocol,
				port: options.soajs.registry.deployer.container.docker.remote.apiPort,
				host: out.ip,
				headers: {
					'token': options.soajs.registry.deployer.container.docker.remote.auth.token
				}
			});
			let networkParams = {
				Name: 'soajsnet',
				Driver: 'overlay',
				Internal: false,
				Attachable: true,
				CheckDuplicate: true,
				EnableIPv6: false,
				IPAM: {
					Driver: 'default'
				}
			};
			
			deployer.createNetwork(networkParams, (err) => {
				if (err && err.statusCode === 403) {
					return cb(null, true);
				}
				return cb(err, true);
			});
		}
		else {
			return cb(null, false);
		}
	}
};

Object.assign(driver, dockerDriver);

module.exports = driver;