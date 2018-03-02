/* eslint-disable max-statements*/

const moment = require('moment-business-days');

function businessAddWithBlocked(startMoment, daysToAdd, blockedPeriods) {
	// Function businessAdd() fails on non-integers
	const taskEnd = moment(startMoment.businessAdd(Math.round(daysToAdd))._d);

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
 * @param {number} timeAllocation - The time allocation percentage.
 * @param {number} nrNormDays - Number of normalized days required to complete all tasks.
 * @param {Object[]} blockedPeriods - Array of blocked periods.
 * @return {Object} the end date in date string format.
 */
function calcEnd(start, timeAllocation, nrNormDays, blockedPeriods) {
	const daysToAdd = nrNormDays / timeAllocation;
	return businessAddWithBlocked(start, daysToAdd, blockedPeriods);
}

/**
 * Checks if a provided string is a valid date
 *
 * @param {string} date - The date to parse.
 * @return {boolean} true if the input date is valid
 */
function isValidDate(date) {
	const timestamp = Date.parse(date);
	return !isNaN(timestamp);
}

function sumNrNormDays(tasks) {
	return tasks.reduce((acc, task) => acc + task.nrNormDays, 0);
}

function calcDeadlines(tasks, start, blockedPeriods, timeAllocation) {
	let lastDeadline = moment(start);
	return tasks.map(task => {
		const realDays = task.nrNormDays / timeAllocation;
		const taskDeadline = businessAddWithBlocked(lastDeadline, realDays, blockedPeriods);
		lastDeadline = taskDeadline;
		return Object.assign({}, task, {
			deadline: taskDeadline.format('YYYY-MM-DD'),
			realDays,
		});
	});
}

/**
 * Task to be scheduled.
 *
 * @typedef Task
 * @property {string} id ID of the task
 * @property {number} nrNormDays Number of normalized days required to complete the task (assuming 100% time allocation).
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
 * @typedef SchedulingResult
 * @property {Object[]} deadlines List of deadline objects
 * @property {string} start String representing the start date in ISO format (eg. '2018-03-19').
 * @property {string} end String representing the end date in ISO format (eg. '2018-03-19').
 * @property {number} nrNormDays Number of normalized days required to complete all tasks (e.g. if time allocation would be 100%)
 * @property {number} timeAllocation The time allocation in percentage (0..1)
 * @property {number} nrRealDays Number of business days required to complete all tasks (considering time allocation.
 */

/**
 * Calculates the scheduling of a set of tasks.
 *
 * @param {Object} params - Input parameters for scheduling calculation.
 * @param {Task[]} params.tasks - An array of tasks.
 * @param {string} params.start - A string representing the starting date in ISO format (eg. '2018-03-19').
 * @param {string} [params.end] - A string representing the end date in ISO format (eg. '2018-03-19').
 * @param {number} [params.timeAllocation] - The time allocation percentage.
 * @param {BlockedPeriod[]} [params.blockedPeriods] - Array of blocked periods.
 * @return {SchedulingResult} an object describing the planning calculated
 */
function schedule(params) {
	// Input validation
	if (!isValidDate(params.start)) {
		throw new Error(`Invalid start date (${params.start}). Must be in format YYYY-MM-DD.`);
	}
	if (params.end && !isValidDate(params.end)) {
		throw new Error(`Invalid end date (${params.end}). Must be in format YYYY-MM-DD.`);
	}
	if (Boolean(params.end) && Boolean(params.timeAllocation)) {
		throw new Error('Only provide end date or time allocation percentage');
	}

	const startDate = moment(params.start);

	const nrNormDays = sumNrNormDays(params.tasks);

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
		endDate = calcEnd(startDate, params.timeAllocation, nrNormDays, blockedPeriods);
	}

	const nrRealDays = startDate.businessDiff(moment(endDate));

	let timeAllocation;
	if (params.end) {
		// End date is given -> calculate time allocation
		timeAllocation = nrNormDays / nrRealDays;
	} else {
		timeAllocation = params.timeAllocation;
	}

	const deadlines = calcDeadlines(params.tasks, startDate, blockedPeriods, timeAllocation);

	return {
		deadlines,
		end: endDate.format('YYYY-MM-DD'),
		nrNormDays,
		nrRealDays,
		start: startDate.format('YYYY-MM-DD'),
		timeAllocation,
	};
}

module.exports = {
	schedule
};
