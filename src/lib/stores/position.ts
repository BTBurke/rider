import { writable } from 'svelte/store';

export type Position = {
    source: string;
    coords?: GeolocationCoordinates;
    previous?: Position;
    distance?: number;
    elapsed?: number;
    timestamp?: DOMTimeStamp; 
}

const null_position: Position = {source: "null"}

function createPosition() {
	const { subscribe, set, update } = writable(null_position);

	return {
		subscribe,
		update: (pos: Position) => update(prev => {
            let elapsed = 0;
            if (prev.timestamp && pos.timestamp) {
                elapsed = pos.timestamp - prev.timestamp;
            }
            return Object.assign({source: 'update', previous: prev, elapsed: elapsed}, pos)
        }),
		set: (pos: Position) => set(Object.assign({source: 'static', distance: 0, elapsed: 0}, pos)),
	}
}

export const position = createPosition();