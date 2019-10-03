'use strict';


const services = {
	/**
	 * service Wrapper
	 */
	get(deployer, opts, cb) {
		async function main() {
			if (opts.service) {
				return await deployer.api.v1.namespaces(opts.namespace).services(opts.service).get({qs: opts.qs});
			} else {
				return await deployer.api.v1.namespaces(opts.namespace).services.get({qs: opts.qs});
			}
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	post(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.namespaces(opts.namespace).services.post({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	put(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.namespaces(opts.namespace).services(opts.name).put({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.namespaces(opts.namespace).services(opts.service).delete();
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
	
};

module.exports = services;
