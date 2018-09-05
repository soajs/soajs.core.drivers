'use strict';

const images = require('./lib/images');
const maintenance = require('./lib/maintenance');
const disks = require('./lib/disks');
const sizes = require('./lib/sizes');
const vms = require('./lib/vms');

const Terraform = require('./../terraform');

const driver = {

	/**
	 * method used to invoke terraform driver and deploy a vm layer
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	deployCluster: function(options, cb) {
		return Terraform.deployCluster(options, cb);
	},

	/**
	 * method used to invoke terraform driver and update a vm layer
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"updateCluster": function (options, cb) {
		return Terraform.updateCluster(options, cb);
	},

	/**
	 * method used to invoke terraform driver and delete a vm layer
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"deleteCluster": function (options, cb) {
		return Terraform.deleteCluster(options, cb);
	},

	/**
	* Get information about deployed vitual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	inspectService: function (options, cb) {
		return vms.inspect(options, cb);
	},

	/**
	* List available virtual machines by subscription

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listServices: function (options, cb) {
		return vms.list(options, cb);
	},

	/**
	* Delete a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	deleteService: function (options, cb) {
		return maintenance.deleteService(options, cb);
	},

	/**
	* Restart a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	restartService: function (options, cb) {
		return maintenance.restartService(options, cb);
	},

	/**
	* Redeploy a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	redeployService: function (options, cb) {
		return maintenance.redeployService(options, cb);
	},

	/**
	* Turn off a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	powerOffVM: function (options, cb) {
		return maintenance.powerOffVM(options, cb);
	},

	/**
	* Start a virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	startVM: function (options, cb) {
		return maintenance.startVM(options, cb);
	},

	/**
	* Update the tags of one or more virtual machines

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	updateVmLabels: function (options, cb) {
		return vms.updateVmLabels(options, cb);
	},

	/**
	* List available virtual machine sizes

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmSizes: function (options, cb) {
		return sizes.list(options, cb);
	},

	/**
	* List available virtual machine image publishers

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImagePublishers: function (options, cb) {
		return images.listVmImagePublishers(options, cb);
	},

	/**
	* List available virtual machine image publisher images

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImagePublisherOffers: function (options, cb) {
		return images.listVmImagePublisherOffers(options, cb);
	},

	/**
	* List available virtual machine image versions

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImageVersions: function (options, cb) {
		return images.listVmImageVersions(options, cb);
	},

	/**
	* Execute a command inside a running virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	runCommand: function(options, cb) {
		return maintenance.runCommand(options, cb);
	},

	/**
	* Get logs of a running virtual machine

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	getLogs: function(options, cb) {
		return maintenance.getLogs(options, cb);
	},

	/**
	* List data/os disks of a resource group

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listDisks: function (options, cb){
		return disks.list(options, cb);
	},

	/**
	 * List data/os disks of a resource group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	createDisks: function (options, cb){
		return disks.create(options, cb);
	},

	/**
	 * List data/os disks of a resource group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	updateDisks: function (options, cb){
		return disks.update(options, cb);
	},

	/**
	 * List data/os disks of a resource group

	 * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
	 */
	deleteDisks: function (options, cb){
		return disks.delete(options, cb);
	}

};

module.exports = driver;
