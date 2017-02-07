"use strict";
var assert = require('assert');
var shell = require('shelljs');
var sampleData = require("soajs.mongodb.data/modules/soajs");
var shell = require('shelljs');

describe("Beginning test", function() {

    //Remove existing docker services
    it.skip("Remove existing docker services", function(done){
        shell.exec("docker service rm $(docker service ls -q)");
        process.env.SOAJS_DEPLOY_HA = "swarm";
        done();
    });

    //Perform the docker swarm test cases
    it.skip("Test docker swarm", function(done) {
        require ("./swarm.unit.test.js");
        done();
	});

    //Remove existing kubernetes deployments
    it("Remove existing kubernetes deployments", function(done){
        shell.exec("kubectl delete deployments --all --now && kubectl delete services --all --now && kubectl delete rs --all --now && kubectl delete pods --all --now");
        process.env.SOAJS_DEPLOY_HA = "kubernetes";
        done();
    });

    //Start the controller service
    it("Start Controller", function (done) {
        process.env.SOAJS_SOLO = true;
        var controller = require(__dirname + "/../proxySocket.js");
        setTimeout(function () {
            done();
        }, 2000);
    });

    //Perform the kubernetes test cases
    it("Test kubernetes", function(done) {
        require ("./kubernetes.unit.test.js");
        done();
    });
});