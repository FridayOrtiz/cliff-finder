import { buildZillowUrl, buildGoogleMapsUrl, buildLandWatchUrl, buildLandsOfAmericaUrl } from '../utils/overpass';

const TYPE_LABELS = {
  cliff: 'Cliff',
  bare_rock: 'Bare Rock',
  rock: 'Rock Formation',
  scree: 'Scree/Talus',
  climbing: 'Climbing Area',
};

export function OsmFeaturePopup({ feature, onAddLocation }) {
  const label = TYPE_LABELS[feature.type] || feature.type;

  return (
    <div style={{ minWidth: 220 }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
        {feature.name || label}
      </div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
        OSM: {label} &middot; {feature.lat.toFixed(4)}, {feature.lon.toFixed(4)}
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4 }}>PROPERTY LISTINGS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <a href={buildGoogleMapsUrl(feature.lat, feature.lon)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Google Maps — Land for Sale
          </a>
          <a href={buildZillowUrl(feature.lat, feature.lon)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Zillow
          </a>
          <a href={buildLandWatchUrl(feature.lat, feature.lon)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            LandWatch
          </a>
          <a href={buildLandsOfAmericaUrl(feature.lat, feature.lon)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Lands of America
          </a>
        </div>
      </div>

      <button
        onClick={() => onAddLocation({ lat: feature.lat, lng: feature.lon, name: feature.name || label, osmId: feature.osmId })}
        style={{
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          padding: '5px 12px',
          cursor: 'pointer',
          fontSize: 12,
          width: '100%',
        }}
      >
        + Save to My Locations
      </button>
    </div>
  );
}

const linkStyle = {
  color: '#7eb8f7',
  fontSize: 12,
  textDecoration: 'none',
  display: 'block',
};
