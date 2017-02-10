"use strict";
var shell = require('shelljs');

describe("Clean up kubneretes and docker deployments", function () {
    //Remove existing docker services
    it("Cleanup docker services", function (done) {
        shell.exec("docker service rm $(docker service ls -q)");
        done();
    });

    //Remove existing kubernetes deployments
    it("Cleanup kubernetes deployments", function (done) {
        shell.exec("kubectl delete daemonsets --all --now && kubectl delete deployments --all --now && kubectl delete services --all --now && kubectl delete rs --all --now && kubectl delete pods --all --now");
        done();
    });
});
