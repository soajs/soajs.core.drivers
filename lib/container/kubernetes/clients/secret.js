'use strict';


const secret = {
	/**
	 * Secret Wrapper
	 */
	get(deployer, opts, cb) {
		async function main() {
			if (opts.secret) {
				return await deployer.api.v1.namespaces(opts.namespace).secrets(opts.secret).get();
			} else {
				return await deployer.api.v1.namespaces(opts.namespace).secrets.get();
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
			return await deployer.api.v1.namespaces(opts.namespace).secrets.post({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.namespaces(opts.namespace).secrets(opts.secret).delete({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = secret;
