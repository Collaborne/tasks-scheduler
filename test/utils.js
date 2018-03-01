const chai = require('chai');
const expect = chai.expect;

const moment = require('moment');

const Utils = require('../server/utils');

describe('Utils functions test', () => {
	describe('states if a day is a business day', () => {
		it('friday is a business day', () => {
			// Friday
			const date = moment(new Date(2018, 2, 23));
			expect(Utils.isBusinessDay(date)).to.be.true;
		});

		it('sunday is not a business day', () => {
			// Sunday
			const date = moment(new Date(2018, 2, 25));
			expect(Utils.isBusinessDay(date)).to.be.false;
		});
	});

	describe('adds business days', () => {
		// Friday
		const startDate = new Date(2018, 2, 23);
		it('adding 0 days returns the same day', () => {
			const testResult = Utils.addBusinessDays(startDate, 0);
			expect(testResult.toDate().getTime()).to.be.equals(startDate.getTime());
		});
		it('friday plus 1 day = monday', () => {
			// Monday, in a comparable format
			const endDate = new Date(2018, 2, 26).getTime();
			const testResult = Utils.addBusinessDays(startDate, 1);
			expect(testResult.toDate().getTime()).to.be.equals(endDate);
		});
		it('friday plus 3 days = wednesday', () => {
			// Wednesday, in a comparable format
			const endDate = new Date(2018, 2, 28).getTime();
			const testResult = Utils.addBusinessDays(startDate, 3);
			expect(testResult.toDate().getTime()).to.be.equals(endDate);
		});
	});
});
