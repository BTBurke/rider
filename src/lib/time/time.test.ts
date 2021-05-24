import { test, expect, describe, it } from '@jest/globals';
import { Duration } from './time';

test('prints durations', () => {
	// 3s
	const dS = new Duration(3000);
	// 1m
	const dM1 = new Duration(60000);
	// 2m2s
	const dM2 = new Duration((2*60*1000) + 2000);
	// 3h4m
	const dH = new Duration((3*60*60*1000)+(4*60*1000));

	expect(dS.short()).toBe('3s');
	expect(dS.long()).toBe('3 seconds');

	expect(dM1.short()).toBe('1m');
	expect(dM1.long()).toBe('1 minute');

	expect(dM2.short()).toBe('2m2s');
	expect(dM2.long()).toBe('2 minutes');

	expect(dH.short()).toBe('3h4m');
	expect(dH.long()).toBe('3 hours');
});

test('adds durations', () => {
	const d = new Duration(3000);
	expect(d.millis).toBe(3000);
	d.add(new Duration(4000))
	expect(d.millis).toBe(7000);
});

describe('warns on negative durations', () => {
	let out = [];
	const mockedWarn = (output: string) => out.push(output);
	const originalWarn = console.warn;

	beforeEach(() => {
		console.warn = mockedWarn
	})

	afterEach(() => {
		console.warn = originalWarn;
	})

	it('warns when constructing a negative duration', () => {
		new Duration(-3000);
		expect(out.pop()).toBe('creating negative duration: -3000ms')	
	})
	it('skips warning when constructing a negative duration on purpose', () => {
		new Duration(-3000, false);
		expect(out.length).toBe(0);	
	})
	it('warns when adding a negative duration', () => {
		new Duration(3000).add(new Duration(-4000, false));
		expect(out.pop()).toBe('adding a negative duration: -4000ms')	
	})
	it('skips warning when adding a negative duration on purpose', () => {
		new Duration(3000).add(new Duration(-4000, false), false);
		expect(out.length).toBe(0);	
	})
});