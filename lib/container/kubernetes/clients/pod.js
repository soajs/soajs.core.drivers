'use strict';


const pods = {
	/**
	 * pod Wrapper
	 */
	get(deployer, opts, cb) {
		async function main() {
			if (opts.pod) {
				return await deployer.api.v1.namespaces(opts.namespace).pods(opts.pod).get({qs: opts.qs});
			} else {
				return await deployer.api.v1.namespaces(opts.namespace).pods.get({qs: opts.qs});
			}
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	getLogs(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.namespaces(opts.namespace).pods(opts.pod).log.get({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	podExec(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.namespaces(opts.namespace).pods(opts.pod).exec.get({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.namespaces(opts.namespace).pods.delete({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
};

module.exports = pods;
