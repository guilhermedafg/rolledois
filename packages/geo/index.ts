/* eslint-disable no-console */

export interface LatLng {
    latitude: number;
    longitude: number;
}

/**
 * helper to convert degrees to radians
 */
function toRad(deg: number) {
    return (deg * Math.PI) / 180;
}

/**
 * Calculates the great-circle distance between two points
 * on the Earth’s surface using the Law of Haversines.
 *
 * @param pos1 {LatLng} Position of the origin point
 * @param pos2 {LatLng} Position of the destination point
 * @param earthRadius Radius of the Earth. Defaults to 6371 km.
 *                    Use 3958.8 for miles.
 * @returns The distance between the two points in the same unit as earthRadius.
 */
export function calcDistance(pos1: LatLng, pos2: LatLng, earthRadius: number = 6371): number {
    const originLatRad = toRad(pos1.latitude);
    const destinationLatRad = toRad(pos2.latitude);
    const deltaLatRad = toRad(pos2.latitude - pos1.latitude);
    const deltaLngRad = toRad(pos2.longitude - pos1.longitude);

    const haversineTerm =
        Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
        Math.cos(originLatRad) *
            Math.cos(destinationLatRad) *
            Math.sin(deltaLngRad / 2) *
            Math.sin(deltaLngRad / 2);

    const centralAngle = 2 * Math.atan2(Math.sqrt(haversineTerm), Math.sqrt(1 - haversineTerm));

    return earthRadius * centralAngle;
}

/**
 * Wrapper that tries to get client current `latitude` and `longitude`.
 * Must have a fallback position in case of any error.
 */
export function getCurrentPos(fallbackPos: LatLng): Promise<LatLng> {
    if (typeof window === "undefined") {
        throw new Error("This function should only run on the client side.");
    }

    return new Promise((resolve) => {
        if (!("geolocation" in navigator)) {
            console.warn("Geolocation not available on this client. Returning fallback position.");
            return resolve(fallbackPos);
        }

        navigator.geolocation.getCurrentPosition(
            (location) => {
                resolve({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                } as LatLng);
            },
            (error) => {
                console.warn(
                    "Something went wrong while trying to get client's current position. Returning fallback position.",
                    error,
                );

                resolve(fallbackPos);
            },
        );
    });
}
