const ROWS = 9;
const COLS = 9;
const toRad = (d) => (d * Math.PI) / 180;

// ── Tile math ─────────────────────────────────────────────────────────────────

function lngToTileX(lng, z) {
  return Math.floor(((lng + 180) / 360) * 2 ** z);
}

function latToTileY(lat, z) {
  const r = toRad(lat);
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
}

function latLngToPixel(lat, lng, tileX, tileY, z) {
  const n = 2 ** z;
  const r = toRad(lat);
  const px = Math.floor(((lng + 180) / 360 * n - tileX) * 256);
  const py = Math.floor(
    ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n - tileY) * 256
  );
  return { px: Math.max(0, Math.min(255, px)), py: Math.max(0, Math.min(255, py)) };
}

// ── Tile loading ───────────────────────────────────────────────────────────────

// AWS elevation tiles — Terrarium encoding, CORS-enabled, no API key required
const tileUrl = (z, x, y) =>
  `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;

function loadTile(z, x, y) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        resolve(ctx.getImageData(0, 0, 256, 256));
      } catch {
        reject(new Error('Canvas blocked by CORS — elevation tile denied'));
      }
    };
    img.onerror = () => reject(new Error(`Tile ${z}/${x}/${y} failed to load`));
    img.src = tileUrl(z, x, y);
  });
}

// Terrarium encoding: elevation = R×256 + G + B/256 − 32768
function elevationAt(imageData, px, py) {
  const i = (py * 256 + px) * 4;
  return imageData.data[i] * 256 + imageData.data[i + 1] + imageData.data[i + 2] / 256 - 32768;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function fetchSlopeGrid(bounds) {
  const { south, west, north, east } = bounds;

  // Choose zoom based on viewport span (higher zoom = finer detail)
  const span = Math.max(north - south, east - west);
  const zoom = span > 1.5 ? 10 : span > 0.5 ? 11 : 12;

  // Build grid of sample points
  const points = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      points.push({
        lat: south + (north - south) * (r / (ROWS - 1)),
        lng: west + (east - west) * (c / (COLS - 1)),
      });
    }
  }

  // Find unique tiles that cover the grid
  const tileSet = new Map();
  for (const p of points) {
    const tx = lngToTileX(p.lng, zoom);
    const ty = latToTileY(p.lat, zoom);
    const key = `${tx},${ty}`;
    if (!tileSet.has(key)) tileSet.set(key, { tx, ty });
  }

  // Load all tiles in parallel
  const tileData = new Map();
  await Promise.all(
    [...tileSet.entries()].map(async ([key, { tx, ty }]) => {
      tileData.set(key, await loadTile(zoom, tx, ty));
    })
  );

  // Sample elevation at every grid point
  const grid = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      const p = points[r * COLS + c];
      const tx = lngToTileX(p.lng, zoom);
      const ty = latToTileY(p.lat, zoom);
      const imgData = tileData.get(`${tx},${ty}`);
      const { px, py } = latLngToPixel(p.lat, p.lng, tx, ty, zoom);
      return { lat: p.lat, lng: p.lng, elev: imgData ? elevationAt(imgData, px, py) : 0 };
    })
  );

  // Compute slope via central-difference gradient
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
        results.push({ lat: grid[r][c].lat, lng: grid[r][c].lng, slope: slopeDeg, elevation: grid[r][c].elev });
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
