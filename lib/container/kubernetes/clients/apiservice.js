'use strict';


const autoscale = {
	/**
	 * autoscale Wrapper
	 */
	post(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["apiregistration.k8s.io"].v1.apiservices.post({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	get(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["apiregistration.k8s.io"].v1.apiservices(opts.name).get({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["apiregistration.k8s.io"].v1.apiservices(opts.name).delete();
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = autoscale;
