'use strict';

const terraform = require(`${__dirname}/../../../lib/terraform`);
const utils = require('../../../lib/utils/utils.js');
const network = require("../cluster/networks");

const driver = {

    /**
    * Deploy a new layer using a terraform template
    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    deployCluster: function(options, cb) {
        if(!options.params.input) {
            options.params.input = {};
        }

        options.params.input.accessKey = options.infra.api.keyId;
        options.params.input.secretKey = options.infra.api.secretAccessKey;

        options.params.input.envCode = options.registry.code;
        
        //get the vpc id from the network name
	    getNetworkIdFromName(options, (error, networkToUse) => {
		    if (error) {
			    return cb(error);
		    }
			if (networkToUse){
				options.params.input.networkId = networkToUse.id;
			}
			    
	        terraform.apply(options,function(error, result){
	            utils.checkError(error, 738, cb, () => {
	                return cb(null, result);
	            });
	        });
	    });
	
	    function getNetworkIdFromName(options, cb){
		    let originalinputs = JSON.parse(JSON.stringify(options.params.input));
		    options.params.region = options.params.input.region;
		    options.params.network = options.params.input.network;
		    network.list(options, (error, response) => {
			    if(error){
				    return cb(error);
			    }
			    options.params.input = originalinputs;
			    delete options.params.network;
			    delete options.params.region;
			
			    let data;
		     
			    response.forEach((oneNetwork) => {
				    if(oneNetwork.name === options.params.input.network){
					    data = oneNetwork;
				    }
				    else if(oneNetwork.id === options.params.input.network){
					    data = oneNetwork;
				    }
			    });
			
			    return cb(null, data);
		    });
	    }
    },

    /**
    * Update an existing layer using a terraform template
    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    updateCluster: function(options, cb) {
        if (typeof options.params.templateState != "object" ) {
            return cb({error: 'Missing template state', code: 739});
        }
        else {
            return driver.deployCluster(options,cb);
        }
    },

    /**
    * Delete a layer created using a terraform template
    * @param  {Object}   options  Data passed to function as params
    * @param  {Function} cb    Callback function
    * @return {void}
    */
    deleteCluster: function(options, cb) {
        terraform.destroy(options,function(error, result){
            utils.checkError(error, 740, cb, () => {
                return cb(null, result);
            });
        });
    }

};

module.exports = driver;
