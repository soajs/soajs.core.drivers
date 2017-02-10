"use strict";
var assert = require('assert');
var shell = require('shelljs');

var controller = null;
describe("", function () {

    describe("Docker", function () {
        //Remove existing docker services
        it("Remove existing docker services", function (done) {
            shell.exec("docker service rm $(docker service ls -q)");
            process.env.SOAJS_DEPLOY_HA = "swarm";
            done();
        });

        //Start the controller service
        it("Start docker swarm Controller", function (done) {
            process.env.SOAJS_SOLO = true;
            controller = require(__dirname + "/../proxySocket.js");
            setTimeout(function () {
                done();
            }, 2000);
        });

        //Perform the docker swarm test cases
        it("Test docker swarm", function (done) {
            require("./swarm.unit.test.js");
            setTimeout(function () {
                done();
            }, 2000);
        });
    });

    /*describe("kubernetes", function () {

        //Remove existing kubernetes deployments
        it("Remove existing kubernetes deployments", function (done) {
            shell.exec("kubectl delete daemonsets --all --now && kubectl delete deployments --all --now && kubectl delete services --all --now && kubectl delete rs --all --now && kubectl delete pods --all --now");
            process.env.SOAJS_DEPLOY_HA = "kubernetes";
            done();
        });

        //Start the controller service
        it("Start kubernetes Controller", function (done) {
            process.env.SOAJS_SOLO = true;
            controller = require(__dirname + "/../proxySocket.js");
            setTimeout(function () {
                done();
            }, 2000);
        });

        //Perform the kubernetes test cases
        it("Test kubernetes", function (done) {
            require("./kubernetes.unit.test.js");
            done();
        });
    });*/
});