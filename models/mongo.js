'use strict';
/////////////////////////////////
//NOTE: this does not work!!
var Mongo = require("soajs").mongo; //TODO: this does not work
/////////////////////////////////
var mongo = null;

function checkForMongo(soajs) {
    if (!mongo) {
        mongo = new Mongo(soajs.registry.coreDB.provision);
    }
}

module.exports = {
	"checkForMongo": function (soajs) {
		checkForMongo(soajs);
	},

    "getDb": function(soajs) {
        checkForMongo(soajs);
        return mongo;
    },

    "generateId": function (soajs) {
        checkForMongo(soajs);
        return new mongo.ObjectId();
    },

    "validateId": function(soajs, cb){
        checkForMongo(soajs);
        if(!soajs.inputmaskData.id) {
            soajs.log.error('No id provided');

            if(cb) return cb('no id provided');
            else return null;
        }

        try{
            soajs.inputmaskData.id = mongo.ObjectId(soajs.inputmaskData.id);
            return ((cb) ? cb(null, soajs.inputmaskData.id) : soajs.inputmaskData.id);
        }
        catch(e){
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
        checkForMongo(soajs);
        try {
            id = mongo.ObjectId(id);
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
        checkForMongo(soajs);
        mongo.count(opts.collection, opts.conditions || {}, cb);
    },

    "findEntries": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.find(opts.collection, opts.conditions || {}, opts.fields || null, opts.options || null, cb);
    },

    "findEntry": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.findOne(opts.collection, opts.conditions || {},  opts.fields || null, opts.options || null, cb);
    },

    "saveEntry": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.save(opts.collection, opts.record, opts.versioning || false, cb);
    },

    "insertEntry": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.insert(opts.collection, opts.record, opts.versioning || false, cb);
    },

    "removeEntry": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.remove(opts.collection, opts.conditions, cb);
    },

    "updateEntry": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.update(opts.collection, opts.conditions, opts.fields, opts.options || {}, opts.versioning || false, cb);
    },

	"distinctEntries": function(soajs, opts, cb){
    	checkForMongo(soajs);
    	mongo.distinct(opts.collection, opts.fields, opts.conditions, cb);
	}
};
