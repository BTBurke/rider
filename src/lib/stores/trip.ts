import { derived } from 'svelte/store';
import { position } from './position';

type Trip = {
    start: Date;
    distance_traveled: number;
    moving_time: number;
    stopped_time: number;
    distance_remaining: number;
    time_remaining: number;
    eta: Date;
    off_track: number;
    avg_speed: number;
}

// const trip = derived(
//     position,
//     $position => 
// )