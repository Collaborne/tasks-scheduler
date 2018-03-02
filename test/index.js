const chai = require('chai');
const expect = chai.expect;

const {schedule} = require('../src/index');

// Monday 5 March, 2018
const START_DATE = '2018-03-05';

// Thursday 8 March, 2018
const END_DATE_8_MARCH = '2018-03-08';

// Tuesday 13 March, 2018
const END_DATE_13_MARCH = '2018-03-13';

const TASKS = [
	{
		id: 'First-task',
		nrNormDays: 1.4
	},
	{
		id: 'Second-task',
		nrNormDays: 1.4
	},
];

describe('Task scheduler', () => {
	describe('correctly calculates nr. of real days', () => {
		it('if start date equals end date provided', () => {
			const inputParams = {
				end: START_DATE,
				start: START_DATE,
				tasks: TASKS,
			};
			const result = schedule(inputParams);
			expect(result.nrRealDays).to.be.equals(0);
		});
	});

	describe('correctly calculates nr. of normalized days', () => {
		it('for empty set of tasks', () => {
			const inputParams = {
				end: END_DATE_8_MARCH,
				start: START_DATE,
				tasks: [],
			};
			const result = schedule(inputParams);
			expect(result.nrNormDays).to.be.equals(0);
		});
		it('for a set of given tasks', () => {
			const inputParams = {
				end: END_DATE_8_MARCH,
				start: START_DATE,
				tasks: TASKS,
			};
			const result = schedule(inputParams);
			expect(result.nrNormDays).to.be.equals(2.8);
		});
	});

	describe('correctly calculates end date', () => {
		it('with 100% time allocation', () => {
			const inputParams = {
				start: START_DATE,
				tasks: TASKS,
				timeAllocation: 1,
			};
			const result = schedule(inputParams);
			expect(result.end).to.be.equals(END_DATE_8_MARCH);
		});

		it('with 50% time allocation', () => {
			const inputParams = {
				start: START_DATE,
				tasks: TASKS,
				timeAllocation: 0.5,
			};
			const result = schedule(inputParams);
			expect(result.end).to.be.equals(END_DATE_13_MARCH);
		});
	});

	describe('correctly calculates time allocation', () => {
		it('of 100% (Monday to Thursday for a 2.8 days project)', () => {
			const inputParams = {
				end: END_DATE_8_MARCH,
				start: START_DATE,
				tasks: TASKS,
			};
			const result = schedule(inputParams);
			expect(result.timeAllocation).to.be.closeTo(1, 0.1);
		});

		it('of 50% (Monday to next Tuesday for a 2.8 days project)', () => {
			const inputParams = {
				end: END_DATE_13_MARCH,
				start: START_DATE,
				tasks: TASKS,
			};
			const result = schedule(inputParams);
			expect(result.timeAllocation).to.be.closeTo(0.5, 0.1);
		});
	});

	describe('correctly calculates deadlines', () => {
		it('empty output if end date is before start date', () => {
			const inputParams = {
				end: START_DATE,
				start: END_DATE_8_MARCH,
				tasks: [],
			};
			const result = schedule(inputParams);
			expect(result.deadlines).to.be.empty;
		});
		it('for a set of given tasks', () => {
			const EXPECTED_DEADLINES = ['2018-03-07', END_DATE_8_MARCH];
			const inputParams = {
				end: END_DATE_8_MARCH,
				start: START_DATE,
				tasks: TASKS,
			};
			const result = schedule(inputParams);
			expect(result.deadlines).to.have.lengthOf(inputParams.tasks.length);
			for (let i = 0; i < result.deadlines.length; i++) {
				expect(result.deadlines[i].deadline).to.be.equals(EXPECTED_DEADLINES[i]);
			}
			// Check also that last task's deadline equals the end of the project
			const lastDeadline = result.deadlines[TASKS.length - 1].deadline;
			expect(result.end).to.be.equals(lastDeadline);
		});

		it('with blocked periods', () => {
			const BLOCKED_PERIODS = [
				{
					end: '2018-03-09',
					start: '2018-03-07',
				}
			];
			const EXPECTED_DEADLINES_WITH_BLOCKS = ['2018-03-12', END_DATE_13_MARCH];
			const inputParams = {
				blockedPeriods: BLOCKED_PERIODS,
				start: START_DATE,
				tasks: TASKS,
				timeAllocation: 1,
			};
			const result = schedule(inputParams);
			expect(result.deadlines).to.have.lengthOf(inputParams.tasks.length);
			for (let i = 0; i < result.deadlines.length; i++) {
				expect(result.deadlines[i].deadline).to.be.equals(EXPECTED_DEADLINES_WITH_BLOCKS[i]);
			}
			// Check also that last task's deadline equals the end of the project
			const lastDeadline = result.deadlines[TASKS.length - 1].deadline;
			expect(result.end).to.be.equals(lastDeadline);
		});

		it('ignore weekend blocked period', () => {
			const BLOCKED_PERIODS = [
				{
					end: '2018-03-11',
					start: '2018-03-10',
				}
			];
			const EXPECTED_DEADLINES = ['2018-03-07', END_DATE_8_MARCH];
			const inputParams = {
				blockedPeriods: BLOCKED_PERIODS,
				end: END_DATE_8_MARCH,
				start: START_DATE,
				tasks: TASKS,
			};
			const result = schedule(inputParams);
			expect(result.deadlines).to.have.lengthOf(inputParams.tasks.length);
			for (let i = 0; i < result.deadlines.length; i++) {
				expect(result.deadlines[i].deadline).to.be.equals(EXPECTED_DEADLINES[i]);
			}
			// Check also that last task's deadline equals the end of the project
			const lastDeadline = result.deadlines[TASKS.length - 1].deadline;
			expect(result.end).to.be.equals(lastDeadline);
		});
	});
});
