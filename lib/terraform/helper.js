'use strict';

const fs = require('fs');
const path = require('path');
const async = require('async');
const rimraf = require('rimraf');
const stripAnsi = require('strip-ansi');
const EasyZip = require('easy-zip').EasyZip;
const spawn = require("child_process").spawn;

const config = require('./config.js');

const helper = {

    /**
     * Create a temp folder and write files provided as input
     * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
     */
    writeToTempFolder: function(options, cb) {
        fs.mkdtemp(options.params.path, function(error, tempFolderPath) {
            if (error) return cb({error, code: 728});

            async.each(options.params.files, function(oneFile, callback) {
                let templatePath = path.join(tempFolderPath, oneFile.name);
                return fs.writeFile(templatePath, oneFile.content, callback);
            }, function(error) {
                if (error) return cb({error, code: 728});
                return cb(null, { tempFolderPath });
            });
        });
    },

    /**
     * Backup a terraform operation
     * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
     */
    backup: function(operation, options, data, cb) {
        if(process.env.SOAJS_LOG_TERRAFORM_OUTPUT && process.env.SOAJS_LOG_TERRAFORM_OUTPUT === 'true') {
            // do not create backups if terraform output is being shown
            return cb();
        }

        options.soajs.log.debug('Creating a backup of the terraform execution ...');
        fs.mkdir(config.terraform.backupLocation, function(error) {
            if(error && error.code !== 'EEXIST') {
                options.soajs.log.debug('Unable to create backup folder for terraform executions ...');
                return cb();
            }

            let zip = new EasyZip(), zipFileName = '';
            if(data && data.render) {
                zip.file('template.tf', data.render);
            }
            if(data.templateOutput && (data.templateOutput.output || data.templateOutput.error)) {
                let logs = '';
                if(data.templateOutput.output) logs = logs.concat(data.templateOutput.output);
                if(data.templateOutput.error) logs = logs.concat(data.templateOutput.error);
                zip.file('output.log', logs);
            }

            // zip file name: infraProviderName-layerName-operation-timestamp.zip
            if(options.infra && options.infra.name) zipFileName += `${options.infra.name}-`;
            if(options.params && options.params.layerName) zipFileName += `${options.params.layerName}-`;
            zipFileName += `${operation}-${new Date().getTime()}.zip`;

            zip.writeToFile(config.terraform.backupLocation + zipFileName);
            return cb();
        });
    },

    /**
     * Spawn a child process and run commands provided as input
     * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
     */
    runChildProcess: function(options, cb) {
        let stdoutData = '', stderrData = '';
        let run = spawn('bash', [ '-c', options.params.command ], { cwd: options.params.cwd });

        run.stdout.on('data', (data) => {
            if(process.env.SOAJS_LOG_TERRAFORM_OUTPUT && process.env.SOAJS_LOG_TERRAFORM_OUTPUT === 'true') process.stdout.write(data.toString());
            stdoutData += data.toString();
        });

        run.stderr.on('data', (data) => {
            if(process.env.SOAJS_LOG_TERRAFORM_OUTPUT && process.env.SOAJS_LOG_TERRAFORM_OUTPUT === 'true') process.stdout.write(data.toString());
            stderrData += data.toString();
        });

        run.on('error', (error) => {
            return cb(error);
        });

        run.on('close', (code) => {
            if(code !== 0) {
                return cb({ output: stdoutData, error: stderrData });
            }
            return cb(null, { output: stdoutData });
        });
    },

    /**
     * Delete a folder from the filesystem
     * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
     */
    cleanup: function(options, cb) {
        return rimraf(options.tempFolderPath, cb);
    },

    /**
     * Parse a string output and extract the error value
     * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
     */
    parseErrorOutput: function(options) {
        if(!options.excludedPart) options.excludedPart = config.terraform.errorExcludedMessage;

        if(options.output.indexOf(options.excludedPart) !== -1) {
            return stripAnsi(options.output.substring(0, options.output.indexOf(options.excludedPart)));
        }

        return stripAnsi(options.output);
    }

};

module.exports = helper;
