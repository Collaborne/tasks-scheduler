const chai = require('chai');
const expect = chai.expect;

const {calc} = require('../server/index');

const inputParams = {
	start: '2018-02-23T09:00:00.000Z',
	timeAllocationPercentage: 1,
};

describe('Task scheduler', () => {
	describe('provides a task scheduling', () => {
		const result = calc(inputParams);
		it('correctly calculates end date', () => {
			expect(result.end).to.be.equals('2018-03-15T09:00:00.000Z');
		});
	});
});
