/* eslint-disable max-statements*/

const moment = require('moment-business-days');

function businessAddWithBlocked(startMoment, daysToAdd, blockedPeriods) {
	const taskEnd = moment(startMoment.businessAdd(daysToAdd)._d);

	// Check if task ends within one of the blocked periods provided
	const blockPeriod = blockedPeriods.find(block => taskEnd.isAfter(block.start));
	if (blockPeriod) {
		// Move the deadline by the number of blocked days
		return moment(taskEnd.businessAdd(blockPeriod.nrBlockDays)._d);
	}

	return taskEnd;
}

/**
 * Calculates the end date for the scheduled task.
 *
 * @param {Moment} start - The starting date in date string format.
 * @param {number} timeAllocationPercentage - The time allocation percentage.
 * @param {number} totalProjectDays - Number of days required to complete the project.
 * @param {Object[]} blockedPeriods - Array of blocked periods.
 * @return {Object} the end date in date string format.
 */
function _calcEnd(start, timeAllocationPercentage, totalProjectDays, blockedPeriods) {
	const daysToAdd = totalProjectDays / timeAllocationPercentage;
	return businessAddWithBlocked(start, daysToAdd, blockedPeriods);
}

function _calcTimeAllocationPercentage(availableDays, totalProjectDays) {
	return totalProjectDays / availableDays;
}

/**
 * Checks if a provided string is a valid date
 *
 * @param {string} date - The date to parse.
 * @return {boolean} true if the input date is valid
 */
function _isValidDate(date) {
	const timestamp = Date.parse(date);
	return !isNaN(timestamp);
}

function getTotalProjectDays(tasks) {
	return tasks.reduce((acc, task) => acc + task.days, 0);
}

function calcDeadlines(tasks, start, blockedPeriods) {
	let lastDeadline = moment(start);
	return tasks.map(task => {
		const taskDeadline = businessAddWithBlocked(lastDeadline, task.days, blockedPeriods);
		lastDeadline = taskDeadline;
		return Object.assign({}, task, {
			deadline: taskDeadline.format('YYYY-MM-DD'),
		});
	});
}

/**
 * Task to be scheduled.
 *
 * @typedef Task
 * @property {string} id Task unique name
 * @property {number} days Number of business days required to complete the task.
 */

/**
 * Interval of time not available for tasks scheduling.
 *
 * @typedef BlockedPeriod
 * @property {string} start String representing the start date of the period in ISO format (eg. '2018-03-19').
 * @property {string} end String representing the end date of the period in ISO format (eg. '2018-03-19').
 */

/**
 * The computed scheduling.
 *
 * @typedef Scheduling
 * @property {Object[]} deadlines List of deadline objects
 * @property {string} end String representing the end date in ISO format (eg. '2018-03-19').
 * @property {number} nrProjectDays Number of business days required to complete the project.
 * @property {number} timeAllocationPercentage The time allocation percentage.
 * @property {number} totalProjectDays Total number of days required to complete the project.
 */

/**
 * Calculates the scheduling of a set of tasks.
 *
 * @param {Object} params - Input parameters for scheduling calculation.
 * @param {Task[]} params.tasks - An array of tasks.
 * @param {string} params.start - A string representing the starting date in ISO format (eg. '2018-03-19').
 * @param {string} [params.end] - A string representing the end date in ISO format (eg. '2018-03-19').
 * @param {number} [params.timeAllocationPercentage] - The time allocation percentage.
 * @param {BlockedPeriod[]} [params.blockedPeriods] - Array of blocked periods.
 * @return {Scheduling} an object describing the planning calculated
 */
function calc(params) {
	// Input validation
	if (!_isValidDate(params.start)) {
		throw new Error(`Invalid start date (${params.start}). Must be in format YYYY-MM-DD.`);
	}
	if (params.end && !_isValidDate(params.end)) {
		throw new Error(`Invalid end date (${params.end}). Must be in format YYYY-MM-DD.`);
	}
	if (Boolean(params.end) && Boolean(params.timeAllocationPercentage)) {
		throw new Error('Only provide end date or time allocation percentage');
	}

	const startDate = moment(params.start);

	const totalProjectDays = getTotalProjectDays(params.tasks);

	const blockedPeriods = (params.blockedPeriods || []).map(period => ({
		nrBlockDays: moment(period.start).businessDiff(moment(period.end)),
		start: period.start,
	}));

	let endDate;
	if (params.end) {
		// End date is given -> calculate time allocation
		endDate = moment(params.end);
	} else {
		// Time allocation is given -> calculate end date
		endDate = _calcEnd(startDate, params.timeAllocationPercentage, totalProjectDays, blockedPeriods);
	}

	const nrProjectDays = startDate.businessDiff(moment(endDate));
	if (nrProjectDays < totalProjectDays) {
		// TODO: We should discuss the service behavior here
		throw new Error('End date is too strict for completing the project');
	}

	let timeAllocationPercentage;
	if (params.end) {
		// End date is given -> calculate time allocation
		timeAllocationPercentage = _calcTimeAllocationPercentage(nrProjectDays, totalProjectDays);
	} else {
		timeAllocationPercentage = params.timeAllocationPercentage;
	}

	const deadlines = calcDeadlines(params.tasks, startDate, blockedPeriods);

	return {
		deadlines,
		end: endDate.format('YYYY-MM-DD'),
		nrProjectDays,
		timeAllocationPercentage,
		totalProjectDays,
	};
}

module.exports = {
	calc
};
