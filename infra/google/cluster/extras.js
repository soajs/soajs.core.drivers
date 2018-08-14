"use strict";
const async = require("async");

/**
 * appended code for testing
 */
const googleApi = require('../utils/utils.js');
const v1Compute = function () {
	return googleApi.compute();
};

function getConnector(opts) {
	return require('../utils/utils.js').connector(opts);
}

const extras = {
	/**
	 * Check if Region exists
	 * @param options
	 * @param region
	 * @param verbose
	 * @param cb
	 */
	getRegion: (options, region, verbose, cb) => {
		let request = getConnector(options.infra.api);
		request.region = region;
		v1Compute().regions.get(request, function (err, response) {
			if (err || !response) {
				return cb(err, !response);
			}
			else {
				if (verbose){
					let zones = [];
					if (response && response.zones){
						response.zones.forEach((oneZone)=>{
							let zone = oneZone.split("/");
							zones.push(zone[zone.length - 1]);
						});
					}
					return cb(null, zones);
				}
				else {
					return cb(null, 'locations');
				}
			}
		});
	},
	
	/**
	 * Check if zone exists
	 * @param options
	 * @param region
	 * @param verbose
	 * @param cb
	 */
	getZone: (options, zone, verbose, cb) => {
		let request = getConnector(options.infra.api);
		request.zone = zone;
		v1Compute().zones.get(request, function (err, response) {
			if (err || !response) {
				return cb(err, !response);
			}
			else {
				return verbose ? cb(null, [zone]) : cb(null, 'zones')
			}
		});
	}
};

module.exports = extras;
