"use strict";

const async = require('async');
const utils = require('../../utils/utils.js');
const lib = require('./utils.js');


var engine = {
	
	/**
	 * Creates a new namespace
	 * @param options
	 * @param cb
	 */
	createNameSpace(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				deployer.core.namespaces.get({}, function (error, namespacesList) {
					utils.checkError(error, 670, cb, () => {
						let namespaceName = lib.buildNameSpace(options);
						async.detect(namespacesList.items, function (oneNamespace, callback) {
							return callback(null, oneNamespace.metadata.name === namespaceName);
						}, function (error, foundNamespace) {
							utils.checkError(foundNamespace, 672, cb, () => {
								let namespace = {
									kind: 'Namespace',
									apiVersion: 'v1',
									metadata: {
										name: namespaceName,
										labels: {
											'soajs.content': 'true',
											'name': namespaceName
										}
									}
								};
								deployer.core.namespace.post({body: namespace}, cb);
							});
						});
					});
				});
			});
		});
	},
	
	/**
	 * Returns a list of namespaces in the kubernetes cluster
	 * @param options
	 * @param cb
	 */
	listNameSpaces(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				deployer.core.namespaces.get({}, function (error, namespacesList) {
					utils.checkError(error, 670, cb, () => {
						async.map(namespacesList.items, function (oneNamespace, callback) {
							return callback(null, lib.buildNameSpaceRecord(oneNamespace));
						}, cb);
					});
				});
			});
		});
	},
	
	/**
	 * Deletes a namespace
	 * @param options
	 * @param cb
	 */
	deleteNameSpace(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let namespaceName = lib.buildNameSpace(options);
				
				deployer.core.namespaces.delete({name: namespaceName}, function (error, namespacesList) {
					utils.checkError(error, 671, cb, () => {
						return cb(null, namespacesList.items);
					});
				});
			});
		});
	}
};

module.exports = engine;