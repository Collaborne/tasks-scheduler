import * as moment from 'moment-business-days';

/**
 * Task to be scheduled.
 */
interface Task {
	/**
	 * ID of the task
	 */
	id: string;

	/**
	 * Number of normalized days required to complete the task (assuming 100% time allocation)
	 */
	nrNormDays: number;
}

/**
 * Closed interval of time not available for tasks scheduling.
 * Eg. blocked period ['2018-03-07', '2018-03-08'] shifts scheduling of 2 days
 */
interface BlockedPeriod {
	/**
	 * Start date of the period in ISO format (eg. '2018-03-19')
	 */
	start: string;

	/**
	 * End date of the period in ISO format (eg. '2018-03-19')
	 */
	end: string;
}

/**
 * The computed scheduling.
 */
interface SchedulingResult {
	/**
	 * Map of deadlines by task ID
	 */
	deadlines: {[key: string]: string};

	/**
	 * List of progress objects
	 */
	progress: {[key: string]: number};

	/**
	 * Start date in ISO format (eg. '2018-03-19')
	 */
	start: string;

	/**
	 * End date in ISO format (eg. '2018-03-19')
	 */
	end: string;

	/**
	 * Number of normalized days required to complete all tasks (e.g. if time allocation would be 100%)
	 */
	nrNormDays: number;

	/**
	 * The time allocation in percentage (0..1)
	 */
	timeAllocation: number;

	/**
	 * Number of business days required to complete all tasks (considering time allocation
	 */
	nrRealDays: number;
}

interface ScheduleOptions {
	/**
	 * An array of task
	 */
	tasks: Task[];

	/**
	 * Starting date in ISO format (eg. '2018-03-19')
	 */
	start: string;

	/**
	 * Ending date in ISO format (eg. '2018-03-19')
	 */
	end?: string;

	/**
	 * The time allocation percentage
	 */
	timeAllocation?: number;

	/**
	 * Array of blocked periods
	 */
	blockedPeriods?: BlockedPeriod[];
}

interface EnrichedBlockedPeriod {
	nrBlockDays: number;
	start: string;
}

function businessAddWithBlocked(startMoment: moment.Moment, daysToAdd: number, blockedPeriods: EnrichedBlockedPeriod[]): moment.Moment {
	// Function businessAdd() fails on non-integers
	// NB. Round up to express the next available business day
	const taskEnd = moment.default(startMoment.businessAdd(Math.round(daysToAdd)));

	// Check if task ends within one of the blocked periods provided
	const blockPeriod = blockedPeriods.find(block => taskEnd.isSame(block.start) || taskEnd.isAfter(block.start));
	if (blockPeriod) {
		// Move the deadline by the number of blocked days
		// NB. Add one to round up to the next available business day
		return moment.default(taskEnd.businessAdd(blockPeriod.nrBlockDays + 1));
	}

	return taskEnd;
}

/**
 * Calculates the end date for the scheduled task.
 *
 * @param start - The starting date in date string format.
 * @param timeAllocation - The time allocation percentage.
 * @param nrNormDays - Number of normalized days required to complete all tasks.
 * @param blockedPeriods - Array of blocked periods.
 * @return the end date in date string format.
 */
function calcEnd(start: moment.Moment, timeAllocation: number, nrNormDays: number, blockedPeriods: EnrichedBlockedPeriod[]): moment.Moment {
	const daysToAdd = nrNormDays / timeAllocation;
	return businessAddWithBlocked(start, daysToAdd, blockedPeriods);
}

/**
 * Checks if a provided string is a valid date
 *
 * @param date - The date to parse.
 * @return True if the input date is valid
 */
function isValidDate(date: string): boolean {
	const timestamp = Date.parse(date);
	return !isNaN(timestamp);
}

function sumNrNormDays(tasks: Task[]): number {
	return tasks.reduce((acc, task) => acc + task.nrNormDays, 0);
}

function calcDeadlines(tasks: Task[], start: moment.Moment, blockedPeriods: EnrichedBlockedPeriod[], timeAllocation: number) {
	const totalNrNormDays = sumNrNormDays(tasks);

	let lastTaskNormDays = 0;
	return tasks.map(task => {
		lastTaskNormDays += task.nrNormDays;
		const realDays = lastTaskNormDays / timeAllocation;
		const taskDeadline = businessAddWithBlocked(start, realDays, blockedPeriods);
		return {
			deadline: taskDeadline.format('YYYY-MM-DD'),
			id: task.id,
			progress: lastTaskNormDays / totalNrNormDays,
		};
	});
}

/**
 * Calculates the scheduling of a set of tasks
 */
export function schedule(options: ScheduleOptions): SchedulingResult {
	// Input validation
	if (!isValidDate(options.start)) {
		throw new Error(`Invalid start date (${options.start}). Must be in format YYYY-MM-DD.`);
	}
	if (options.end && !isValidDate(options.end)) {
		throw new Error(`Invalid end date (${options.end}). Must be in format YYYY-MM-DD.`);
	}
	if (Boolean(options.end) && Boolean(options.timeAllocation)) {
		throw new Error('Only provide end date or time allocation percentage');
	}

	const startDate = moment.default(options.start);

	const nrNormDays = sumNrNormDays(options.tasks);

	const blockedPeriods: EnrichedBlockedPeriod[] = (options.blockedPeriods || []).map(period => ({
		nrBlockDays: moment.default(period.start).businessDiff(moment.default(period.end)),
		start: period.start,
	}));

	let endDate;
	if (options.end) {
		// End date is given -> calculate time allocation
		endDate = moment.default(options.end);
	} else if (options.timeAllocation) {
		// Time allocation is given -> calculate end date
		endDate = calcEnd(startDate, options.timeAllocation, nrNormDays, blockedPeriods);
	} else {
		throw new Error('End or time allocation must be provided');
	}

	const nrRealDays = startDate.businessDiff(moment.default(endDate));

	let timeAllocation;
	if (options.end) {
		// End date is given -> calculate time allocation
		timeAllocation = nrNormDays / nrRealDays;
	} else {
		timeAllocation = options.timeAllocation;
	}

	const deadlines = calcDeadlines(options.tasks, startDate, blockedPeriods, timeAllocation!);
	const deadlineById = deadlines.reduce((acc, task) => Object.assign(acc, {
		[task.id]: task.deadline,
	}), {});
	const progressById = deadlines.reduce((acc, task) => Object.assign(acc, {
		[task.id]: task.progress,
	}), {});

	return {
		deadlines: deadlineById,
		end: endDate.format('YYYY-MM-DD'),
		nrNormDays,
		nrRealDays,
		progress: progressById,
		start: startDate.format('YYYY-MM-DD'),
		timeAllocation: timeAllocation!,
	};
}
