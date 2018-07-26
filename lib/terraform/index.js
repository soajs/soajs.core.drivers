'use strict';

const fs = require('fs');
const path = require('path');
const async = require('async');
const handlebars = require('handlebars');

const config = require('./config.js');
const helper = require('./helper.js');
const utils = require('../utils/utils.js');
const errors = require('../utils/errors.js');

handlebars.registerHelper('inc', function(value, inc) {
    return parseInt(value) + parseInt(inc);
});

handlebars.registerHelper('times', function(n, block) {
    let accum = '';
    for(let i = 0; i < n; ++i) {
        accum += block.fn(i);
    }

    return accum;
});

const engine = {

    /**
     * Render a terraform dynamic template and return output
     * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
     */
    render: function(options, cb) {
        let template, render;
        if(!options.params || !options.params.template || !options.params.template.content) {
            return utils.checkError('Missing template content', 727, cb);
        }

        try {
            template = handlebars.compile(options.params.template.content);
            if(options.params.template._id){
                if(!options.params.input.tags){
                    options.params.input.tags = {};
                }
                options.params.input.tags['soajs.template.id'] = options.params.template._id.toString();
            }
            render = template(options.params.input);
        }
        catch(e) {
            return utils.checkError(e, 727, cb);
        }

        return cb(null, { render });
    },

    /**
     * Render and apply a terraform template
     * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
     */
    apply: function(options, cb) {

        function renderTemplate(callback) {
            options.soajs.log.debug('Rendering template ...');
            engine.render(options, function(error, output) {
                if(error) return callback({error: error.value, code: error.code});

                return callback(null, { render: output.render });
            });
        }

        function writeTemplate(result, callback) {
            options.soajs.log.debug('Writing template to temp folder ...');
            let templateFolderPath = path.join(__dirname, config.terraform.tempFolderPrefix);
            let templateFiles = [
                { name: config.terraform.templateDefaultName, content: result.renderTemplate.render }
            ];

            //if input includes a state object, add it as well
            if(options.params && options.params.templateState && Object.keys(options.params.templateState).length  > 0) {
                templateFiles.push({ name: config.terraform.stateFileName, content: JSON.stringify(options.params.templateState, null, 2) });
            }

            options.params.path = templateFolderPath;
            options.params.files = templateFiles;
            helper.writeToTempFolder(options, function(error, output) {
                if (error) return callback({error, code: 728});
                return callback(null, output);
            });
        }

        function applyTemplate(result, callback) {
            options.soajs.log.debug('Applying template ...');
            options.params.command = config.terraform.applyCommand;
            options.params.cwd = result.writeTemplate.tempFolderPath;
            helper.runChildProcess(options, function(error, output) {
                if(error) {
                    options.soajs.log.error('Applying template FAILED ...');
                    return callback(null, error); // pass error to readOutput and cleanup, then trigger rollback if applicable
                }
                return callback(null, output);
            });
        }

        function readOutput(result, callback) {
            options.soajs.log.debug('Reading output state file ...');
            let stateFilePath = path.join(result.writeTemplate.tempFolderPath, config.terraform.stateFileName);

            function readFile(counter, readFileCb) {
                fs.readFile(stateFilePath, { encoding: 'utf8' }, function(error, stateFileData) {
                    if(error) {
                        if(counter < config.terraform.stateFileReadMaxAttempts) {
                            return setTimeout(readFile.bind(null, ++counter, readFileCb), config.terraform.stateFileReadTimeout);
                        }

                        options.soajs.log.error('Unable to read template state file ...');
                        options.soajs.log.error(error);

                        if(result.applyTemplate && result.applyTemplate.error) {
                            // apply failed + no state file could be read means the template failed because of a syntax error
                            // return an empty object for the state file
                            return readFileCb(null, '{}');
                        }

                        let readFileError = { code: 730, msg: errors[730], debug: error };
                        return readFileCb({ error: readFileError });
                    }

                    return readFileCb(null, stateFileData);
                });
            }

            readFile(0, function(error, stateFileData) {
                if(error) {
                    stateFileData = error; // do not stop execution, return state file read error instead
                }
                else {
                    try {
                        stateFileData = JSON.parse(stateFileData);
                    }
                    catch(e) {
                        let parseError = { code: 730, msg: errors[730], debug: e };
                        return callback(null, { error: parseError }); // do not stop execution, return state file parse error instead
                    }
                }

                return callback(null, { stateFileData });
            });
        }

        function cleanup(result, callback) {
            options.soajs.log.debug('Cleaing up temp folder ...');
            helper.cleanup({ tempFolderPath: result.writeTemplate.tempFolderPath }, function(error) {
                if(error) options.soajs.log.error('Cleanup failed after applying terraform template!', error);
                return callback(null, true);
            });
        }

        function rollback(options, result, terraformErrors, callback) {
            if(!result.readOutput || !result.readOutput.stateFileData || (typeof(result.readOutput.stateFileData) === 'object' && Object.keys(result.readOutput.stateFileData).length === 0)) {
                options.soajs.log.debug('Terraform state file not found, rollback is not possible ...');
                return callback({
                    source: 'driver',
                    value: terraformErrors.applyError,
                    code: 729,
                    msg: terraformErrors.applyError
                });
            }

            options.soajs.log.debug('Terraform deployment failed, rolling back ...');
            // options.params.layerName and options.params.exclude are already set
            options.params.template = result.renderTemplate.render;
            options.params.templateState = result.readOutput.stateFileData;
            return engine.destroy(options, function(destroyError, destroyResult) {
                if(destroyError) {
                    options.soajs.log.debug('Terraform rollback failed ...');
                    terraformErrors.destroyError = destroyError;
                }

                return callback({
                    source: 'driver',
                    value: terraformErrors.applyError,
                    code: 729,
                    msg: terraformErrors.applyError
                });
            });
        }

        async.auto({
            // render template + input using handlebars
            renderTemplate,
            // create temp folder and write template to folder
            writeTemplate: ['renderTemplate', writeTemplate],
            // terraform init and terraform apply
            applyTemplate: ['writeTemplate', applyTemplate],
            // read terraform.tfstate file
            readOutput: ['writeTemplate', 'applyTemplate', readOutput],
            // delete temp folder
            cleanup: ['writeTemplate', 'readOutput', cleanup]
        }, function(error, result) {
            utils.checkError(error && error.error, error && error.code, cb, () => {
                let backupData = { render: result.renderTemplate.render, templateOutput: result.applyTemplate };
                helper.backup((options.params.templateState) ? 'modify' : 'create', options, backupData, function() {
                    if(result.applyTemplate && result.applyTemplate.error) {
                        let terraformErrors = {};
                        terraformErrors.applyError = helper.parseErrorOutput({ output: result.applyTemplate.error });
                        // not options.params.templateState -> this is a create operation
                        // result.readOutput.stateFileData -> not a terraform syntax error, deployment started but failed
                        if(!options.params.templateState && result.readOutput && result.readOutput.stateFileData) {
                            return rollback(options, result, terraformErrors, cb);
                        }
                        else {
                            // this is a modify operation, do not destroy | return error
                            return utils.checkError(error && error.error, error && error.code, cb, cb);
                        }
                    }

                    return cb(null, {
                        applied: true,
                        stateFileData: result.readOutput.stateFileData,
                        output: result.applyTemplate.output,
                        render: result.renderTemplate.render
                    });
                });
            });
        });
    },

    /**
     * Destroy an infra created by a terraform template
     * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
     */
    destroy: function(options, cb) {

        function writeTemplate(callback) {
            options.soajs.log.debug('Writing template to temp folder ...');
            let templateFolderPath = path.join(__dirname, config.terraform.tempFolderPrefix);
            let templateFiles = [
                { name: config.terraform.templateDefaultName, content: options.params.template },
                { name: config.terraform.stateFileName, content: JSON.stringify(options.params.templateState, null, 2) },
            ];

            options.params.path = templateFolderPath;
            options.params.files = templateFiles;
            helper.writeToTempFolder(options, function(error, output) {
                if (error) return callback({error, code: 728});
                return callback(null, output);
            });
        }

        function excludeResources(result, callback) {
            if(!options.params.exclude || (Array.isArray(options.params.exclude) && options.params.exclude.length === 0)) {
                return callback(null, true);
            }

            options.soajs.log.debug('Excluding sensitive resources before destroying...');
            options.params.command = config.terraform.excludeResourceCommand;
            options.params.cwd = result.writeTemplate.tempFolderPath;
            options.params.exclude.forEach((oneExcludedResource) => options.params.command += `${oneExcludedResource} `);
            helper.runChildProcess(options, function(error, output) {
                if(error) options.soajs.log.debug(error);
                return callback(null, output);
            });
        }

        function destroyTemplate(result, callback) {
            options.soajs.log.debug('Destroying infra created using template ...');
            options.params.command = config.terraform.destroyCommand;
            options.params.cwd = result.writeTemplate.tempFolderPath;
            helper.runChildProcess(options, function(error, output) {
                if(error) return callback({ error, code: 729 });
                return callback(null, output);
            });
        }

        function cleanup(result, callback) {
            options.soajs.log.debug('Cleaing up temp folder ...');
            helper.cleanup({ tempFolderPath: result.writeTemplate.tempFolderPath }, function(error) {
                if(error) options.soajs.log.error('Cleanup failed after destroying terraform template!', error);
                return callback(null, true);
            });
        }

        async.auto({
            // create temp folder and write template and state file to it
            writeTemplate,
            // exclude resources that should'nt be destroyed
            excludeResources: ['writeTemplate', excludeResources],
            // terraform destroy
            destroyTemplate: ['writeTemplate', 'excludeResources', destroyTemplate],
            //delete temp folder
            cleanup: ['destroyTemplate', cleanup]
        }, function(error, result) {
            utils.checkError(error && error.error, error && error.code, cb, () => {
                let backupData = { render: options.params.template, templateOutput: result.destroyTemplate };
                helper.backup('destroy', options, backupData, function() {
                    return cb(null, {
                        destroyed: true,
                        output: result.destroyTemplate.output
                    });
                });
            });
        });
    }

};

module.exports = engine;
