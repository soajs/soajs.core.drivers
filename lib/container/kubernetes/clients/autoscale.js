'use strict';


const autoscale = {
	/**
	 * autoscale Wrapper
	 */
	get(deployer, opts, cb) {
		async function main() {
			if (opts.name) {
				return await deployer.apis.autoscaling.v1.namespaces(opts.namespace).horizontalpodautoscalers(opts.name).get({qs: opts.qs});
			} else {
				return await deployer.apis.autoscaling.v1.namespaces(opts.namespace).horizontalpodautoscalers.get({qs: opts.qs});
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
			return await deployer.apis.autoscaling.v1.namespaces(opts.namespace).horizontalpodautoscalers.post(opts.body);
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	put(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.autoscaling.v1.namespaces(opts.namespace).horizontalpodautoscalers(opts.name).put(opts.body);
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.autoscaling.v1.namespaces(opts.namespace).horizontalpodautoscalers(opts.autoscale).delete();
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = autoscale;
