'use strict';

const async = require('async');
const helper = require('../utils/helper.js');
const config = require('./../config');
const utils = require('../../../lib/utils/utils.js');
const driverUtils = require('../utils/index.js');

const request = require('request');

const securityGroups = {

    /**
    * List available security groups

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    list: function(options, cb) {
        options.soajs.log.debug(`Listing securityGroups for resourcegroup ${options.params.group} `);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId

                });
                networkClient.networkSecurityGroups.list(options.params.group,function (error, networkSecurityGroups) {
                    utils.checkError(error, 734, cb, () => {
                        async.map(networkSecurityGroups, function(oneNetworkSecurityGroup, callback) {
                            return callback(null, helper.buildSecurityGroupsRecord({ networkSecurityGroups: oneNetworkSecurityGroup }));
                        }, function(error, securityGroupsList) {
                            return cb(null, securityGroupsList);
                        });
                    });
                });
            });
        });
    },

    /**
    * Get one network security group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    get: function(options, cb) {
        options.soajs.log.debug(`Getting security group ${options.params.name} in resource group ${options.params.group}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const networkClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId

                });
                networkClient.networkSecurityGroups.get(options.params.group, options.params.name, function (error, networkSecurityGroup) {
                    utils.checkError(error, 734, cb, () => {
                        return cb(null, helper.buildSecurityGroupsRecord({ networkSecurityGroups: networkSecurityGroup }));
                    });
                });
            });
        });
    },

    /**
    * Create a new security group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    create: function(options, cb) {
        options.soajs.log.debug(`Creating/Updating securityGroup in ${options.params.name} resource group ${options.params.group} `);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                let bearerToken = '', subscriptionId = '';
                if(authData &&
                    authData.credentials &&
                    authData.credentials.tokenCache &&
                    authData.credentials.tokenCache._entries &&
                    Array.isArray(authData.credentials.tokenCache._entries) &&
                    authData.credentials.tokenCache._entries[0] &&
                    authData.credentials.tokenCache._entries[0].accessToken) {
                        bearerToken = authData.credentials.tokenCache._entries[0].accessToken;
                }

                if(options.infra && options.infra.api && options.infra.api.subscriptionId) {
                    subscriptionId = options.infra.api.subscriptionId;
                }

                let requestOptions = {
                    method: 'PUT',
                    uri: `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${options.params.group}/providers/Microsoft.Network/networkSecurityGroups/${options.params.name}?api-version=${config.apiVersion2018}`,
                    headers: { Authorization: `Bearer ${bearerToken}` },
                    json: true,
                    body: {
                        location: options.params.region,
                        properties: {
                            securityRules: securityGroups.buildSecurityRules(options.params.ports)
                        },
                        tags: options.params.labels || {}
                    }
                };
                request(requestOptions, function(error, response, body) {
                    if(error) return cb(error);
                    if(body && body.error) return cb(body.error);

                    return cb(null, { id: body.id });
                });
            });
        });
    },

    /**
    * Update a security group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    update: function(options, cb) {
        return securityGroups.create(options, cb);
    },

    /**
    * Delete a security group

    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    delete: function(options, cb) {
        options.soajs.log.debug(`Deleting security group ${options.params.securityGroupName}`);
        driverUtils.authenticate(options, (error, authData) => {
            utils.checkError(error, 700, cb, () => {
                const resourceClient = driverUtils.getConnector({
                    api: 'network',
                    credentials: authData.credentials,
                    subscriptionId: options.infra.api.subscriptionId
                });
                resourceClient.networkSecurityGroups.deleteMethod(options.params.group, options.params.name, function (error) {
                    utils.checkError(error, 744, cb, () => {
                        return cb(null, true);
                    });
                });
            });
        });
    },

    /**
    * Build the security rules based on the input ports

    * @param  {Array}   ports  The list of ports
    * @return {Array}
    */
    buildSecurityRules: function(ports) {
        let securityRules = [];
        let defaultDestinationPortRange;
		if (process.env.SOAJS_CLOOSTRO_TEST){
			defaultDestinationPortRange = 1;
		}
        if(Array.isArray(ports)) {
            ports.forEach(onePort => {
                securityRules.push({
                    name: onePort.name,
                    properties: {
                        priority: onePort.priority,
                        protocol: (onePort.protocol) ? onePort.protocol : "*",
                        access: helper.capitalize(onePort.access, "Allow"), //Allow || Deny
	                    direction: helper.capitalize(onePort.direction, "Inbound"), //Inboud || Outbound
	                    sourceAddressPrefix: (onePort.sourceAddress) ? onePort.sourceAddress : "*",
                        sourcePortRange: (onePort.target) ? onePort.target : "*",
	                    destinationAddressPrefix: (onePort.destinationAddress) ? onePort.destinationAddress : "*",
                        destinationPortRange: (onePort.published) ? onePort.published : defaultDestinationPortRange || (Math.floor(Math.random() * 2768) + 30000)
                    }
                });
            });
        }

        return securityRules;
    },
};

module.exports = securityGroups;
