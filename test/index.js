const chai = require('chai');
const expect = chai.expect;

const {calc} = require('../src/index');

const FEB_23_DATE = '2018-02-23T09:00:00.000Z';
const APR_20_DATE = '2018-04-20T08:00:00.000Z';
const MAR_23_DATE = '2018-03-23T09:00:00.000Z';

describe('Task scheduler', () => {
	describe('correctly calculates end date', () => {
		it('with 100% time allocation', () => {
			const inputParams = {
				start: FEB_23_DATE,
				timeAllocationPercentage: 1,
			};
			const result = calc(inputParams);
			expect(result.end).to.be.equals(MAR_23_DATE);
		});

		it('with 50% time allocation', () => {
			const inputParams = {
				start: FEB_23_DATE,
				timeAllocationPercentage: 0.5,
			};
			const result = calc(inputParams);
			expect(result.end).to.be.equals(APR_20_DATE);
		});
	});
	describe('correctly calculates time allocation', () => {
		it('of 100% from 23 Feb. to 23 Mar. for a 20 days project', () => {
			const inputParams = {
				end: MAR_23_DATE,
				start: FEB_23_DATE,
			};
			const result = calc(inputParams);
			expect(result.timeAllocationPercentage).to.be.equals(1.0);
		});

		it('of 50% from 23 Feb. to 4 Apr. for a 20 days project', () => {
			const inputParams = {
				end: APR_20_DATE,
				start: FEB_23_DATE,
			};
			const result = calc(inputParams);
			expect(result.timeAllocationPercentage).to.be.equals(0.5);
		});
	});
});
