/** "3h 20m" from minutes. */
export function clock(totalMin: number): string {
  const min = Math.max(0, Math.round(totalMin));
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** "7h 30m" from fractional billed hours (already on a 30-minute grid). */
export function hoursClock(hours: number): string {
  const min = Math.round(hours * 60);
  return clock(min);
}

export function googleMapsDir(
  points: ReadonlyArray<{ lat: number; lng: number }>,
): string | null {
  if (points.length < 2) return null;
  const origin = `${points[0].lat},${points[0].lng}`;
  const dest = `${points[points.length - 1].lat},${points[points.length - 1].lng}`;
  const waypoints = points
    .slice(1, -1)
    .map((p) => `${p.lat},${p.lng}`)
    .join("|");
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", dest);
  url.searchParams.set("travelmode", "driving");
  if (waypoints) url.searchParams.set("waypoints", waypoints);
  return url.toString();
}
