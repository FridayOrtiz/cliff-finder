// 9×9 = 81 points — safely under opentopodata's 100-point public limit
const ROWS = 9;
const COLS = 9;

const toRad = (d) => (d * Math.PI) / 180;

export async function fetchSlopeGrid(bounds) {
  const { south, west, north, east } = bounds;

  const points = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const lat = south + (north - south) * (r / (ROWS - 1));
      const lng = west + (east - west) * (c / (COLS - 1));
      points.push({ lat, lng });
    }
  }

  // GET with pipe-delimited query string avoids CORS preflight on iOS Safari
  const locStr = points.map((p) => `${p.lat},${p.lng}`).join('|');
  const url = `https://api.opentopodata.org/v1/srtm30m?locations=${encodeURIComponent(locStr)}`;

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenTopoData ${res.status}${text ? ': ' + text : ''}`);
  }

  const data = await res.json();
  if (data.status !== 'OK') throw new Error(data.error || 'OpenTopoData returned non-OK status');

  const elevations = data.results.map((r) => r.elevation ?? 0);

  const grid = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      lat: points[r * COLS + c].lat,
      lng: points[r * COLS + c].lng,
      elev: elevations[r * COLS + c],
    }))
  );

  const midLat = (south + north) / 2;
  const mPerDegLat = 111320;
  const mPerDegLng = mPerDegLat * Math.cos(toRad(midLat));
  const dy = ((north - south) / (ROWS - 1)) * mPerDegLat;
  const dx = ((east - west) / (COLS - 1)) * mPerDegLng;

  const results = [];
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
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
