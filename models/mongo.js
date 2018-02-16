'use strict';

var Mongo = require("soajs.core.modules").mongo;
var soajsUtils = require("soajs.core.libs").utils;

var lib = {
	"initConnection": function (soajs) {
		function errorLogger(error) {
			if (error) {
				return soajs.log.error(error);
			}
		}

		var provision = {
			name: soajs.registry.coreDB.provision.name,
			prefix: soajs.registry.coreDB.provision.prefix,
			servers: soajs.registry.coreDB.provision.servers,
			credentials: soajs.registry.coreDB.provision.credentials,
			streaming: soajs.registry.coreDB.provision.streaming,
			URLParam: soajs.registry.coreDB.provision.URLParam,
			extraParam: soajs.registry.coreDB.provision.extraParam
		};

		var switchedConnection = lib.switchConnection(soajs);
		if (switchedConnection) {
			if (typeof  switchedConnection === 'object' && Object.keys(switchedConnection).length > 0) {
				provision = switchedConnection;
				if (soajs.log) {
					soajs.log.debug('Switching to connection of', soajs.inputmaskData.soajs_project);
				}
			}
		} else {
			//error
			return false;
		}

		soajs.mongoDb = new Mongo(provision);

		return true;
	},
	/**
	 * Close the mongo connection
	 * @param {SOAJS Object} soajs
	 */
	"closeConnection": function (soajs) {
		if (soajs.mongoDb) {
			soajs.mongoDb.closeDb();
		}
	},

	"checkForMongo": function (soajs) {
		if (!soajs.mongoDb) {
			lib.initConnection(soajs);
		}
	},

	"getDb": function (soajs) {
		lib.checkForMongo(soajs);
		return soajs.mongoDb;
	},

	"generateId": function (soajs) {
		lib.checkForMongo(soajs);
		return new soajs.mongoDb.ObjectId();
	},

	"validateId": function (soajs, cb) {
		lib.checkForMongo(soajs);
		if (!soajs.inputmaskData.id) {
			soajs.log.error('No id provided');

			if (cb) {
				return cb('no id provided');
			}
			else {
				return null;
			}
		}

		try {
			soajs.inputmaskData.id = soajs.mongoDb.ObjectId(soajs.inputmaskData.id);
			return ((cb) ? cb(null, soajs.inputmaskData.id) : soajs.inputmaskData.id);
		}
		catch (e) {
			if (cb) {
				return cb(e);
			}
			else {
				soajs.log.error('Exception thrown while trying to get object id for ' + soajs.inputmaskData.id);
				soajs.log.error(e);
				return null;
			}
		}
	},

	"validateCustomId": function (soajs, id, cb) {
		lib.checkForMongo(soajs);
		try {
			id = soajs.mongoDb.ObjectId(id);
			return ((cb) ? cb(null, id) : id);
		}
		catch (e) {
			if (cb) {
				return cb(e);
			}
			else {
				soajs.log.error('Exception thrown while trying to get object id for ' + id);
				soajs.log.error(e);
				return null;
			}
		}
	},

	"countEntries": function (soajs, opts, cb) {
		lib.checkForMongo(soajs);
		soajs.mongoDb.count(opts.collection, opts.conditions || {}, cb);
	},

	"findEntries": function (soajs, opts, cb) {
		lib.checkForMongo(soajs);
		soajs.mongoDb.find(opts.collection, opts.conditions || {}, opts.fields || null, opts.options || null, cb);
	},

	"findEntry": function (soajs, opts, cb) {
		lib.checkForMongo(soajs);
		soajs.mongoDb.findOne(opts.collection, opts.conditions || {}, opts.fields || null, opts.options || null, cb);
	},

	"saveEntry": function (soajs, opts, cb) {
		lib.checkForMongo(soajs);
		soajs.mongoDb.save(opts.collection, opts.record, opts.versioning || false, cb);
	},

	"insertEntry": function (soajs, opts, cb) {
		lib.checkForMongo(soajs);
		soajs.mongoDb.insert(opts.collection, opts.record, opts.versioning || false, cb);
	},

	"removeEntry": function (soajs, opts, cb) {
		lib.checkForMongo(soajs);
		soajs.mongoDb.remove(opts.collection, opts.conditions, cb);
	},

	"updateEntry": function (soajs, opts, cb) {
		lib.checkForMongo(soajs);
		soajs.mongoDb.update(opts.collection, opts.conditions, opts.fields, opts.options || {}, opts.versioning || false, cb);
	},

	"distinctEntries": function (soajs, opts, cb) {
		lib.checkForMongo(soajs);
		soajs.mongoDb.distinct(opts.collection, opts.fields, opts.conditions, cb);
	},

	"switchConnection" : function (soajs) {
		var provision = true;
		if (process.env.SOAJS_SAAS && !soajs.tenant.locked &&  soajs.servicesConfig && soajs.servicesConfig.SOAJS_SAAS) {
			if (soajs.inputmaskData.soajs_project && soajs.servicesConfig.SOAJS_SAAS[soajs.inputmaskData.soajs_project]) {
				if(soajs.registry.resources.cluster[soajs.inputmaskData.soajs_project]){
					provision = soajsUtils.cloneObj(soajs.registry.resources.cluster[soajs.inputmaskData.soajs_project].config);
					provision.name = soajs.registry.coreDB.provision.name;
					provision.prefix = soajs.inputmaskData.soajs_project + "_";
				}
				else {
					soajs.log.error('Missing cluster for ', soajs.inputmaskData.soajs_project);
					return false;
				}
			}
			else {
				return false;
			}
		}
		return provision
	}
};
module.exports = lib;
