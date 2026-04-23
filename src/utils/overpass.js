const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

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

// Google Maps "land for sale" search — most reliable cross-platform option
export function buildGoogleMapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/land+for+sale/@${lat},${lng},13z`;
}

// Zillow map search centered on coordinates
export function buildZillowUrl(lat, lng) {
  return `https://www.zillow.com/homes/${lat},${lng}_ll/`;
}

// LandWatch rural/land listings — lon param (not lng)
export function buildLandWatchUrl(lat, lng) {
  return `https://www.landwatch.com/land/for-sale?lat=${lat}&lon=${lng}`;
}

// Lands of America — large rural land marketplace
export function buildLandsOfAmericaUrl(lat, lng) {
  return `https://www.landsofamerica.com/land/search/?lat=${lat}&lon=${lng}`;
}

export function buildTopoUrl(lat, lng, zoom = 14) {
  return `https://opentopomap.org/#map=${zoom}/${lat}/${lng}`;
}
