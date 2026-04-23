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

// Google Maps "land for sale" search — opens Maps centered on coordinates
export function buildGoogleMapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/land+for+sale/@${lat},${lng},13z`;
}

// Zillow map search using their internal searchQueryState bounding-box format
export function buildZillowUrl(lat, lng) {
  const d = 0.1;
  const state = JSON.stringify({
    isMapVisible: true,
    mapBounds: { west: lng - d, east: lng + d, south: lat - d, north: lat + d },
    filterState: { isForSaleByAgent: { value: true }, isForSaleByOwner: { value: true } },
  });
  return `https://www.zillow.com/homes/for_sale/?searchQueryState=${encodeURIComponent(state)}`;
}

// Realtor.com land listings near coordinates
export function buildRealtorUrl(lat, lng) {
  return `https://www.realtor.com/realestateandhomes-search/homes?lat=${lat}&lng=${lng}&type=land`;
}

// Land.com — large rural/raw land marketplace (CoStar network)
export function buildLandComUrl(lat, lng) {
  return `https://www.land.com/land/search/?lat=${lat}&lon=${lng}`;
}

export function buildTopoUrl(lat, lng, zoom = 14) {
  return `https://opentopomap.org/#map=${zoom}/${lat}/${lng}`;
}
