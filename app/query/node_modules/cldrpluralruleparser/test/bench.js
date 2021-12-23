'use strict';

const perf = require('perf_hooks').performance;
const pluralRuleParser = require('../src/CLDRPluralRuleParser');

// These are two example inputs,
// taken from MediaWiki as deployed on Wikipedia in September 2018.
const inputs = {
	'2018-en': {
		number: 5,
		rules: [
			'i = 1 and v = 0 @integer 1'
		]
	},
	'2018-ar': {
		number: 5,
		rules: [
			'n = 0 @integer 0 @decimal 0.0, 0.00, 0.000, 0.0000',
			'n = 1 @integer 1 @decimal 1.0, 1.00, 1.000, 1.0000',
			'n = 2 @integer 2 @decimal 2.0, 2.00, 2.000, 2.0000',
			'n % 100 = 3..10 @integer 3~10, 103~110, 1003, … @decimal 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 103.0, 1003.0, …',
			'n % 100 = 11..99 @integer 11~26, 111, 1011, … @decimal 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0, 111.0, 1011.0, …'
		]
	}
};
const getPluralForm = function (number, pluralRules) {
	var i;
	for (i = 0; i < pluralRules.length; i++) {
		if (pluralRuleParser(pluralRules[i], number)) {
			break;
		}
	}
	return i;
};
const iterations = 1000;

function bench(name) {
	var start;
	function end(ops) {
		let duration = perf.now() - start;
		let rate = ops / (duration / 1e3);
		let avg = duration / ops;
		console.log(
			'Bench %s: rate = %s op/s, avg = %s ms/op, %s iterations in %sms',
			name,
			rate.toFixed(0),
			avg.toFixed(3),
			ops,
			duration.toFixed(2)
		);
	}
	start = perf.now();
	return end;
}

for (let name in inputs) {
	let input = inputs[name];
	let i = iterations;
	let end = bench(name);
	while (i--) {
		getPluralForm(input.number, input.rules)
	}
	end(iterations);
}
