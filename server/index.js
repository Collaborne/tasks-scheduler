/* eslint-disable max-statements*/

'use strict';

const Utils = require('./utils');
const moment = require('moment');

// Temporarily hardcoded
// TODO: go through provided tasks description and calculate them
const TOTAL_PROJECT_DAYS = 20;

function _calcEnd(start, timeAllocationPercentage) {
	const startMoment = moment(start);
	const daysToAdd = TOTAL_PROJECT_DAYS / timeAllocationPercentage;
	const endMoment = startMoment.add(daysToAdd, 'd');
	return moment(endMoment).toDate();
}

function _calcTimeAllocationPercentage() {
	return;
}

/**
 * Calculates the scheduling of a set of tasks.
 *
 * @param {Object} params - Input parameters for scheduling calculation.
 * @param {string} params.start - A string representing the starting date in ISO format.
 * @param {string} [params.end] - A string representing the end date in ISO format.
 * @param {number} [params.timeAllocationPercentage] - The time allocation percentage.
 * @return {Object} an object describing the planning calculated
 */
function calc(params) {
	// Raise an exception if both end and time allocation percentage are set
	if (Boolean(params.end) && Boolean(params.timeAllocationPercentage)) {
		throw new Error('Both end and time allocation percentage cannot be set');
	}

	// TODO: check input dates are valid
	const startDate = Date.parse(params.start);

	const endDate = params.end ? new Date(params.end).toISOString() : _calcEnd(startDate, params.timeAllocationPercentage);

	const timeAllocationPercentage = params.timeAllocationPercentage ? new Date(params.timeAllocationPercentage).toISOString() : _calcTimeAllocationPercentage();

	const nrProjectDays = Utils.diffBusinessDays(params.start, params.end);

	// Properly format output
	const end = endDate.toISOString();

	return {
		end,
		nrProjectDays,
		timeAllocationPercentage,
	};
}

module.exports = {
	calc
};
