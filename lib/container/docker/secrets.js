'use strict';

const utils = require('../../utils/utils.js');
const lib = require('./utils');

var engine = {
	/**
	 * Get Docker Secret
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	getSecret(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let secret = deployer.getSecret(options.params.name);
				secret.inspect((error, response) => {
					utils.checkError(error, 565, cb, () => {
						return cb(null, {
							name: response['Spec'].Name,
							uid: response['ID']
						});
					});
				});
			});
		});
	},
	
	/**
	 * Create Docker Secret
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	createSecret(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let check = !options.params.data || !options.params.name
					|| (options.params.data && typeof options.params.data === 'object' && !options.params.data[options.params.name])
					|| (options.params.data && typeof options.params.data !== 'object');
				utils.checkError(check, 570, cb, () => {
					if (typeof options.params.data[options.params.name] !== 'string') {
						options.params.data[options.params.name] = options.params.data.toString();
					}
					let secret = {
						Name: options.params.name,
						Data: new Buffer(options.params.data[options.params.name]).toString('base64')
					};
					deployer.createSecret(secret, (error, response) => {
						utils.checkError(error, 567, cb, () => {
							return cb(null, {
								name: secret.Name,
								uid: response.id
							});
						});
					});
				});
			});
		});
	},
	
	/**
	 * Delete Docker Secret
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	deleteSecret(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				let secret = deployer.getSecret(options.params.name);
				
				secret.remove((error) => {
					utils.checkError(error, 568, cb, () => {
						return cb(null, true);
					});
				});
			});
		});
	},
	
	/**
	 * Delete Docker Secret
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	listSecrets(options, cb) {
		lib.getDeployer(options, (error, deployer) => {
			utils.checkError(error, 540, cb, () => {
				deployer.listSecrets((error, response) => {
					utils.checkError(error, 569, cb, () => {
						return cb(null, lib.buildSecretRecord(response));
					});
				});
			});
		});
	}
};

module.exports = engine;