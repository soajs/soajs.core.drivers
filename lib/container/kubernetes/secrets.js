
const utils = require('../../utils/utils.js');
const lib = require('./utils.js');

const engine = {
	
	/**
	 * Create a secret
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 *
	 */
	createSecret(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				let check = !options.params.data || !options.params.name || (options.params.data && typeof options.params.data !== 'object')
					|| (options.params.data && typeof options.params.data === 'object' && Object.keys(options.params.data).length === 1 && !options.params.data[options.params.name])
					|| (options.params.data && typeof options.params.data === 'object' && Object.keys(options.params.data).length === 0);
				utils.checkError(check, 570, cb, () => {
					let secret = {
						kind: 'Secret',
						apiVersion: 'v1',
						type: options.params.type || 'Opaque',
						metadata: {
							name: options.params.name,
							labels: {
								'soajs.secret.name': options.params.name,
								'soajs.secret.type': options.params.type === 'kubernetes.io/dockercfg' ? 'Docker-Registry' : 'Opaque'
							}
						},
						stringData: {}
					};
					
					if (Object.keys(options.params.data).length > 1) {
						secret.stringData = options.params.data;
					}
					else {
						secret.stringData[options.params.name] = options.params.data[options.params.name];
					}
					
					//added support for docker registry secrets
					if (secret.type === 'kubernetes.io/dockercfg') {
						if (typeof  options.params.data[options.params.name] === 'string') {
							try {
								options.params.data = JSON.parse(options.params.data[options.params.name]);
							}
							catch (e) {
								return cb(new Error("Invalid Secret Data.."));
							}
						}
						let auth = new Buffer(`${options.params.data.username}:${options.params.data.password}`);
						let data = {
							[options.params.data.server]: {
								username: options.params.data.username,
								password: options.params.data.password,
								email: options.params.data.email,
								auth: auth.toString("base64"),
							}
						};
						secret.stringData = {[".dockercfg"]: JSON.stringify(data)};
					}
					//support any namespace
					lib.checkNameSpace(deployer, options, cb, function (error, namespace) {
						deployer.core.namespaces(namespace).secrets.post({body: secret}, function (error, secret) {
							utils.checkError(error, 564, cb, () => {
								return cb(null, {
									name: secret.metadata.name,
									namespace: secret.metadata.namespace,
									uid: secret.metadata.uid,
									data: secret.data,
									type: secret.type
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
	deleteSecret(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				lib.checkNameSpace(deployer, options, cb, function (error, namespace) {
					deployer.core.namespaces(namespace).secrets.delete({
						name: options.params.name,
						qs: {gracePeriodSeconds: 0}
					}, function (error, response) {
						utils.checkError(error, 563, cb, () => {
							utils.checkError(response.status !== "Success", 566, cb, () => {
								return cb(null, true);
							});
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
	listSecrets(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				if (options.params && options.params.namespace) {
					lib.checkNameSpace(deployer, options, cb, function (error, namespace) {
						deployer.core.namespaces(namespace).secrets.get(function (error, secrets) {
							utils.checkError(error, 562, cb, () => {
								return cb(null, lib.buildSecretRecord(secrets));
							});
						});
					});
				}
				else {
					deployer.core.secrets.get(function (error, secrets) {
						utils.checkError(error, 562, cb, () => {
							return cb(null, lib.buildSecretRecord(secrets));
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
	getSecret(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 520, cb, () => {
				lib.checkNameSpace(deployer, options, cb, function (error, namespace) {
					deployer.core.namespaces(namespace).secrets.get({name: options.params.name}, function (error, secret) {
						utils.checkError(error, 565, cb, () => {
							return cb(null, {
								name: secret.metadata.name,
								namespace: secret.metadata.namespace,
								uid: secret.metadata.uid,
								data: secret.data,
								type: secret.type
							});
						});
					});
				});
			});
		});
	}
};

module.exports = engine;