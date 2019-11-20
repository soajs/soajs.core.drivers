'use strict';

const engine = {
	/**
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	getPVC(options, cb) {
		return cb(null, "PVC not supported");
	},
	
	/**
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	createPVC(options, cb) {
		return cb(null, "PVC not supported");
	},
	
	/**
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	deletePVC(options, cb) {
		return cb(null, "PVC not supported");
	},
	
	/**
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @returns {*}
	 */
	listPVCs(options, cb) {
		return cb(null, "PVC not supported");
	}
};

module.exports = engine;