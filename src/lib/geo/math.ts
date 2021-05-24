import type { LngLat } from './types';

// Earth radius in meters
const R = 6371e3;

// Calculates the great circule distance using the Haversine formula, returns distance in meters
export function distance(p1: LngLat, p2: LngLat): number {
	const phi1 = lat(p1);
	const phi2 = lat(p2);
	const deltaPhi = phi2-phi1;
	const deltaLambda = lng(p2)-lng(p1);

	const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	return R * c;
}

// returns bearing from p1 to p2 in degrees
export function bearing(p1: LngLat, p2: LngLat): number {
	const y = Math.sin(lng(p2)-lng(p1)) * Math.cos(lat(p2));
	const x = Math.cos(lat(p1))*Math.sin(lat(p2)) - Math.sin(lat(p1))*Math.cos(lat(p2))*Math.cos(lng(p2)-lng(p1));
	const theta = Math.atan2(y, x);
	return (deg(theta) + 360) % 360;
}

// returns the cross track distance in meters between the intended track from p1->p2 and the current position p3
export function cross_track_distance(p1: LngLat, p2: LngLat, p3: LngLat): number {
	const d13 = distance(p1, p3) / R;
	const brng13 = rad(bearing(p1, p3));
	const brng12 = rad(bearing(p1, p2));
	return Math.asin(Math.sin(d13)*Math.sin(brng13-brng12)) * R;
}

// returns the along track distance in meters between the intended track from p1->p2 and the current position p3
export function along_track_distance(p1: LngLat, p2: LngLat, p3: LngLat): number {
	const d13 = distance(p1, p3) / R;
	const dxt = cross_track_distance(p1, p2, p3);
	return Math.acos(Math.cos(d13)/Math.cos(dxt/R)) * R;
}

// returns the latitude in radians
function lat(p: LngLat): number {
	return rad(p[1]);
}

// returns longitude in radians
function lng(p: LngLat): number {
	return rad(p[0]);
}

// converts degrees to radians
function rad(n: number): number {
	return n * Math.PI/180;
}

// converts radians to degrees
function deg(n: number): number {
	return n * 180/Math.PI;
}