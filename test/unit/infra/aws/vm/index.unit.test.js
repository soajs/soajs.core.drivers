"use strict";
const helper = require("../../../../helper");
const assert = require("assert");
const sinon = require('sinon');

const service = helper.requireModule('./infra/aws/index.js');

let dD = require('../../../../schemas/aws/cluster.js');
let info = {};
let options = {};

describe("testing /lib/aws/index.js", function () {
	process.env.SOAJS_CLOOSTRO_TEST = true;
	
	describe("calling executeDriver - inspectService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listServices", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - deleteService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - restartService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - redeployService", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - powerOffVM", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - startVM", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listVmSizes", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listVmImagePublishers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listVmImagePublisherOffers", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - listVmImageVersions", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - runCommand", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	describe("calling executeDriver - getLogs", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
	
	describe("calling executeDriver - updtadeVmLabels", function () {
		afterEach((done) => {
			sinon.restore();
			done();
		});
		it("Success", function (done) {
			done();
		});
	});
	
});
