/* jshint esversion: 6 */
'use strict';

const utils = require('../../utils/utils');
const lib = require('./utils');
const request = require('request');

const engine = {
	/**
	 * Function that gets Services Metrics
	 * @param  {Object}   options Options passed to function
	 * @param  {Function} cb      Callback function
	 * @returns {*}
	 */
	getServicesMetrics(options, cb) {
		options.returnApiInfo = true;
		lib.getDeployer(options, (error, deployerInfo) => {
			utils.checkError(error, 540, cb, () => {
				let requestOptions = {
					uri: `${deployerInfo.host}/metrics`,
					headers: {
						'Content-Type': 'application/json',
						'token': deployerInfo.token
					},
					json: true
				};
				request.get(requestOptions, (error, body, response) => {
					utils.checkError(error, 688, cb, () => {
						return cb(null, response);
					});
				});
			});
		});
	}
};

module.exports = engine;
