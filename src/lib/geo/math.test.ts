import { distance, bearing, cross_track_distance, along_track_distance } from './math';
import { test, expect } from '@jest/globals';
import type { LngLat } from './types';

test('calculates distance, bearing, cross track, and along track distances', () => {
	const p1: LngLat = [0,0];
	const p2: LngLat = [1,1];
	expect(distance(p1, p2)).toBeCloseTo(157249.381);
	expect(bearing(p1, p2)).toBeCloseTo(45.0);
	expect(cross_track_distance(p1, p2, [0.5, 0.5] as LngLat)).toBeCloseTo(4.5,1);
	// about 1.5 meters off halfway at these distances
	expect(along_track_distance(p1, p2, [0.5, 0.5] as LngLat)).toBeCloseTo(157249.381/2+1.5, 0);
});


