const chai = require('chai');
const expect = chai.expect;

const {calc} = require('../server/index');

describe('Task scheduler', () => {
	describe('correctly calculates end date', () => {
		it('with 100% time allocation', () => {
			const inputParams = {
				start: '2018-02-23T09:00:00.000Z',
				timeAllocationPercentage: 1,
			};
			const result = calc(inputParams);
			expect(result.end).to.be.equals('2018-03-15T09:00:00.000Z');
		});

		it('with 50% time allocation', () => {
			const inputParams = {
				start: '2018-02-23T09:00:00.000Z',
				timeAllocationPercentage: 0.5,
			};
			const result = calc(inputParams);
			expect(result.end).to.be.equals('2018-04-04T08:00:00.000Z');
		});
	});
});
