import { Mountain, Loader, Layers, Menu } from 'lucide-react';

export function Toolbar({ onFetchFeatures, loading, osmCount, onToggleSidebar, sidebarOpen }) {
  return (
    <div style={toolbarStyle}>
      <button
        onClick={onToggleSidebar}
        style={iconBtnStyle}
        title={sidebarOpen ? 'Hide locations' : 'Show locations'}
        aria-label="Toggle sidebar"
      >
        <Menu size={18} color="#aaa" />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Mountain size={16} color="#7eb8f7" />
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>Cliff Finder</span>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
        {osmCount > 0 && (
          <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>
            {osmCount} feature{osmCount !== 1 ? 's' : ''}
          </span>
        )}
        <button
          onClick={onFetchFeatures}
          disabled={loading}
          style={btnStyle(loading)}
          title="Fetch rock/cliff features from OpenStreetMap for current map view"
        >
          {loading
            ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
            : <Layers size={13} />}
          <span style={{ whiteSpace: 'nowrap' }}>{loading ? 'Fetching…' : 'Fetch OSM'}</span>
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
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

const btnStyle = (disabled) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  background: disabled ? '#333' : '#2563eb',
  color: disabled ? '#888' : '#fff',
  border: 'none',
  borderRadius: 5,
  padding: '5px 10px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: 12,
  fontWeight: 500,
});
