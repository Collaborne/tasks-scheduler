/* eslint-disable max-statements*/

'use strict';

const Utils = require('./date-utils');
const moment = require('moment');

// Temporarily hardcoded
// TODO: go through provided tasks description and calculate them
const TOTAL_PROJECT_DAYS = 20;

/**
 * Calculates the end date for the scheduled task.
 *
 * @param {number} start - The starting date in date string format.
 * @param {number} timeAllocationPercentage - The time allocation percentage.
 * @param {number} totalProjectDays - Number of days required to complete the project.
 * @return {number} the end date in date string format.
 */
function _calcEnd(start, timeAllocationPercentage, totalProjectDays) {
	const startMoment = moment(start);
	const daysToAdd = totalProjectDays / timeAllocationPercentage;
	const endMoment = Utils.addBusinessDays(startMoment, daysToAdd);
	return moment(endMoment).toDate().getTime();
}

function _calcTimeAllocationPercentage(availableDays, totalProjectDays) {
	return Math.round(totalProjectDays / availableDays * 10) / 10;
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

function getTotaProjectDays(tasks) {
	return tasks.reduce((acc, task) => acc + task.days, 0);
}

/**
 * Calculates the scheduling of a set of tasks.
 *
 * @param {Object} params - Input parameters for scheduling calculation.
 * @param {string} params.start - A string representing the starting date in ISO format.
 * @param {string} [params.end] - A string representing the end date in ISO format.
 * @param {number} [params.timeAllocationPercentage] - The time allocation percentage.
 * @param {Object[]} [params.tasks] - An array of tasks.
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

	const totalProjectDays = getTotaProjectDays(params.tasks);

	let endDate;
	let timeAllocationPercentage;
	let nrProjectDays;
	if (params.end) {
		if (!_parseDate(params.end)) {
			throw new Error(`End date provided is not valid: ${params.end}`);
		}
		nrProjectDays = Utils.diffBusinessDays(params.start, params.end);
		if (nrProjectDays < totalProjectDays) {
			// TODO: We should discuss the service behavior here
			throw new Error('End date is too strict for completing the project');
		}
		endDate = new Date(params.end).getTime();
		timeAllocationPercentage = _calcTimeAllocationPercentage(nrProjectDays, totalProjectDays);
	}

	if (params.timeAllocationPercentage) {
		endDate = _calcEnd(startDate, params.timeAllocationPercentage, totalProjectDays);
		nrProjectDays = Utils.diffBusinessDays(params.start, endDate);
		timeAllocationPercentage = params.timeAllocationPercentage;
	}

	// Properly format output
	const end = new Date(endDate).toISOString();

	return {
		end,
		nrProjectDays,
		timeAllocationPercentage,
		totalProjectDays,
	};
}

module.exports = {
	calc
};
