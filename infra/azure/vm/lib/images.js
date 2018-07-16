'use strict';

const async = require('async');
const helper = require('../../utils/helper.js');
const utils = require('../../../../lib/utils/utils.js');
const driverUtils = require('../../utils/index.js');

const images = {

    /**
	* List available virtual machine image publishers

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImagePublishers: function (options, cb) {
		options.soajs.log.debug(`Listing virtual machine image publishers in ${options.params.region} location`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachineImages.listPublishers(options.params.region, function (error, imagePublishers) {
					utils.checkError(error, 710, cb, () => {
						async.map(imagePublishers, function(oneimagePublisher, callback) {
							return callback(null, helper.buildVmImagePublisherssRecord({ imagePublisher: oneimagePublisher }));
						}, function(error, imagePublishersList) {
							return cb(null, imagePublishersList);
						});
					});
				});
			});
		});
	},

	/**
	* List available virtual machine image publisher images

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImagePublisherOffers: function (options, cb) {
		options.soajs.log.debug(`Listing vm image offers for publisher ${options.params.publisher} in ${options.params.region} location`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachineImages.listOffers(options.params.region, options.params.publisher, function (error, imageOffers) {
					utils.checkError(error, 711, cb, () => {
						async.map(imageOffers, function(oneimageOffer, callback) {
							return callback(null, helper.buildVmImagePublishersOffersRecord({ imageOffer: oneimageOffer }));
						}, function(error, imageOffersList) {
							return cb(null, imageOffersList);
						});
					});
				});
			});
		});
	},

	/**
	* List available virtual machine image versions

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	listVmImageVersions: function (options, cb) {
		options.soajs.log.debug(`Listing vm image versions for publisher ${options.params.publisher} and offer ${options.params.offer} in ${options.params.region} location`);
		driverUtils.authenticate(options, (error, authData) => {
			utils.checkError(error, 700, cb, () => {
				const computeClient = driverUtils.getConnector({
					api: 'compute',
					credentials: authData.credentials,
					subscriptionId: options.infra.api.subscriptionId
				});
				computeClient.virtualMachineImages.listSkus(options.params.region, options.params.publisher, options.params.offer, function (error, imageVersions) {
					utils.checkError(error, 712, cb, () => {
						async.map(imageVersions, function(oneimageVersion, callback) {
							return callback(null, helper.buildVmImageVersionsRecord({ imageVersion: oneimageVersion }));
						}, function(error, imageVersionsList) {
							return cb(null, imageVersionsList);
						});
					});
				});
			});
		});
	},

};

module.exports = images;
