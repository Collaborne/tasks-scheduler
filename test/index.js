const chai = require('chai');
const expect = chai.expect;

const {calc} = require('../src/index');

const FEB_23_DATE = '2018-02-23T09:00:00.000Z';
const APR_20_DATE = '2018-04-20T08:00:00.000Z';
const MAR_23_DATE = '2018-03-23T09:00:00.000Z';

const TASKS = [
	{
		days: 6,
		id: 'create-ux-design',
	},
	{
		days: 10,
		id: 'implement-scheduling-lib',
	},
	{
		days: 4,
		id: 'implement-ui',
	},
];

const EXPECTED_DEADLINES = ['2018-03-05T09:00:00.000Z', '2018-03-19T09:00:00.000Z', MAR_23_DATE];

describe('Task scheduler', () => {
	describe('correctly calculates end date', () => {
		it('with 100% time allocation', () => {
			const inputParams = {
				start: FEB_23_DATE,
				tasks: TASKS,
				timeAllocationPercentage: 1,
			};
			const result = calc(inputParams);
			expect(result.end).to.be.equals(MAR_23_DATE);
		});

		it('with 50% time allocation', () => {
			const inputParams = {
				start: FEB_23_DATE,
				tasks: TASKS,
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
				tasks: TASKS,
			};
			const result = calc(inputParams);
			expect(result.timeAllocationPercentage).to.be.equals(1.0);
		});

		it('of 50% from 23 Feb. to 4 Apr. for a 20 days project', () => {
			const inputParams = {
				end: APR_20_DATE,
				start: FEB_23_DATE,
				tasks: TASKS,
			};
			const result = calc(inputParams);
			expect(result.timeAllocationPercentage).to.be.equals(0.5);
		});
	});

	describe('correctly calculates total project days', () => {
		it('for a set of given tasks', () => {
			const inputParams = {
				end: MAR_23_DATE,
				start: FEB_23_DATE,
				tasks: TASKS,
			};
			const result = calc(inputParams);
			expect(result.totalProjectDays).to.be.equals(20);
		});
	});

	describe('correctly calculates deadlines', () => {
		it('for a set of given tasks', () => {
			const inputParams = {
				end: MAR_23_DATE,
				start: FEB_23_DATE,
				tasks: TASKS,
			};
			const result = calc(inputParams);
			console.log(JSON.stringify(result.deadlines));
			expect(result.deadlines).to.have.lengthOf(inputParams.tasks.length);
			for (let i = 0; i < result.deadlines.length; i++) {
				expect(result.deadlines[i].deadline).to.be.equals(EXPECTED_DEADLINES[i]);
			}
		});
	});
});
