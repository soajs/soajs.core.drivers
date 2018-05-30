"use strict";
const google = require('googleapis');
const v1Compute = google.compute('v1');
const v1Container = google.container('v1');
const config = require('../config');
const utils = {
	compute: () => {
		return v1Compute;
	},
	container: () => {
		return v1Container;
	},
	connector: (opts) => {
		return {
			project: opts.project,
			projectId: opts.project,
			auth: new google.auth.JWT(
				opts.token.client_email,
				null,
				opts.token.private_key,
				config.scopes, // an array of auth scopes
				null
			)
		}
	}
};

module.exports = utils;