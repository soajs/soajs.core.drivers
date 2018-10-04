'use strict';

const groups = require('./cluster/groups.js');
const ips = require('./cluster/ips.js');
const loadBalancers = require('./cluster/lb.js');
const networks = require('./cluster/networks.js');
const securityGroups = require('./cluster/securityGroups.js');
const subnets = require('./cluster/subnets.js');
const utils = require('../../lib/utils/utils.js');
const helper = require('./helper.js');
const driverUtils = require('./utils/index.js');

const defaultDriver = 'vm';

function runCorrespondingDriver(method, options, cb) {
	utils.runCorrespondingDriver(method, options, defaultDriver, cb);
}

const driver = {

	"authenticate": function (options, cb) {
		driverUtils.authenticate(options, (error) => {
			utils.checkError(error, 700, cb, () => {
				return cb(null, true);
			});
		});
	},

	"getExtras": function (options, cb) {
		return cb(null, {technologies: ['vm'], templates: ['local'], drivers: ['Terraform'], providerSpecific: [ 'groups' ]});
	},

	"getDeployClusterStatus": function (options, cb) {
		return cb(null, true);
	},

	"getDNSInfo": function (options, cb) {
		return cb(null, true);
	},

	"getRegions": function (options, cb) {
		options.returnCredentials = true;
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				let opts = {
					subscriptionId: options.infra.api.subscriptionId,
					bearerToken: authData.credentials.tokenCache._entries[0].accessToken
				};

				helper.listRegions(opts, function(error, regions) {
					utils.checkError(error, 713, cb, () => {
						return cb(null, (regions) ? {"regions": regions }  : []);
					});
				});
			});
		});
	},

	"listAvailabilityZones": function (options, cb) {
		return cb(null, true);
	},

	"scaleCluster": function (options, cb) {
		return cb(null, true);
	},

	"getCluster": function (options, cb) {
		return cb(null, true);
	},

	"publishPorts": function (options, cb) {
		return cb(null, true);
	},

	/**
	 * List available Networks

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	listNetworks: function (options, cb) {
		return networks.list(options, cb);
	},

	/**
	 * Create network

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	createNetwork: function (options, cb) {
		return networks.create(options, cb);
	},

	/**
	 * Update network

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	updateNetwork: function (options, cb) {
		return networks.update(options, cb);
	},

	/**
	 * Delete network

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	deleteNetwork: function (options, cb) {
		return networks.delete(options, cb);
	},

	/**
	 * List available loadbalancers

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	listLoadBalancers: function (options, cb) {
		return loadBalancers.list(options, cb);
	},

	/**
	 * Create loadbalancer

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	createLoadBalancer: function (options, cb) {
		return loadBalancers.create(options, cb);
	},

	/**
	 * Update loadbalancer

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	updateLoadBalancer: function (options, cb) {
		return loadBalancers.update(options, cb);
	},

	/**
	 * Delete loadbalancer

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	deleteLoadBalancer: function (options, cb) {
		return loadBalancers.delete(options, cb);
	},

	/**
	 * List available subnets

	 * @param  {Object}   options  Data passed to function listsubas params
	 * @param  {Function} cb    Callback fspub
	 * @return {void}listsub
	 */
	listSubnets: function (options, cb) {
		return subnets.list(options, cb);
	},

	/**
	 * Create subnet

	 * @param  {Object}   options  Data passed to function listsubas params
	 * @param  {Function} cb    Callback fspub
	 * @return {void}listsub
	 */
	createSubnet: function (options, cb) {
		return subnets.create(options, cb);
	},

	/**
	 * Update subnet

	 * @param  {Object}   options  Data passed to function listsubas params
	 * @param  {Function} cb    Callback fspub
	 * @return {void}listsub
	 */
	updateSubnet: function (options, cb) {
		return subnets.update(options, cb);
	},

	/**
	 * Delete subnet

	 * @param  {Object}   options  Data passed to function listsubas params
	 * @param  {Function} cb    Callback fspub
	 * @return {void}listsub
	 */
	deleteSubnet: function (options, cb) {
		return subnets.delete(options, cb);
	},

	/**
	 * List available securitygroups

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	listSecurityGroups: function (options, cb) {
		return securityGroups.list(options, cb);
	},

	/**
	 * Get existing security group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	getSecurityGroup: function (options, cb) {
		return securityGroups.get(options, cb);
	},

	/**
	 * Create security group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	createSecurityGroup: function (options, cb) {
		return securityGroups.create(options, cb);
	},

	/**
	 * Update security group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	updateSecurityGroup: function (options, cb) {
		return securityGroups.update(options, cb);
	},

	/**
	 * Delete security group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	deleteSecurityGroup: function (options, cb) {
		return securityGroups.delete(options, cb);
	},

	/**
	 * Sync ports from catalog recipe to selected security groups

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	syncPortsFromCatalogRecipe: function(options, cb) {
		return securityGroups.syncPortsFromCatalogRecipe(options, cb);
	},

	/**
	 * List available public ips

	 * @param  {Object}   options
	 * @param  {Function} cb
	 * @return {void}
	 */
	listPublicIps: function (options, cb) {
		return ips.list(options, cb);
	},

	/**
	 * Create public ip

	 * @param  {Object}   options
	 * @param  {Function} cb
	 * @return {void}
	 */
	createPublicIp: function (options, cb) {
		return ips.create(options, cb);
	},

	/**
	 * Update public ip

	 * @param  {Object}   options
	 * @param  {Function} cb
	 * @return {void}
	 */
	updatePublicIp: function (options, cb) {
		return ips.update(options, cb);
	},

	/**
	 * Delete public ip

	 * @param  {Object}   options
	 * @param  {Function} cb
	 * @return {void}
	 */
	deletePublicIp: function (options, cb) {
		return ips.delete(options, cb);
	},

	/**
	 * List available resource groups

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	listGroups: function(options, cb) {
		return groups.list(options, cb);
	},

	/**
	 * Create a resource group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	createGroup: function (options, cb) {
		return groups.create(options, cb);
	},

	/**
	 * Update a resource group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	updateGroup: function (options, cb) {
		return groups.update(options, cb);
	},

	/**
	 * Delete a resource group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	deleteGroup: function (options, cb) {
		return groups.delete(options, cb);
	},

	/**
	 * list roles

	 * @param  {Object}   options
	 * @param  {Function} cb
	 * @return {void}
	 */
	listRoles: function (options, cb) {
		return cb(null, true);
	},

	"executeDriver": function(method, options, cb){
		runCorrespondingDriver(method, options, cb);
	}
};

module.exports = driver;
