import { expect } from 'chai';
import 'mocha';

import { schedule } from '../src/index';

// Monday 5 March, 2018
const START_DATE = '2018-03-05';

// Thursday 8 March, 2018
const END_DATE_8_MARCH = '2018-03-08';

// Tuesday 13 March, 2018
const END_DATE_13_MARCH = '2018-03-13';

// Tuesday 15 March, 2018
const END_DATE_15_MARCH = '2018-03-15';

const TASK1_ID = 'First-task';
const TASK2_ID = 'Second-task';
const TASKS = [
	{
		id: TASK1_ID,
		nrNormDays: 1.4,
	},
	{
		id: TASK2_ID,
		nrNormDays: 1.4,
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
			const inputParams = {
				end: END_DATE_8_MARCH,
				start: START_DATE,
				tasks: TASKS,
			};
			const result = schedule(inputParams);
			const deadlines = result.deadlines;
			expect(Object.keys(deadlines)).to.have.lengthOf(inputParams.tasks.length);
			expect(deadlines[TASK1_ID]).to.be.equals('2018-03-07');
			expect(deadlines[TASK2_ID]).to.be.equals(END_DATE_8_MARCH);

			// Check also that last task's deadline equals the end of the project
			const lastTask = TASKS[TASKS.length - 1];
			expect(result.end).to.be.equals(deadlines[lastTask.id]);
		});

		it('with blocked periods', () => {
			const BLOCKED_PERIODS = [
				{
					end: '2018-03-09',
					start: '2018-03-07',
				},
			];
			const inputParams = {
				blockedPeriods: BLOCKED_PERIODS,
				start: START_DATE,
				tasks: TASKS,
				timeAllocation: 1,
			};
			const result = schedule(inputParams);
			const deadlines = result.deadlines;
			expect(deadlines[TASK1_ID]).to.be.equals('2018-03-06');
			expect(deadlines[TASK2_ID]).to.be.equals(END_DATE_15_MARCH);

			// Check also that last task's deadline equals the end of the project
			const lastTask = TASKS[TASKS.length - 1];
			expect(result.end).to.be.equals(deadlines[lastTask.id]);
		});

		it('ignore weekend blocked period', () => {
			const BLOCKED_PERIODS = [
				{
					end: '2018-03-11',
					start: '2018-03-10',
				},
			];
			const inputParams = {
				blockedPeriods: BLOCKED_PERIODS,
				end: END_DATE_8_MARCH,
				start: START_DATE,
				tasks: TASKS,
			};
			const result = schedule(inputParams);
			const deadlines = result.deadlines;
			expect(Object.keys(deadlines)).to.have.lengthOf(inputParams.tasks.length);
			expect(deadlines[TASK1_ID]).to.be.equals('2018-03-07');
			expect(deadlines[TASK2_ID]).to.be.equals(END_DATE_8_MARCH);

			// Check also that last task's deadline equals the end of the project
			const lastTask = TASKS[TASKS.length - 1];
			expect(result.end).to.be.equals(deadlines[lastTask.id]);
		});
	});

	describe('correctly calculates progress', () => {
		it('for a set of given tasks', () => {
			const inputParams = {
				end: END_DATE_8_MARCH,
				start: START_DATE,
				tasks: TASKS,
			};
			const {progress} = schedule(inputParams);
			expect(Object.keys(progress)).to.have.lengthOf(inputParams.tasks.length);
			expect(progress[TASK1_ID]).to.be.equals(0.5);
			expect(progress[TASK2_ID]).to.be.equals(1);
		});
	});
});
