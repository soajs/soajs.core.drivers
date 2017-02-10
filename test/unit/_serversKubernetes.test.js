"use strict";
var shell = require('shelljs');

var controller = null;
describe("", function () {

    describe("kubernetes", function () {

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
    });
});