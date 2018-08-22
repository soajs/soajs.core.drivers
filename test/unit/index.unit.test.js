"use strict";
const helper = require("../helper.js");
const assert = require("assert");
const sinon = require('sinon');
const index = helper.requireModule('./index.js');
const utils = helper.requireModule('./infra/utils.js');
const dockerDriver = helper.requireModule("./container/docker/index.js");
const kubernetesDriver = helper.requireModule("./container/kubernetes/index.js");
const dockerUtils = helper.requireModule("./lib/container/docker/utils.js");
const kubeUtils = helper.requireModule("./lib/container/kubernetes/utils.js");

const options = require('../schemas/docker/local');

let driverOptions = {
    type : 'infra',
    strategy :'docker',
    driver : 'local',
};
let methodOptions = JSON.parse(JSON.stringify(options().deployer)) ;

let kuberOptions = JSON.parse(JSON.stringify(methodOptions));

describe("testing index.js -- Calling docker local", function () {

    describe("calling execute authenticate", function () {

        let method = 'authenticate';
        it("Success", function (done) {
            sinon
                .stub(dockerUtils, "getDeployer")
                .yields(null , {
                    listNetworks : function ({},cb) {
                        return cb(null, [{
                            "Name" : 'soajsnet'
                        }])
                    },
                    createNetwork : function ({}, cb) {
                        return cb(null, true)
                    }
                });
            index.execute(driverOptions, method, methodOptions, function () {
                sinon.restore();
                done();
            })
        });
        it("Fail", function (done) {
            sinon
                .stub(dockerUtils, "getDeployer")
                .yields(null , {
                    listNetworks : function ({},cb) {
                        return cb(null, [{
                            "test" : 'test'
                        }])
                    },
                    createNetwork : function ({}, cb) {
                        return cb(null, true)
                    }
                });
            index.execute(driverOptions, method, methodOptions, function () {
                sinon.restore();
                done();
            })
        });
        it("Fail in deployer", function (done) {
            sinon
                .stub(dockerUtils, "getDeployer")
                .yields("error" , null);
            index.execute(driverOptions, method, methodOptions, function () {
                sinon.restore();
                done();
            })
        });

        it("Fail in listNetworks", function (done) {
            sinon
                .stub(dockerUtils, "getDeployer")
                .yields(null , {
                    listNetworks : function ({},cb) {
                        return cb("errorrr", null)
                    },
                    createNetwork : function ({}, cb) {
                        return cb("eroor", null)
                    }
                });
            index.execute(driverOptions, method, methodOptions, function () {
                sinon.restore();
                done();
            })
        });

        it("Fail in createNetwork", function (done) {
            sinon
                .stub(dockerUtils, "getDeployer")
                .yields(null , {
                    listNetworks : function ({},cb) {
                        return cb(null, [])
                    },
                    createNetwork : function ({}, cb) {
                        return cb("eroor", null)
                    }
                });
            index.execute(driverOptions, method, methodOptions, function () {
                sinon.restore();
                done();
            })
        });
    });

    describe("calling execute getExtras", function () {
        let method = 'getExtras';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute getRegions", function () {
        let method = 'getRegions';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute deployCluster", function () {
        let method = 'deployCluster';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute getDeployClusterStatus", function () {
        let method = 'getDeployClusterStatus';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute getDNSInfo", function () {
        let method = 'getDNSInfo';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute scaleCluster", function () {
        let method = 'scaleCluster';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute getCluster", function () {
        let method = 'getCluster';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute updateCluster", function () {
        let method = 'updateCluster';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute deleteCluster", function () {
        let method = 'deleteCluster';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute publishPorts", function () {
        let method = 'publishPorts';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute createLoadBalancer", function () {
        let method = 'createLoadBalancer';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute updateExternalLB", function () {
        let method = 'updateExternalLB';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute deleteLoadBalancer", function () {
        let method = 'deleteLoadBalancer';
        it("Success", function (done) {
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });

    describe("calling execute deployService", function () {
        let method = 'deployService';
        it("Success", function (done) {
            sinon
                .stub(dockerDriver, 'deployService')
                .yields(null, true);
            sinon
                .stub(dockerDriver, 'inspectService')
                .yields(null, true);
            sinon
                .stub(utils, 'updateEnvSettings')
                .yields(null, true);
            index.execute(driverOptions, method, methodOptions, function () {
                sinon.restore();
                done();
            })
        });

        it("Fail deployService", function (done) {
            sinon
                .stub(dockerDriver, 'deployService')
                .yields("errro", null);
            sinon
                .stub(dockerDriver, 'inspectService')
                .yields(null, true);
            sinon
                .stub(utils, 'updateEnvSettings')
                .yields(null, true);
            index.execute(driverOptions, method, methodOptions, function () {
                sinon.restore();
                done();
            })
        });

        it("Fail inspect", function (done) {
            sinon
                .stub(dockerDriver, 'deployService')
                .yields(null, true);
            sinon
                .stub(dockerDriver, 'inspectService')
                .yields("eroooor", []);
            sinon
                .stub(utils, 'updateEnvSettings')
                .yields(null, true);
            index.execute(driverOptions, method, methodOptions, function () {
                sinon.restore();
                done();
            })
        });

        it("Fail update", function (done) {
            sinon
                .stub(dockerDriver, 'deployService')
                .yields(null, true);
            sinon
                .stub(dockerDriver, 'inspectService')
                .yields(null, []);
            sinon
                .stub(utils, 'updateEnvSettings')
                .yields("erooorr", null);
            index.execute(driverOptions, method, methodOptions, function () {
                sinon.restore();
                done();
            })
        });
    });

    describe("calling execute redeployService", function () {
        let method = 'redeployService';
        it("Success", function (done) {
            sinon
                .stub(dockerDriver, 'redeployService')
                .yields(null, true);
            sinon
                .stub(dockerDriver, 'inspectService')
                .yields(null, true);
            sinon
                .stub(utils, 'updateEnvSettings')
                .yields(null, true);
            index.execute(driverOptions, method, methodOptions, function () {
                done();
            })
        });
    });
});

describe("testing index.js -- Calling kubernetes local", function () {

    let kuberDriver= JSON.parse(JSON.stringify(driverOptions));
    kuberOptions.infra.stack = {
        technology: 'kubernetes'
    };

    describe("calling execute authenticate", function () {
        let method = 'authenticate';
        it("Success", function (done) {
            sinon
                .stub(kubeUtils, "getDeployer")
                .yields(null , {
                    core :{
                        namespaces : {
                            get : function ({},cb) {
                                return cb(null, {
                                    "items" : [{
                                    "metadata" : {
                                        "name": 'soajs'
                                    }
                                }
                                ]})
                            },
                            post : function ({},cb) {
                                return cb(null, true)
                            },
                        },
                    },

                    createNetwork : function ({}, cb) {
                        return cb(null, true)
                    }
                });
            index.execute(kuberDriver, method, kuberOptions, function () {
                sinon.restore();
                done();
            })
        });

        it("Success ", function (done) {
            sinon
                .stub(kubeUtils, "getDeployer")
                .yields(null , {
                    core :{
                        namespaces : {
                            get : function ({},cb) {
                                return cb(null, [])
                            },
                            post : function ({},cb) {
                                return cb(null, true)
                            },
                        },
                    },

                    createNetwork : function ({}, cb) {
                        return cb(null, true)
                    }
                });
            index.execute(kuberDriver, method, kuberOptions, function () {
                sinon.restore();
                done();
            })
        });

        it("fails getDeployer ", function (done) {
            sinon
                .stub(kubeUtils, "getDeployer")
                .yields("errorr" , null);
            index.execute(kuberDriver, method, kuberOptions, function () {
                sinon.restore();
                done();
            })
        });

        it("fail namespace get ", function (done) {
            sinon
                .stub(kubeUtils, "getDeployer")
                .yields(null , {
                    core :{
                        namespaces : {
                            get : function ({},cb) {
                                return cb("errr", null)
                            },
                            post : function ({},cb) {
                                return cb(null, true)
                            },
                        },
                    },

                    createNetwork : function ({}, cb) {
                        return cb(null, true)
                    }
                });
            index.execute(kuberDriver, method, kuberOptions, function () {
                sinon.restore();
                done();
            })
        });

        it("fail namespace post ", function (done) {
            sinon
                .stub(kubeUtils, "getDeployer")
                .yields(null , {
                    core :{
                        namespaces : {
                            get : function ({},cb) {
                                return cb(null, [])
                            },
                            post : function ({},cb) {
                                return cb("errror", null)
                            },
                        },
                    },

                    createNetwork : function ({}, cb) {
                        return cb(null, true)
                    }
                });
            index.execute(kuberDriver, method, kuberOptions, function () {
                sinon.restore();
                done();
            })
        });
    });

    describe("calling execute getExtras", function () {
        let method = 'getExtras';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute getRegions", function () {
        let method = 'getRegions';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute deployCluster", function () {
        let method = 'deployCluster';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute getDeployClusterStatus", function () {
        let method = 'getDeployClusterStatus';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute getDNSInfo", function () {
        let method = 'getDNSInfo';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute scaleCluster", function () {
        let method = 'scaleCluster';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute getCluster", function () {
        let method = 'getCluster';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute updateCluster", function () {
        let method = 'updateCluster';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute deleteCluster", function () {
        let method = 'deleteCluster';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute publishPorts", function () {
        let method = 'publishPorts';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute createLoadBalancer", function () {
        let method = 'createLoadBalancer';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute updateExternalLB", function () {
        let method = 'updateExternalLB';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute deleteLoadBalancer", function () {
        let method = 'deleteLoadBalancer';
        it("Success", function (done) {
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });

    describe("calling execute deployService", function () {
        let method = 'deployService';
        it("Success", function (done) {
            sinon
                .stub(kubernetesDriver, 'deployService')
                .yields(null, true);
            sinon
                .stub(kubernetesDriver, 'inspectService')
                .yields(null, true);
            sinon
                .stub(utils, 'updateEnvSettings')
                .yields(null, true);
            index.execute(kuberDriver, method, kuberOptions, function () {
                sinon.restore();
                done();
            })
        });

        it("fail deployService", function (done) {
            sinon
                .stub(kubernetesDriver, 'deployService')
                .yields("errror", null);
            sinon
                .stub(kubernetesDriver, 'inspectService')
                .yields(null, true);
            sinon
                .stub(utils, 'updateEnvSettings')
                .yields(null, true);
            index.execute(kuberDriver, method, kuberOptions, function () {
                sinon.restore();
                done();
            })
        });

        it("fail deployService", function (done) {
            sinon
                .stub(kubernetesDriver, 'deployService')
                .yields(null, true);
            sinon
                .stub(kubernetesDriver, 'inspectService')
                .yields("error", null);
            sinon
                .stub(utils, 'updateEnvSettings')
                .yields(null, true);
            index.execute(kuberDriver, method, kuberOptions, function () {
                sinon.restore();
                done();
            })
        });

        it("fail deployService", function (done) {
            sinon
                .stub(kubernetesDriver, 'deployService')
                .yields(null, true);
            sinon
                .stub(kubernetesDriver, 'inspectService')
                .yields(null, true);
            sinon
                .stub(utils, 'updateEnvSettings')
                .yields("error", null);
            index.execute(kuberDriver, method, kuberOptions, function () {
                sinon.restore();
                done();
            })
        });
    });

    describe("calling execute redeployService", function () {
        let method = 'redeployService';
        it("Success", function (done) {
            sinon
                .stub(kubernetesDriver, 'redeployService')
                .yields(null, true);
            sinon
                .stub(kubernetesDriver, 'inspectService')
                .yields(null, true);
            sinon
                .stub(utils, 'updateEnvSettings')
                .yields(null, true);
            index.execute(kuberDriver, method, kuberOptions, function () {
                done();
            })
        });
    });
});
