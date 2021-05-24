import { position } from '$lib/stores/position';
import type { Position } from '$lib/stores/position';
import { DateTime, now } from '$lib/time/time';
import type { Duration } from '$lib/time/time';
import { Mutex } from 'async-mutex';
import { writable } from 'svelte/store';
import { simplifyPositions } from '$lib/geo/math';
import { distance } from '$lib/geo/math';

const POSITION_QUEUE_MAX = 20;
const POSITION_OLDEST_MINUTES = 5;
const MINIMUM_MOVEMENT_DISTANCE = 2;

export type UpdateResponse = {
	ok: boolean;
	didSend: boolean;
	positionQueueLength?: [number, number];
	responseCode?: number;
	error?: string;
	lastUpdate?: DateTime;
	totalPoints?: number;
}

export enum TrackerState {
  Paused,
  Tracking,
  Stopped
}

// Tracker manages sending tracking updates to the server.  Implements store interface and can be subscribed to
// to monitor for errors and queued values
export class Tracker {

	private mutex = new Mutex();
	private uid: string;
	private positions: Position[] = []; 
	subscribe
	private unsubscriber;
	private setter;
	private totalPoints = 0;
	state: TrackerState = TrackerState.Paused

	constructor(uid: string) {
		this.uid = uid;
		const {subscribe, set} = writable<UpdateResponse>({ok: true, didSend: false})
		this.subscribe = subscribe;
		this.setter = set;

		this.unsubscriber = position.subscribe((pos) => {
			if (this.state === TrackerState.Tracking) {
				this.update(pos).then((resp) => {
				set(resp);
				});	
			}
		});
	}

	public start() {
		this.state = TrackerState.Tracking;
	}

	// pauses tracking and sends immediate flush command, does not clear the watch so 
	// positions may still update in the background but they will not be added to queue
	public pause() {
		if (this.state === TrackerState.Paused) {
			return
		}
		this.update(null, true).then((resp) => {
			this.setter(resp);
		});
		this.state = TrackerState.Paused;
	}

	// stops tracker, clears subscription on position, flushes anything in queue
	public stop() {
		this.state = TrackerState.Stopped;
		this.update(null, true).then((resp) => {
			this.setter(resp);
		});
		this.unsubscriber();
	}

	// flush will immedidately send any queued values
	public flush() {
		this.update(null, true).then((resp) => {
			this.setter(resp);
		});
	}

	// sends updates to server when queue is full or old, unless set to flush immediately
	// TODO: should store intermediate values in localstorage and grab them again
	private async update(pos: Position, flushImmediately: boolean = false): Promise<UpdateResponse> {
		let response: UpdateResponse
		await this.mutex.runExclusive(async () => {
			if (pos) {
				const last = this.positions[this.positions.length-1];
				const d = distance([pos.coords.longitude, pos.coords.latitude], [last.coords.longitude, last.coords.latitude]);
				if (d < MINIMUM_MOVEMENT_DISTANCE) {
					return
				}
				this.positions.push(pos);
			}
			const before = this.positions.length;

			// uses douglas-peucker to simplify positions with cross track error of 15m
			const positions = simplifyPositions(this.positions)	
			if (positions.length === 0) {
				// nothing to send, could happen if forced to flush a zero-length queue
				response = {ok: true, didSend: true, positionQueueLength: [0, 0]};
				return
			}

			const oldest_ts: DateTime = new DateTime(this.positions[0].timestamp);
			const elapsed: Duration = now().since(oldest_ts);
			

			if (positions.length >= POSITION_QUEUE_MAX || elapsed.minutes() >= POSITION_OLDEST_MINUTES || flushImmediately) {

				const body = {
				"positions": positions
				}

				const url = `https://httpbin.org/put`;
				//const url = `http://localhost/track/${this.uid}`

				const resp = await fetch(url, {
					method: 'PUT',
					headers: {
    					'Content-Type': 'application/json'
  					},
  					credentials: 'include',
					body: JSON.stringify(body)
				})
				if (!resp.ok) {
					// error updating, keep queue for retry on next position update
					const errorMsg = await resp.text();
					response = {
						ok: false,
						didSend: true,
						positionQueueLength: [before, positions.length],
						responseCode: resp.status,
						error: errorMsg
					}
				} else {
					// successfully sent, clear queue
					this.positions = [];
					this.totalPoints += positions.length;
					response = {
						ok: true,
						didSend: true,
						positionQueueLength: [0, 0],
						lastUpdate: now(),
						totalPoints: this.totalPoints
					}
				}
			}
			// queue is too short or too recent, just add to send queue
			response = {
				ok: true,
				didSend: false,
				positionQueueLength: [before, positions.length]
			}
		})
		return response;
	}


}