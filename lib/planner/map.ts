/**
 * A Crete-shaped map without tiles.
 *
 * WGS84 points are projected into a fixed viewBox. The silhouette is a
 * compact coastline, not a cartographic product — close enough that Preveli
 * sits on the south coast and Elafonisi on the far west, which is all the
 * planner needs.
 */

export const MAP_WIDTH = 1040;
export const MAP_HEIGHT = 400;
const PAD = 36;

export const CRETE_BOUNDS = {
  west: 23.46,
  east: 26.36,
  south: 34.84,
  north: 35.72,
};

export function project(lat: number, lng: number): { x: number; y: number } {
  const { west, east, south, north } = CRETE_BOUNDS;
  const innerW = MAP_WIDTH - PAD * 2;
  const innerH = MAP_HEIGHT - PAD * 2;
  return {
    x: PAD + ((lng - west) / (east - west)) * innerW,
    y: PAD + ((north - lat) / (north - south)) * innerH,
  };
}

/** Coastline, west-about from Gramvousa, [lng, lat]. */
const COAST: Array<[number, number]> = [
  [23.52, 35.62],
  [23.58, 35.58],
  [23.65, 35.495],
  [23.78, 35.51],
  [23.92, 35.525],
  [24.02, 35.518],
  [24.08, 35.505],
  [24.13, 35.49],
  [24.16, 35.468],
  [24.2, 35.49],
  [24.26, 35.365],
  [24.4, 35.368],
  [24.475, 35.372],
  [24.62, 35.39],
  [24.78, 35.408],
  [24.92, 35.385],
  [25.08, 35.35],
  [25.14, 35.338],
  [25.28, 35.33],
  [25.39, 35.318],
  [25.52, 35.29],
  [25.72, 35.192],
  [25.9, 35.21],
  [26.1, 35.208],
  [26.22, 35.28],
  [26.3, 35.318],
  [26.31, 35.3],
  [26.26, 35.2],
  [26.22, 35.1],
  [26.12, 35.01],
  [25.9, 35.005],
  [25.74, 35.005],
  [25.5, 34.995],
  [25.2, 34.99],
  [24.9, 34.995],
  [24.75, 34.992],
  [24.7, 35.095],
  [24.54, 35.125],
  [24.475, 35.152],
  [24.4, 35.185],
  [24.22, 35.182],
  [24.14, 35.2],
  [23.96, 35.228],
  [23.81, 35.248],
  [23.68, 35.228],
  [23.54, 35.27],
  [23.52, 35.35],
  [23.57, 35.49],
  [23.52, 35.62],
];

export const CRETE_PATH = COAST.map(([lng, lat], i) => {
  const { x, y } = project(lat, lng);
  return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
}).join(" ") + " Z";

export function pointsToPath(points: ReadonlyArray<{ x: number; y: number }>): string {
  if (points.length < 2) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
}
