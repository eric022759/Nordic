export interface GoogleMapsCoordinates {
  latitude: number;
  longitude: number;
}

function assertValidCoordinates({ latitude, longitude }: GoogleMapsCoordinates): void {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new RangeError(`Invalid Google Maps latitude: ${latitude}`);
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new RangeError(`Invalid Google Maps longitude: ${longitude}`);
  }
}

/**
 * Creates an unambiguous Google Maps search URL using a verified coordinate pin.
 * `placeName` remains required so callers retain a human-readable audit label;
 * it is deliberately not used as the location query because text searches can
 * resolve to a similarly named place.
 */
export function createGoogleMapsUrl(
  placeName: string,
  coordinates: GoogleMapsCoordinates,
): string {
  if (placeName.trim().length === 0) {
    throw new TypeError("A Google Maps audit label is required.");
  }

  assertValidCoordinates(coordinates);

  const params = new URLSearchParams({
    api: "1",
    query: `${coordinates.latitude},${coordinates.longitude}`,
  });

  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export function createGoogleMapsDirectionsUrl(
  origin: string,
  destination: string,
  waypoints: string[] = [],
): string {
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
  });

  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
