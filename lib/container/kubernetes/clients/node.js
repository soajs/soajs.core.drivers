'use strict';


const node = {
	/**
	 * Node Wrapper
	 */
	get(deployer, opts, cb) {
		async function main() {
			if (opts.name) {
				return await deployer.api.v1.nodes(opts.name).get();
			} else {
				return await deployer.api.v1.nodes.get();
			}
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	put(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.nodes({
				name: opts.name,
				body: opts.body
			}).put();
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	},
	delete(deployer, opts, cb) {
		async function main() {
			return await deployer.api.v1.nodes(opts.name).delete();
		}
		
		main().then((result) => {
			return cb(null, result.body);
		}).catch((err) => {
			return cb(err);
		});
	}
};

module.exports = node;
