'use strict';


const daemonsets = {
	/**
	 * daemonset Wrapper
	 */
	get(deployer, opts, cb) {
		async function main() {
			if (opts.name) {
				return await deployer.apis.apps.v1.namespaces(opts.namespace).daemonsets(opts.name).get({qs: opts.qs});
			} else {
				return await deployer.apis.apps.v1.namespaces(opts.namespace).daemonsets.get({qs: opts.qs});
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
			return await deployer.apis.apps.v1.namespaces(opts.namespace).daemonsets.post({body: opts.body, qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	put(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.apps.v1.namespaces(opts.namespace).daemonsets(opts.name).put({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.apps.v1.namespaces(opts.namespace).daemonsets(opts.name).delete();
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = daemonsets;
