import type { LngLat } from '$lib/geo/types';

let base_url = 'https://api.mototripper.app';
if (import.meta.env.VITE_ENV === "development") {
    base_url = 'http://localhost:8080'
}

export type LastPosition = {
    position: LngLat;
    ts: number;
    display?: string;
}

export type LiveTrackServerResponse = {
    last_position: LastPosition;
    data: string;
    bbox: [LngLat, LngLat];
}

export type LiveTrackResponse = {
    ok: boolean;
    status: number;
    error?: string;
    data?: LiveTrackServerResponse;
}

export async function getLiveTrack(uid: string, fetchM = fetch, since?: number): Promise<LiveTrackResponse> {
    if (!uid || uid === "") {
        return {
            ok: false,
            status: 400,
            error: "you must enter a valid user to see a live track"
        }
    }
    let url = `${base_url}/track/${uid}`
    if (since) {
        url = `${url}?since=${since}`
    }
    const resp = await fetchM(url, {
        cache: 'no-cache',
        mode: 'cors',
    })
    if (resp.ok) {
        const data = await resp.json();

        // reverse geocode to city level
        const nomURL = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${data.last_position.position[1]}&lon=${data.last_position.position[0]}&zoom=12&email=scooter@mototripper.app`
        const nomRes = await fetchM(nomURL);
        if (nomRes.ok) {
            const nomData = await nomRes.json();
            const address = nomData.address;
            data.last_position.display = formatDisplay(address);
        }
        return {
            ok: true,
            status: 200,
            data: data
        }
    } else {
        const text = await resp.text();
        return {
            ok: false,
            error: text,
            status: resp.status,
        }
    }
}

// from the OSM nominatim API at level 11
type address = {
    city_district?: string;
    municipality?: string;
    county?: string;
    country?: string;
}

// formats the reverse geocode based on available locating data
const formatDisplay = (a: address): string => {
    let out: string = "Near ";

    if (a.city_district) {
        out += `${a.city_district}, `
    }
    if (a.municipality) {
        out += `${a.municipality}, `
    }
    if (a.county) {
        out += `${a.county}, `
    }
    if (a.country) {
        out += `${a.country}`
    }
    return out
}
