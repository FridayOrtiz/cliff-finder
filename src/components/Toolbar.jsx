import { Mountain, Loader, Layers, Menu, Activity, MapPin } from 'lucide-react';

export function Toolbar({
  onFetchOsm, osmLoading, osmCount,
  onAnalyzeTerrain, terrainLoading, slopeCount,
  onFetchClimbs, climbsLoading, climbsCount,
  onToggleSidebar, sidebarOpen,
}) {
  return (
    <div style={toolbarStyle}>
      <button onClick={onToggleSidebar} style={iconBtnStyle} aria-label="Toggle sidebar">
        <Menu size={18} color="#aaa" />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <Mountain size={16} color="#7eb8f7" />
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
          Cliff Finder
        </span>
      </div>

      <div style={btnGroupStyle}>
        <ToolBtn
          onClick={onFetchOsm}
          loading={osmLoading}
          icon={<Layers size={13} />}
          label="OSM Rock"
          count={osmCount}
          color="#2563eb"
          title="Fetch cliff/rock features from OpenStreetMap"
        />
        <ToolBtn
          onClick={onAnalyzeTerrain}
          loading={terrainLoading}
          icon={<Activity size={13} />}
          label="Slope"
          count={slopeCount}
          color="#d97706"
          title="Analyze terrain slope — highlights steep areas likely to have cliffs (uses SRTM elevation data)"
        />
        <ToolBtn
          onClick={onFetchClimbs}
          loading={climbsLoading}
          icon={<MapPin size={13} />}
          label="Known Climbs"
          count={climbsCount}
          color="#7c3aed"
          title="Fetch known climbing areas from OpenBeta (open climbing database)"
        />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ToolBtn({ onClick, loading, icon, label, count, color, title }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: loading ? '#333' : color,
        color: loading ? '#888' : '#fff',
        border: 'none', borderRadius: 5,
        padding: '5px 10px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
        touchAction: 'manipulation',
      }}
      title={title}
    >
      {loading
        ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
        : icon}
      {loading ? '…' : label}
      {!loading && count > 0 && (
        <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 8, padding: '0 5px', fontSize: 10 }}>
          {count}
        </span>
      )}
    </button>
  );
}

const toolbarStyle = {
  height: 44,
  background: '#1a1a1a',
  borderBottom: '1px solid #333',
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  gap: 10,
  flexShrink: 0,
  zIndex: 1000,
  overflowX: 'auto',
};

const btnGroupStyle = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
  marginLeft: 'auto',
  flexShrink: 0,
};

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  padding: 4,
  borderRadius: 4,
  flexShrink: 0,
};
