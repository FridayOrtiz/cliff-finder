const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Fetch natural rock features from OpenStreetMap within a bounding box
export async function fetchClimbingFeatures(bounds) {
  const { south, west, north, east } = bounds;
  const bbox = `${south},${west},${north},${east}`;

  const query = `
    [out:json][timeout:25];
    (
      node["natural"="bare_rock"](${bbox});
      node["natural"="cliff"](${bbox});
      node["natural"="rock"](${bbox});
      node["natural"="scree"](${bbox});
      node["climbing"](${bbox});
      way["natural"="bare_rock"](${bbox});
      way["natural"="cliff"](${bbox});
      way["natural"="rock"](${bbox});
      way["leisure"="climbing"](${bbox});
      relation["natural"="cliff"](${bbox});
      relation["leisure"="climbing"](${bbox});
    );
    out center;
  `;

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) throw new Error('Overpass API error');
  const data = await response.json();

  return data.elements.map((el) => ({
    osmId: `${el.type}/${el.id}`,
    lat: el.lat ?? el.center?.lat,
    lon: el.lon ?? el.center?.lon,
    type: el.tags?.natural || el.tags?.leisure || 'rock',
    name: el.tags?.name || null,
    tags: el.tags || {},
  })).filter((el) => el.lat && el.lon);
}

// Build a Zillow search URL for an area
export function buildZillowUrl(lat, lng) {
  return `https://www.zillow.com/homes/for_sale/${lat},${lng}_ll/`;
}

// Build a Redfin search URL
export function buildRedfinUrl(lat, lng) {
  return `https://www.redfin.com/gis-search?lat=${lat}&lng=${lng}&zoom=13`;
}

// Build a LandWatch search URL (land/rural listings)
export function buildLandWatchUrl(lat, lng) {
  return `https://www.landwatch.com/land/for-sale?lat=${lat}&lng=${lng}`;
}

// Build an OpenTopoMap link
export function buildTopoUrl(lat, lng, zoom = 14) {
  return `https://opentopomap.org/#map=${zoom}/${lat}/${lng}`;
}
