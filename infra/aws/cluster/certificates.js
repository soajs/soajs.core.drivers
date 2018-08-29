'use strict';
const async = require('async');
const utils = require("../utils/utils");
const helper = require('../utils/helper.js');

const config = require("../config");

function getConnector(opts) {
	return utils.getConnector(opts, config);
}

const certificates = {

    /**
    * List available certificates

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    list: function(options, cb)  {
        const aws = options.infra.api;
		const acm = getConnector({
			api: 'acm',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});

		acm.listCertificates({}, function (error, certificates) {
			if (error) {
				return cb(error);
			}
			if (certificates && certificates.CertificateSummaryList && Array.isArray(certificates.CertificateSummaryList) && certificates.CertificateSummaryList.length > 0) {
				async.mapLimit(certificates.CertificateSummaryList, 10, (oneCertificate, callback) => {
					acm.describeCertificate({ CertificateArn: oneCertificate.CertificateArn }, function(error, certificateInfo = {}) {
						if(error) return callback(error);

						acm.listTagsForCertificate({ CertificateArn: oneCertificate.CertificateArn }, function(error, certificateTags = {}) {
							if(error) return callback(error);

							return callback(null, helper.buildCertificateRecord({
								certificate: certificateInfo.Certificate,
							 	tags: certificateTags.Tags,
								region: options.params.region
							}));
						});
					});
				}, cb);
			}
			else {
				return cb(null, []);
			}
		});
    },

    /**
    * Create a new certificate

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    create: function(options, cb) {
		// if import flag is set, redirect to import function
		if(options.params && ['import', 'renew'].includes(options.params.action)) {
			return certificates.import(options, cb);
		}

		const aws = options.infra.api;
		const acm = getConnector({
			api: 'acm',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});

		let params = {
			DomainName: options.params.domain, /* required string value */
			// CertificateAuthorityArn: 'STRING_VALUE',
			// DomainValidationOptions: options.params.domainValidationOptions, /* requied, array of objects, items: DomainName and ValidationDomain string values both */
			// IdempotencyToken: 'STRING_VALUE',
			// Options: {
			// 	CertificateTransparencyLoggingPreference: options.params.transparencyLoggingPreferences /* ENABLED or DISABLED */
			// },
			SubjectAlternativeNames: options.params.alternativeDomains, /* array of strings */
			ValidationMethod: (options.params.validationMethod) ? options.params.validationMethod.toUpperCase() : 'DNS' /* EMAIL or DNS */
		};

		acm.requestCertificate(params, function (error, response) {
			if (error) return cb(error);

			let certificate = {};
			if (response.CertificateArn) certificate.id = response.CertificateArn;
			certificate.region = options.params.region;
			if (options.params.name) {
				let tags = [ { Key: 'Name', Value: options.params.name } ];
				
				certificates.addTags(options, certificate, tags, function(error) {
					if(error) return cb(error);
					return cb(null, certificate);
				});
			}
			else {
				return cb(null, certificate);
			}
		});
    },

	/**
    * Import a certificate

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
	import: function(options, cb) {
		const aws = options.infra.api;
		const acm = getConnector({
			api: 'acm',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});

		let params = {
			Certificate: options.params.certificate,
			PrivateKey: options.params.privateKey,
			CertificateChain: options.params.chain
		};

		if(options.params.action === 'renew' && options.params.id) { //existing certificate id (to be renewed)
			params.CertificateArn = options.params.id;
		}

		acm.importCertificate(params, function(error, response) {
			if(error) return cb(error);

			let certificate = {};
			if (response.CertificateArn) certificate.id = response.CertificateArn;
			certificate.region = options.params.region;

			let tags = [ { Key: 'Name', Value: options.params.name } ];

			certificates.addTags(options, certificate, tags, function(error) {
				if(error) return cb(error);
				return cb(null, certificate);
			});
		});
	},

    /**
    * Update a certificate

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {
		return cb(null, true);
    },

    /**
    * Delete a certificate

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    delete: function(options, cb) {
		const aws = options.infra.api;
		const acm = getConnector({
			api: 'acm',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});

		let params = {
			CertificateArn: options.params.id
		};

		acm.deleteCertificate(params, cb);
    },

	/**
    * Add tags to a certificate

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
	addTags: function(options, certificate, tags, cb) {
		const aws = options.infra.api;
		const acm = getConnector({
			api: 'acm',
			region: options.params.region,
			keyId: aws.keyId,
			secretAccessKey: aws.secretAccessKey
		});

		let params = {
			CertificateArn: certificate.id,
			Tags: tags
		};

		return acm.addTagsToCertificate(params, cb);
	}
};

module.exports = certificates;
