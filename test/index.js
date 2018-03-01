const chai = require('chai');
const expect = chai.expect;

const {calc} = require('../src/index');

const FEB_23_DATE = '2018-02-23';
const APR_20_DATE = '2018-04-20';
const MAR_23_DATE = '2018-03-23';

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

const EXPECTED_DEADLINES = ['2018-03-05', '2018-03-19', MAR_23_DATE];
const EXPECTED_DEADLINES_WITH_BLOCKS = ['2018-03-07', '2018-03-23', '2018-04-02'];
const BLOCKED_PERIODS = [
	{
		end: '2018-02-26',
		start: '2018-02-28',
	}
];

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
			expect(result.timeAllocationPercentage).to.be.equals(1);
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
			expect(result.deadlines).to.have.lengthOf(inputParams.tasks.length);
			for (let i = 0; i < result.deadlines.length; i++) {
				expect(result.deadlines[i].deadline).to.be.equals(EXPECTED_DEADLINES[i]);
			}
		});

		it('with blocked periods', () => {
			const inputParams = {
				blockedPeriods: BLOCKED_PERIODS,
				end: MAR_23_DATE,
				start: FEB_23_DATE,
				tasks: TASKS,
			};
			const result = calc(inputParams);
			console.log(JSON.stringify(result.deadlines));
			expect(result.deadlines).to.have.lengthOf(inputParams.tasks.length);
			for (let i = 0; i < result.deadlines.length; i++) {
				expect(result.deadlines[i].deadline).to.be.equals(EXPECTED_DEADLINES_WITH_BLOCKS[i]);
			}
		});
	});
});
