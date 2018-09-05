'use strict';

const async = require('async');

const cluster = require('./cluster');
const utilGlobal = require("../../../lib/utils/utils");

const defaultDriver = 'docker';

function runCorrespondingDriver(method, options, cb) {
	utilGlobal.runCorrespondingDriver(method, options, defaultDriver, cb);
}

const driver = {

    /**
	 * method used to invoke aws api and deploy instances, security groups, configure load balancer & ip addresses
	 * @param options
	 * @param cb
	 * @returns {*}
	 */
	deployCluster: function(options, cb) {
        let containerOptions = Object.assign({}, options);
        containerOptions.technology = (containerOptions && containerOptions.params && containerOptions.params.technology) ? containerOptions.params.technology : defaultDriver;

		let myDeployment;
		function callAPI(mCb) {
			cluster.deployCluster(options, (error, oneDeployment) => {
				if(oneDeployment){
					myDeployment = oneDeployment;
				}
				return mCb(error, oneDeployment);
			});
		}

		function preAPICall(mCb) {
			runCorrespondingDriver('deployClusterPre', containerOptions, mCb);
		}

		function postAPICall(mCb) {
			if(myDeployment){
				runCorrespondingDriver('deployClusterPost', containerOptions, mCb);
			}
			else{
				return mCb();
			}
		}

		let stages = [preAPICall, callAPI, postAPICall];
		async.series(stages, (error) => {
			if (error) {
				return cb(error);
			}
			return cb(null, myDeployment);
		});
	},

	"updateCluster": function (options, cb) {
		return cluster.updateCluster(options, cb);
	},

	"deleteCluster": function (options, cb) {
		return cluster.deleteCluster(options, cb);
	},

};

module.exports = driver;
