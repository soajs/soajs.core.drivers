'use strict';

const async = require('async');
const utils = require('../../../../lib/utils/utils.js');

const sizes = {

	/**
	* List available virtual machine sizes

	* @param  {Object}   options  Data passed to function as params
	* @param  {Function} cb    Callback function
	* @return {void}
	*/
	list: function (options, cb) {
		return cb(null, [
			{
				"name": "t2.micro",
				"label": "T2 Micro / 1 vCPUs x 1 GiB",
				"group": "General Purpose"
			},
			{
				"name": "t2.small",
				"label": "T2 Small / 1 vCPUs x 2 GiB",
				"group": "General Purpose"
			},
			{
				"name": "t2.medium",
				"label": "T2 Medium / 2 vCPUs x 4 GiB",
				"group": "General Purpose"
			},
			{
				"name": "t2.large",
				"label": "T2 Large / 2 vCPUs x 8 GiB",
				"group": "General Purpose"
			},
			{
				"name": "t2.xlarge",
				"label": "T2 XLarge / 4 vCPUs x 16 GiB",
				"group": "General Purpose"
			},
			{
				"name": "t2.2xlarge",
				"label": "T2 2XLarge / 8 vCPUs x 32 GiB",
				"group": "General Purpose"
			},
			{
				"name": "m4.large",
				"label": "M4 Large / 2 vCPUs x 8 GiB",
				"group": "General Purpose"
			},
			{
				"name": "m4.xlarge",
				"label": "M4 XLarge / 4 vCPUs x 16 GiB",
				"group": "General Purpose"
			},
			{
				"name": "m4.2xlarge",
				"label": "M4 2XLarge / 8 vCPUs x 32 GiB",
				"group": "General Purpose"
			},
			{
				"name": "m4.4xlarge",
				"label": "M4 4XLarge / 16 vCPUs x 64 GiB",
				"group": "General Purpose"
			},
			{
				"name": "c4.large",
				"label": "C4 Large / 2 vCPUs x 3.75 GiB",
				"group": "Compute Optimized"
			},
			{
				"name": "c4.xlarge",
				"label": "C4 XLarge / 4 vCPUs x 7.5 GiB",
				"group": "Compute Optimized"
			},
			{
				"name": "c4.2xlarge",
				"label": "C4 2XLarge / 8 vCPUs x 15 GiB",
				"group": "Compute Optimized"
			},
			{
				"name": "c4.4xlarge",
				"label": "C4 4XLarge / 16 vCPUs x 30 GiB",
				"group": "Compute Optimized"
			},
			{
				"name": "r4.large",
				"label": "R4 Large / 2 vCPUs x 15.25 GiB",
				"group": "Memory Optimized"
			},
			{
				"name": "r4.xlarge",
				"label": "R4 XLarge / 4 vCPUs x 30.5 GiB",
				"group": "Memory Optimized"
			},
			{
				"name": "r4.2xlarge",
				"label": "R4 2XLarge / 8 vCPUs x 61 GiB",
				"group": "Memory Optimized"
			},
			{
				"name": "r4.4xlarge",
				"label": "R4 4XLarge / 16 vCPUs x 122 GiB",
				"group": "Memory Optimized"
			},
			{
				"name": "r3.large",
				"label": "R3 Large / 2 vCPUs x 15 GiB",
				"group": "Memory Optimized"
			},
			{
				"name": "r3.xlarge",
				"label": "R3 XLarge / 4 vCPUs x 30.5 GiB",
				"group": "Memory Optimized"
			},
			{
				"name": "r3.2xlarge",
				"label": "R3 2XLarge / 8 vCPUs x 61 GiB",
				"group": "Memory Optimized"
			},
			{
				"name": "r3.4xlarge",
				"label": "R3 4XLarge / 16 vCPUs x 122 GiB",
				"group": "Memory Optimized"
			},
			{
				"name": "i3.large",
				"label": "I3 Large / 2 vCPUs x 15.25 GiB",
				"group": "Storage Optimized"
			},
			{
				"name": "i3.xlarge",
				"label": "I3 XLarge / 4 vCPUs x 30.5 GiB",
				"group": "Storage Optimized"
			},
			{
				"name": "i3.2xlarge",
				"label": "I3 2XLarge / 8 vCPUs x 61 GiB",
				"group": "Storage Optimized"
			},
			{
				"name": "i3.4xlarge",
				"label": "I3 4XLarge / 16 vCPUs x 122 GiB",
				"group": "Storage Optimized"
			}
		]);
	}

};

module.exports = sizes;
