'use strict';

const utils = require("../utils/utils");

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
    list: function(options, cb) {
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
				let certificatesList = [];

				certificates.CertificateSummaryList.forEach((oneCertificate) => {
					let tempObj = {};
					if (oneCertificate.CertificateArn) tempObj.id = oneCertificate.CertificateArn;
					if (oneCertificate.DomainName) tempObj.domain = oneCertificate.DomainName;
					tempObj.region = options.params.region;

					if (Object.keys(tempObj).length > 1) {
						certificatesList.push(tempObj);
					}
				});

				return cb(null, certificatesList);
			}
			else {
				return cb (null, []);
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
		//TODO: check for create/import flag and execute the needed actions

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
			DomainValidationOptions: options.params.domainValidationOptions, /* requied, array of objects, items: DomainName and ValidationDomain string values both */
			// IdempotencyToken: 'STRING_VALUE',
			// Options: {
			// 	CertificateTransparencyLoggingPreference: options.params.transparencyLoggingPreferences /* ENABLED or DISABLED */
			// },
			SubjectAlternativeNames: options.params.alternativeDomains, /* array of strings */
			ValidationMethod: options.params.validationMethod /* EMAIL or DNS */
		};

		acm.requestCertificate(params, function (error, response) {
			if (error) {
				return cb(error);
			}
			else {
				let certificate = {};

				if (response.CertificateArn) certificate.id = response.CertificateArn;
				certificate.region = options.params.region;

				if (Object.keys(certificate).length > 1) {
					return cb(null, certificate);
				}
				else {
					return cb(null, {});
				}
			}
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
    }
};

module.exports = certificates;
