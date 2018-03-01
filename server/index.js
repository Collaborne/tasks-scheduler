/* eslint-disable max-statements*/

'use strict';

const Utils = require('./utils');
const moment = require('moment');

// Temporarily hardcoded
// TODO: go through provided tasks description and calculate them
const TOTAL_PROJECT_DAYS = 20;

/**
 * Calculates the end date for the scheduled task.
 *
 * @param {number} start - The starting date in date string format.
 * @param {number} timeAllocationPercentage - The time allocation percentage.
 * @return {number} the end date in date string format.
 */
function _calcEnd(start, timeAllocationPercentage) {
	const startMoment = moment(start);
	const daysToAdd = TOTAL_PROJECT_DAYS / timeAllocationPercentage;
	const endMoment = Utils.addBusinessDays(startMoment, daysToAdd);
	return moment(endMoment).toDate().getTime();
}

function _calcTimeAllocationPercentage(availableDays) {
	return Math.round(TOTAL_PROJECT_DAYS / availableDays * 10) / 10;
}

/**
 * Checks if a provided string is a valid date and parses it.
 *
 * @param {string} date - The date to parse.
 * @return {undefined | number} undefined if the input date is not valid, the in date string format otherwise.
 */
function _parseDate(date) {
	const timestamp = Date.parse(date);
	return isNaN(timestamp) ? undefined : timestamp;
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
	const startDate = _parseDate(params.start);
	if (!_parseDate(params.start)) {
		throw new Error(`Start date provided is not valid: ${params.start}`);
	}

	// Raise an exception if both end and time allocation percentage are set
	if (Boolean(params.end) && Boolean(params.timeAllocationPercentage)) {
		throw new Error('Both end and time allocation percentage cannot be set');
	}

	let endDate;
	let timeAllocationPercentage;
	let nrProjectDays;
	if (params.end) {
		if (!_parseDate(params.end)) {
			throw new Error(`End date provided is not valid: ${params.end}`);
		}
		nrProjectDays = Utils.diffBusinessDays(params.start, params.end);
		if (nrProjectDays < TOTAL_PROJECT_DAYS) {
			// TODO: We should discuss the service behavior here
			throw new Error('End date is too strict for completing the project');
		}
		endDate = new Date(params.end).getTime();
		timeAllocationPercentage = _calcTimeAllocationPercentage(nrProjectDays);
	}

	if (params.timeAllocationPercentage) {
		endDate = _calcEnd(startDate, params.timeAllocationPercentage);
		nrProjectDays = Utils.diffBusinessDays(params.start, params.end);
		timeAllocationPercentage = params.timeAllocationPercentage;
	}

	// Properly format output
	const end = new Date(endDate).toISOString();

	return {
		end,
		nrProjectDays,
		timeAllocationPercentage,
	};
}

module.exports = {
	calc
};
