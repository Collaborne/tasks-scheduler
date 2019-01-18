import * as moment from 'moment';

/**
 * Brought in from moment-business-days
 */

function isHoliday(date: moment.Moment) {
	const locale = date.localeData() as any;

	if (locale._holidays) {
		if (locale._holidays.indexOf(date.format(locale._holidayFormat)) >= 0) {
			return true;
		}
	}

	if (locale.holiday) {
		if (locale.holiday(date)) {
			return true;
		}
		return false;
	}

	return false;
}

function isBusinessDay(date: moment.Moment) {
	const locale = date.localeData();
	const defaultWorkingWeekdays = [1, 2, 3, 4, 5];
	const workingWeekdays = (locale as any)._workingWeekdays || defaultWorkingWeekdays;

	if (isHoliday(date)) {
		return false;
	}
	if (workingWeekdays.indexOf(date.day()) >= 0) {
		return true;
	}

	return false;
}

export function businessAdd(date: moment.Moment, nrDays: number) {
	const day = date.clone().startOf('day');
	if (!day.isValid()) {
		return day;
	}

	if (nrDays < 0) {
		nrDays = Math.round(-1 * nrDays) * -1;
	} else {
		nrDays = Math.round(nrDays);
	}

	const signal = nrDays < 0 ? -1 : 1;

	let remaining = Math.abs(nrDays);
	while (remaining > 0) {
		day.add(signal, 'days');

		if (isBusinessDay(day)) {
			remaining--;
		}
	}

	return day;
}

export function businessDiff(date1: moment.Moment, date2: moment.Moment) {
	const d1 = date1.clone();
	const d2 = date2.clone();
	const start = d1 < d2 ? d1 : d2;
	const end = d2 > d1 ? d2 : d1;

	let daysBetween = 0;

	if (start.format('DD/MM/YYYY') === end.format('DD/MM/YYYY')) {
	return daysBetween;
	}

	while (start < end) {
		if (isBusinessDay(start)) {
			daysBetween++;
		}
		start.add(1, 'd');
	}

	return daysBetween;
}
