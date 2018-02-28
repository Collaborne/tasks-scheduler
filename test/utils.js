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

	describe('counts business days', () => {
		it('between friday and monday', () => {
			// Friday
			const startDate = new Date(2018, 2, 23);
			// Monday
			const endDate = new Date(2018, 2, 26);
			const nrDays = Utils.diffBusinessDays(startDate, endDate);
			expect(nrDays).to.be.equals(1);
		});
	});
});
