'use strict';

const request = require('request');
const config = require('./config');


const helper = {

    listRegions: function(opts, cb) {
        let requestOptions = {
            method: 'GET',
            uri: `https://management.azure.com/subscriptions/${opts.subscriptionId}/locations?api-version=${config.apiVersion2016}`,
            headers: { Authorization: `Bearer ${opts.bearerToken}` },
            json: true
        };

        request(requestOptions, function(error, response, body) {
            if(error) return cb(error);

            if(body && body.error) return cb(body.error);

            let regions = helper.buildRegionsRecord(body.value);

            return cb(null, regions);
        });
    },

    buildRegionsRecord: function(opts) {
        let regions = [];
        if(Array.isArray(opts)) {
            opts.forEach(oneRegion => {
                regions.push({
                    "v": oneRegion.name,
                    "l": oneRegion.displayName
                });
            });
        }
        
        return regions;
    }

};

module.exports = helper;
