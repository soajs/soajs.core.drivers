'use strict';

const utils = require('../../utils/utils.js');
const lib = require('./utils.js');
const wrapper = require('./wrapper.js');

const engine = {
	
	/**
	 * Create a secret
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	createPVC(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let check = !options.params.name;
				utils.checkError(check, 570, cb, () => {
					let pvc = {
						"kind": 'PersistentVolumeClaim',
						"apiVersion": 'v1',
						"metadata": {
							"name": options.params.name,
							"labels": {
								'soajs.persistentVolumeClaim.name': options.params.name
							}
						},
						"spec": {
							"accessModes" : options.params.accessModes,
							"resources": {
								"requests": {
									"storage": options.params.storage || '1Gi'
								}
							},
							"storageClassName": options.params.storageClassName || "standard",
							"volumeMode": options.params.volumeMode || "Filesystem"
						}
					};
					//support any namespace
					lib.checkNameSpace(deployer, options, cb, function (error, namespace) {
						wrapper.pvc.post(deployer, {body: pvc, namespace: namespace}, function (error, response) {
							utils.checkError(error, 584, cb, () => {
								return cb(null, {
									name: response.metadata.name,
									namespace: response.metadata.namespace,
									uid: response.metadata.uid,
									storage: response.spec.resources.requests.storage,
									accessModes: response.spec.accessModes,
									storageClassName: response.spec.storageClassName,
									volumeMode: response.spec.volumeMode
								});
							});
						});
					});
				});
			});
		});
	},
	
	/**
	 * delete a secret
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	deletePVC(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				lib.checkNameSpace(deployer, options, cb, function (error, namespace) {
					wrapper.pvc.delete(deployer, {
						name: options.params.name,
						namespace: namespace
					}, function (error) {
						utils.checkError(error, 583, cb, () => {
							return cb(null, true);
						});
					});
				});
			});
		});
	},
	
	/**
	 * list secrets
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	listPVCs(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				if (options.params && options.params.namespace) {
					lib.checkNameSpace(deployer, options, cb, function (error, namespace) {
						wrapper.pvc.get(deployer, {namespace: namespace}, function (error, pvcs) {
							utils.checkError(error, 582, cb, () => {
								return cb(null, lib.buildPVCRecord(pvcs));
							});
						});
					});
				}
				else {
					wrapper.pvc.get(deployer, {}, function (error, pvcs) {
						utils.checkError(error, 582, cb, () => {
							return cb(null, lib.buildPVCRecord(pvcs));
						});
					});
				}
			});
		});
	},
	
	/**
	 * list secrets
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	getPVC(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				lib.checkNameSpace(deployer, options, cb, function (error, namespace) {
					wrapper.pvc.get(deployer, {name: options.params.name, namespace: namespace}, function (error, response) {
						utils.checkError(error, 585, cb, () => {
							return cb(null, {
								name: response.metadata.name,
								namespace: response.metadata.namespace,
								uid: response.metadata.uid,
								storage: response.spec.resources.requests.storage,
								accessModes: response.spec.accessModes,
								storageClassName: response.spec.storageClassName,
								volumeMode: response.spec.volumeMode
							});
						});
					});
				});
			});
		});
	}
};

module.exports = engine;