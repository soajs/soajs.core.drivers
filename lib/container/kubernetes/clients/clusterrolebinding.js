'use strict';


const clusterrolebindings = {
	/**
	 * clusterrolebindings Wrapper
	 */
	post(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["rbac.authorization.k8s.io"].v1alpha1.clusterrolebindings.post({body: opts.body});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	get(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["rbac.authorization.k8s.io"].v1alpha1.clusterrolebindings(opts.name).get({qs: opts.qs});
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.apis["rbac.authorization.k8s.io"].v1alpha1.clusterrolebindings(opts.name).delete();
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = clusterrolebindings;
