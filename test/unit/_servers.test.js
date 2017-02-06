"use strict";
var assert = require('assert');
var shell = require('shelljs');
var sampleData = require("soajs.mongodb.data/modules/soajs");
var shell = require('shelljs');

describe("Beginning test", function() {

    it("Remove existing docker services", function(done){
        shell.exec("docker service rm $(docker service ls -q)");
        done();
    });

    //Start the controller service
    it("Start Controller", function (done) {
        process.env.SOAJS_SOLO = true;
        process.env.SOAJS_DEPLOY_HA = "swarm";

        var controller = require("soajs.controller");
        setTimeout(function () {
            done();
        }, 2000);
    });

    it("Test", function(done) {
        require ("./swarm.unit.test.js");
       // require ("./kubernetes.unit.test.js");
        done();
	});
});