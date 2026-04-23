// Grid dimensions — 100 points total, within opentopodata's public API limit
const ROWS = 10;
const COLS = 10;

// Degrees to radians
const toRad = (d) => (d * Math.PI) / 180;

export async function fetchSlopeGrid(bounds) {
  const { south, west, north, east } = bounds;

  // Build evenly-spaced grid of lat/lng points
  const points = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      points.push({
        latitude: south + (north - south) * (r / (ROWS - 1)),
        longitude: west + (east - west) * (c / (COLS - 1)),
      });
    }
  }

  const res = await fetch('https://api.opentopodata.org/v1/srtm30m', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locations: points }),
  });

  if (!res.ok) throw new Error(`OpenTopoData error: ${res.status}`);
  const data = await res.json();

  if (data.status !== 'OK') throw new Error(data.error || 'OpenTopoData error');

  const elevations = data.results.map((r) => r.elevation ?? 0);

  // Reconstruct 2D grid
  const grid = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      lat: points[r * COLS + c].latitude,
      lng: points[r * COLS + c].longitude,
      elev: elevations[r * COLS + c],
    }))
  );

  // Metres per degree at this latitude
  const midLat = (south + north) / 2;
  const mPerDegLat = 111320;
  const mPerDegLng = mPerDegLat * Math.cos(toRad(midLat));
  const dy = ((north - south) / (ROWS - 1)) * mPerDegLat;
  const dx = ((east - west) / (COLS - 1)) * mPerDegLng;

  const results = [];
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      // Central-difference gradient
      const dzdy = (grid[r + 1][c].elev - grid[r - 1][c].elev) / (2 * dy);
      const dzdx = (grid[r][c + 1].elev - grid[r][c - 1].elev) / (2 * dx);
      const slopeDeg = Math.atan(Math.sqrt(dzdx ** 2 + dzdy ** 2)) * (180 / Math.PI);

      if (slopeDeg >= 20) {
        results.push({
          lat: grid[r][c].lat,
          lng: grid[r][c].lng,
          slope: slopeDeg,
          elevation: grid[r][c].elev,
        });
      }
    }
  }

  return results;
}

// Color a slope sample: yellow (20°) → orange (35°) → red (50°+)
export function slopeColor(deg) {
  if (deg >= 50) return '#e53935';
  if (deg >= 40) return '#f4511e';
  if (deg >= 30) return '#fb8c00';
  return '#fdd835';
}

export function slopeLabel(deg) {
  if (deg >= 50) return 'Very steep — likely cliff face';
  if (deg >= 40) return 'Steep — probable cliff band';
  if (deg >= 30) return 'Moderate-steep — worth scouting';
  return 'Rolling terrain';
}
