import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';


export class DateTime {
	value: Dayjs

	constructor(t: DOMTimeStamp = undefined) {
		this.value = dayjs(t);
	}

	// returns DateTime as an ISO-8601/RFC3339 string
	public string(): string {
		return this.value.format();
	}

	public since(d: DateTime): Duration {
		return new Duration(this.value.diff(d.value));
	}

	public isAfter(d: DateTime): boolean {
		return this.value.isAfter(d.value);
	}

	public isBefore(d: DateTime): boolean {
		return this.value.isBefore(d.value);
	}

	public UnixMillis(): number {
		return Math.floor(this.value.valueOf());
	}

	public UnixNanos(): number {
		return Math.floor(this.value.valueOf()*1e6);
	}
}

// returns the current time
export function now(): DateTime {
	// undefined default argument returns current time
	return new DateTime();
}

export class Duration {
	millis: number

	constructor(ms: number, warnOnNegative: boolean = true) {
		if (warnOnNegative && ms < 0) {
			console.warn(`creating negative duration: ${ms}ms`);
		}
		this.millis = ms;
	}

	public string(): string {
		return `${this.millis}ms`
	}

	public milliseconds(): number {
		return this.millis;
	}

	public seconds(): number {
		return this.millis / 1000;
	}

	public minutes(): number {
		return this.seconds() / 60;
	}

	public hours(): number {
		return this.minutes() / 60;
	}

	// returns an approximate shortened time (e.g. 3h4m)
	public short(): string {
		if (this.hours() >= 1) {
			const h = Math.floor(this.hours());
			const m = Math.floor(this.minutes()-60*h);
			if (m === 0) {
				return `${h}h`
			} else {
				return `${h}h${m}m`
			}
		}
		if (this.minutes() >= 1) {
			const m = Math.floor(this.minutes());
			const s = Math.floor(this.seconds()-60*m);
			if (s === 0) {
				return `${m}m`
			} else {
				return `${m}m${s}s`
			}	
		}
		return `${Math.floor(this.seconds())}s`;
	}

	// returns an approximate time without abbreviation, resolution of hours, minutes, or seconds
	public long(): string {
		if (this.hours() >= 1) {
			const h = Math.floor(this.hours());
			if (h === 1) {
				return '1 hour'
			} else {
				return `${h} hours`;
			}
		}
		if (this.minutes() >= 1) {
			const m = Math.floor(this.minutes());
			if (m === 1) {
				return '1 minute';
			} else {
				return `${m} minutes`;
			}
		}
		const s = Math.floor(this.seconds());
		if (s === 1) {
			return '1 second';
		}
		return `${s} seconds`;
	}

	public add(d: Duration, warnOnNegative: boolean = true) {
		if (warnOnNegative && d.millis < 0) {
			console.warn(`adding a negative duration: ${d.millis}ms`);
		}
		this.millis += d.millis;
	}

}
