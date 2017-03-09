"use strict";
var shell = require('shelljs');

var controller = null;
describe("", function () {

    describe("kubernetes", function () {

        //Remove existing kubernetes deployments
        it("Remove existing kubernetes deployments", function (done) {
            shell.exec("kubectl delete namespaces --all");
            process.env.SOAJS_DEPLOY_HA = "kubernetes";

            console.log("Waiting 5 seconds for previous namespaces to terminate ...");
            setTimeout(done, 5000);
        });

        //Perform the kubernetes test cases
        it("Test kubernetes", function (done) {
            require("./kubernetes.unit.test.js");
            done();
        });
    });
});
