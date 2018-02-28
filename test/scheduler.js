const chai = require('chai');
const expect = chai.expect;

const scheduler = require('../server/scheduler');

describe('Scheduler', () => {
	describe('executes planning computations', () => {
		it('correctly returns nr of project days', () => {
			const nrDays = scheduler.calculateNrProjectDays(2, 3);
			expect(nrDays).to.be.equals(1);
		});
	});
});
