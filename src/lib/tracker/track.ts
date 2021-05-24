import { position } from '$lib/stores/position';
import type { Position } from '$lib/stores/position';
import { DateTime, now } from '$lib/time/time';
import type { Duration } from '$lib/time/time';
import { Mutex } from 'async-mutex';
import { writable } from 'svelte/store';
import { simplifyPositions } from '$lib/geo/math';



export type UpdateResponse = {
	ok: boolean;
	didSend: boolean;
	positionQueueLength?: number;
	responseCode?: number;
	error?: string
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
				this.positions.push(pos);
				this.positions = simplifyPositions(this.positions);	
			}
			if (this.positions.length === 0) {
				// nothing to send, could happen if forced to flush a zero-length queue
				response = {ok: true, didSend: true, positionQueueLength: 0};
				return
			}

			const oldest_ts: DateTime = new DateTime(this.positions[0].timestamp);
			const elapsed: Duration = now().since(oldest_ts);
			

			if (this.positions.length >= 10 || elapsed.minutes() >= 5 || flushImmediately) {

				const body = {
				"positions": this.positions
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
						positionQueueLength: this.positions.length,
						responseCode: resp.status,
						error: errorMsg
					}
				} else {
					// successfully sent, clear queue
					this.positions = [];
					response = {
						ok: true,
						didSend: true,
						positionQueueLength: 0
					}
				}
			}
			// queue is too short or too recent, just add to send queue
			response = {
				ok: true,
				didSend: false,
				positionQueueLength: this.positions.length
			}
		})
		return response;
	}


}