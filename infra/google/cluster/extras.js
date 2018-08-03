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
	 * List regions available
	 * @param options
	 * @param cb
	 */
	regionsList: (options, cb) => {
		let request = getConnector(options.infra.api);
		v1Compute().regions.list(request, function (err, response) {
			if (err) {
				return cb(err);
			}
			let regions = [];
			response.items.forEach(function (oneZone) {
				if (oneZone.status === 'UP') {
					regions.push({
						'l': oneZone.description,
						'v': oneZone.name
					})
				}
			});
			return cb(null, {
				"regions": regions
			});
		});
	},
	
	/**
	 * List zones available
	 * @param options
	 * @param cb
	 */
	zoneList: (options, cb) => {
		let request = getConnector(options.infra.api);
		v1Compute().zones.list(request, function (err, response) {
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
				"zones": zones
			});
		});
	},
	
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
