'use strict';


const scale = {
	/**
	 * autoscale Wrapper
	 */
	put(deployer, opts, cb) {
		async function main() {
			return await deployer.apis.apps.v1beta1.namespaces(opts.namespace).deployments(opts.name).scale.put(opts.body);
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = scale;
