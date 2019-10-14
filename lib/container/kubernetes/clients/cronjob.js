'use strict';


const cronJob = {
	/**
	 * cronJob Wrapper
	 */
	get(deployer, opts, cb) {
		async function main() {
			if (opts.name) {
				return await deployer.apis.batch.v1beta1.namespaces(opts.namespace).cronjobs(opts.name).get({qs: opts.qs});
			} else {
				return await deployer.apis.batch.v1beta1.namespaces(opts.namespace).cronjobs.get({qs: opts.qs});
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
			return await deployer.apis.batch.v1beta1.namespaces(opts.namespace).cronjobs.post({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	put(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.batch.v1beta1.namespaces(opts.namespace).cronjobs(opts.name).put({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.batch.v1beta1.namespaces(opts.namespace).cronjobs(opts.name).delete({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
};

module.exports = cronJob;
