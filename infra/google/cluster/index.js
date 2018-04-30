'use strict';

const fs = require('fs');
const google = require('googleapis');
const v1Compute = google.compute('v1');

const defaultDriver = 'kubernetes';
const config = require('./config');

function runCorrespondingDriver(method, options, cb) {
	let driverName = (options.infra && options.infra.stack && options.infra.stack.technology) ? options.infra.stack.technology : defaultDriver;
	driverName = (options.params && options.params.technology) ? options.params.tehcnology : driverName;
	fs.exists(__dirname + "/" + driverName + ".js", (exists) => {
		if (!exists) {
			return cb(new Error("Requested Driver does not exist!"));
		}
		
		let driver = require("./" + driverName);
		driver[method](options, cb);
	});
}

function getConnector(opts) {
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
	};
}

const driver = {
	/**
	 * this method authenticates the credentials provided by invoking the google api
	 * Note: data.options provided to this method is different from other methods as this method is invoked via 3rd parties systems ( projects )
	 * @param options {Object}
	 * @param cb {Function}
	 */
	"authenticate": function (options, cb) {
		options.soajs.log.debug("Authenticating Google Credentials");
		//Ref: https://cloud.google.com/compute/docs/reference/latest/zones/list
		let request = getConnector(options.infra.api);
		v1Compute.zones.list(request, function (err) {
			if (err) {
				return cb(err);
			}
			return cb(null, true);
		});
	},
	
	"getExtras": function(options, cb) {
		return cb(null, {technologies: ['kubernetes'], templates: ['local'] });
	},
	
	"deployCluster": function (options, cb) {
		runCorrespondingDriver('deployCluster', options, cb);
	},
	
	"getDeployClusterStatus": function (options, cb) {
		runCorrespondingDriver('getDeployClusterStatus', options, cb);
	},
	
	"getDNSInfo": function (options, cb) {
		runCorrespondingDriver('getDNSInfo', options, cb);
	},
	
	/**
	 * This method returns the available deployment zones at google
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	"getRegions": function (options, cb) {
		//Ref: https://cloud.google.com/compute/docs/reference/latest/zones/list
		let request = getConnector(options.infra.api);
		v1Compute.zones.list(request, function (err, response) {
			if (err) {
				return cb(err);
			}
			let zones = [];
			response.items.forEach(function (oneZone) {
				if (oneZone.status === 'UP') {
					zones.push({
						'l': oneZone.description,
						'v': oneZone.name
					})
				}
			});
			return cb(null, {
				"regions": zones
			});
		});
	},
	
	"scaleCluster": function (options, cb) {
		runCorrespondingDriver('scaleCluster', options, cb);
	},
	
	"getCluster": function (options, cb) {
		runCorrespondingDriver('getCluster', options, cb);
	},
	
	"updateCluster": function (options, cb) {
		runCorrespondingDriver('updateCluster', options, cb);
	},
	
	"deleteCluster": function (options, cb) {
		runCorrespondingDriver('deleteCluster', options, cb);
	},
	
	"publishPorts": function (options, cb) {
		runCorrespondingDriver('publishPorts', options, cb);
	},
	
	"deployExternalLb": function (options, cb) {
		runCorrespondingDriver('deployExternalLb', options, cb);
	},
	
	"updateExternalLB": function (options, cb) {
		runCorrespondingDriver('updateExternalLB', options, cb);
	},
	
	"deleteExternalLB": function (options, cb) {
		runCorrespondingDriver('deleteExternalLB', options, cb);
	}
};

module.exports = driver;
