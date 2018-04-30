# tasks-scheduler [![Build Status](https://travis-ci.org/Collaborne/tasks-scheduler.svg?branch=master)](https://travis-ci.org/Collaborne/tasks-scheduler)

A time-based scheduler for tasks.

## Install
```bash
npm install --save collaborne-tasks-scheduler
```

## Usage
```javascript
const tasksPlanner = require('collaborne-tasks-scheduler');
const scheduleResponse = tasksPlanner.schedule({
	start: '2018-01-01',
	end: '2018-06-30',
	timeAllocation: 0.5,
	tasks
});
```

An example of `scheduleResponse` would then be:
```json
{
	"deadlines": {
		"http://collaborne.com/schema/1.0/tasks/sensing": "2018-01-16",
		"http://collaborne.com/schema/1.0/tasks/visioning": "2018-01-24",
		"http://collaborne.com/schema/1.0/tasks/prototyping": "2018-01-31",
		"http://collaborne.com/schema/1.0/tasks/scaling": "2018-02-08"
	},
	"end": "2018-02-08",
	"nrNormDays": 14,
	"nrRealDays": 28,
	"start": "2018-01-01",
	"timeAllocation": 0.5
}
```
