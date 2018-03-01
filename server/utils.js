/* eslint-disable max-statements*/

const moment = require('moment');

function isBusinessDay(date) {
	const workingWeekdays = [1, 2, 3, 4, 5];
	return workingWeekdays.includes(date.day());
}

function diffBusinessDays(start, end) {
	let startDate = moment(start);
	const endDate = moment(end);
	if (endDate < startDate) {
		return 0;
	}

	let daysBetween = 0;

	if (startDate === endDate) {
		return daysBetween;
	}

	while (startDate < endDate) {
		if (isBusinessDay(startDate)) {
			daysBetween++;
		}
		startDate.add(1, 'd');
	}

	return daysBetween;
}

function addBusinessDays(start, days) {
	let finalDate = moment(start);
	let remaining = days;

	while (remaining) {
		finalDate.add(1, 'd');
		if (isBusinessDay(finalDate)) {
			remaining--;
		}
	}

	return finalDate;
}

module.exports = {
	addBusinessDays,
	diffBusinessDays,
	isBusinessDay
};
