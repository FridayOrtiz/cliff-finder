import { MapPin, CheckCircle, XCircle, Circle, Trash2 } from 'lucide-react';

const STATUS_CONFIG = {
  unexplored: { icon: Circle, color: '#888', label: 'Unexplored' },
  viable: { icon: CheckCircle, color: '#4caf50', label: 'Viable' },
  'non-viable': { icon: XCircle, color: '#f44336', label: 'Non-Viable' },
};

export function Sidebar({ locations, onSelectLocation, onDeleteLocation, selectedId }) {
  const counts = locations.reduce((acc, loc) => {
    acc[loc.status] = (acc[loc.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <MapPin size={16} color="#7eb8f7" />
        <span style={{ fontWeight: 600, fontSize: 14 }}>My Locations</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#888' }}>{locations.length} total</span>
      </div>

      <div style={statsStyle}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <cfg.icon size={10} color={cfg.color} />
            <span style={{ color: cfg.color }}>{counts[key] || 0} {cfg.label}</span>
          </div>
        ))}
      </div>

      <div style={listStyle}>
        {locations.length === 0 && (
          <div style={{ color: '#555', fontSize: 12, padding: '20px 12px', textAlign: 'center', lineHeight: 1.6 }}>
            Click anywhere on the map to pin a location, or use "Fetch OSM Features" to find rock formations.
          </div>
        )}
        {locations.map((loc) => {
          const cfg = STATUS_CONFIG[loc.status] || STATUS_CONFIG.unexplored;
          const isSelected = loc.id === selectedId;
          return (
            <div
              key={loc.id}
              onClick={() => onSelectLocation(loc)}
              style={{
                ...itemStyle,
                background: isSelected ? '#2a3a2a' : 'transparent',
                borderLeft: `3px solid ${isSelected ? cfg.color : 'transparent'}`,
              }}
            >
              <cfg.icon size={12} color={cfg.color} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {loc.name || 'Unnamed'}
                </div>
                <div style={{ fontSize: 10, color: '#666' }}>
                  {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteLocation(loc.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 2, flexShrink: 0 }}
                title="Delete"
              >
                <Trash2 size={11} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const sidebarStyle = {
  width: 220,
  background: '#1e1e1e',
  borderRight: '1px solid #333',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  overflow: 'hidden',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px',
  borderBottom: '1px solid #333',
};

const statsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  padding: '8px 12px',
  borderBottom: '1px solid #2a2a2a',
};

const listStyle = {
  flex: 1,
  overflowY: 'auto',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  padding: '7px 10px 7px 8px',
  cursor: 'pointer',
  borderBottom: '1px solid #252525',
  transition: 'background 0.1s',
};
