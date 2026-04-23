const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export const OSM_FILTER_DEFS = [
  {
    key: 'cliffs',
    label: 'Cliffs',
    description: 'Mapped cliff faces and escarpments (natural=cliff)',
    color: '#ff9800',
    parts: (bb) => [
      `node["natural"="cliff"](${bb})`,
      `way["natural"="cliff"](${bb})`,
      `relation["natural"="cliff"](${bb})`,
    ],
  },
  {
    key: 'bareRock',
    label: 'Exposed Rock',
    description: 'Bare or exposed rock surfaces — slabs, outcrops (natural=bare_rock, natural=rock)',
    color: '#ffc107',
    parts: (bb) => [
      `node["natural"="bare_rock"](${bb})`,
      `node["natural"="rock"](${bb})`,
      `way["natural"="bare_rock"](${bb})`,
      `way["natural"="rock"](${bb})`,
    ],
  },
  {
    key: 'scree',
    label: 'Scree & Talus',
    description: 'Loose rock fields at the base of cliffs — often indicates cliffs above (natural=scree)',
    color: '#cc8800',
    parts: (bb) => [
      `node["natural"="scree"](${bb})`,
      `way["natural"="scree"](${bb})`,
    ],
  },
  {
    key: 'climbing',
    label: 'Mapped Climbing',
    description: 'Areas explicitly tagged as climbing in OSM — sparse but authoritative (leisure=climbing, climbing=*)',
    color: '#2196f3',
    parts: (bb) => [
      `node["climbing"](${bb})`,
      `way["leisure"="climbing"](${bb})`,
      `relation["leisure"="climbing"](${bb})`,
    ],
  },
  {
    key: 'boulders',
    label: 'Boulders',
    description: 'Individual large boulders that may offer bouldering problems (natural=stone, natural=boulder)',
    color: '#9e9e9e',
    parts: (bb) => [
      `node["natural"="stone"](${bb})`,
      `node["natural"="boulder"](${bb})`,
    ],
  },
];

export const DEFAULT_OSM_FILTERS = Object.fromEntries(
  OSM_FILTER_DEFS.map((f) => [f.key, true])
);

export async function fetchClimbingFeatures(bounds, filters = DEFAULT_OSM_FILTERS) {
  const { south, west, north, east } = bounds;
  const bbox = `${south},${west},${north},${east}`;

  const activeParts = OSM_FILTER_DEFS
    .filter((f) => filters[f.key])
    .flatMap((f) => f.parts(bbox));

  if (activeParts.length === 0) return [];

  const query = `
    [out:json][timeout:25];
    (
      ${activeParts.join(';\n      ')};
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
