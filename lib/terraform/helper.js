'use strict';

const fs = require('fs');
const path = require('path');
const async = require('async');
const spawn = require("child_process").spawn;

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
     * Spawn a child process and run commands provided as input
     * @param  {Object}   options  Data passed to function as params
	 * @param  {Function} cb    Callback function
	 * @return {void}
     */
    runChildProcess: function(options, cb) {
        let runOutput = '';
        let run = spawn('bash', [ '-c', options.params.command ], { cwd: options.params.cwd });

        run.stdout.on('data', (data) => {
            if (!options.params.suppressProcessLogs) options.soajs.log.debug(data.toString());
            runOutput += data.toString();
        });
        run.on('error', (error) => {
            return cb(error);
        });
        run.on('close', () => {
            return cb(null, { templateOutput: runOutput });
        });
    }

};

module.exports = helper;
