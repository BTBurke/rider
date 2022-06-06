import { writable } from 'svelte/store';
import type { LiveTrackResponse, LiveTrackServerResponse } from '$lib/api';

function createLiveTrack() {
	const { subscribe, set, update } = writable<LiveTrackServerResponse|null>(null);
    let map;

	return {
		subscribe,
        setMapInstance: (m) => {
            map = m;
        },
		update: (data: LiveTrackServerResponse) => update(prev => {
            if (!map) {
                throw new Error('no map instance found in live track store');
            }
            map.getSource('track').setData(data?.data);
            map.getSource('point').setData({
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': data?.last_position.position
                            }
                        }
                    ]
                }
            });
            const heading = data?.last_position.heading || 0;
            map.setLayoutProperty('point', 'icon-rotate', heading);
            setTimeout(() => {
                map.easeTo({
                    center: data?.last_position.position
                })
            }, 2000)
            return data;
        }),
		set: (data: LiveTrackServerResponse) => {
            console.log(data);
            set(data); 
            if (!map) {
                
            }
            map.addSource('track', {
                type: 'geojson',
                data: data.data
            });
            map.addLayer({
                'id': 'track',
                'type': 'line',
                'source': 'track',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#364ff1',
                }
            });
            map.setPaintProperty('track', 'line-width', [
                'interpolate',
                ['exponential', 0.5],
                ['zoom'],
                4,
                4,
                15,
                4,
                18,
                8
            ]);
            // TODO: load a different indicator if offline
            map.loadImage('/position.png', function(error, image) {
                if (error) throw error;
                if (!map.hasImage('position')) map.addImage('position', image);
            }); 
            map.addSource('point', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': data.last_position.position
                            }
                        }
                    ]
                }
            });   
            // adds the latest point
            const heading = data?.last_position.heading || 0;
            map.addLayer({
                'id': 'point',
                'type': 'symbol',
                'source': 'point',
                'layout': {
                    'icon-image': 'position',
                    'icon-anchor': 'center',
                    'icon-rotate': data.last_position.heading,
                }
            });
            map.setLayoutProperty('point', 'icon-size', [
                'interpolate',
                ['linear'],
                ['zoom'],
                1,
                0.2,
                7,
                0.4,
                15,
                0.5
            ]);
            map.fitBounds(data.bbox, {
                linear: true,
                padding: {top: 120, bottom:20, left: 20, right: 20}
            });
        },
	}
}

export const liveTrack = createLiveTrack();