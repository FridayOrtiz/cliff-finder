import { Mountain, Loader, Layers, Info } from 'lucide-react';

export function Toolbar({ onFetchFeatures, loading, osmCount }) {
  return (
    <div style={toolbarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Mountain size={18} color="#7eb8f7" />
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>Cliff Finder</span>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={onFetchFeatures}
          disabled={loading}
          style={btnStyle(loading)}
          title="Fetch rock/cliff features from OpenStreetMap for current map view"
        >
          {loading ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Layers size={13} />}
          {loading ? 'Fetching...' : 'Fetch OSM Features'}
        </button>

        {osmCount > 0 && (
          <span style={{ fontSize: 11, color: '#888' }}>
            {osmCount} feature{osmCount !== 1 ? 's' : ''} shown
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#555' }}>
          <Info size={11} />
          <span>Click map to pin &bull; Right-click OSM markers to save</span>
        </div>
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
  padding: '0 16px',
  gap: 16,
  flexShrink: 0,
  zIndex: 1000,
};

const btnStyle = (disabled) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  background: disabled ? '#333' : '#2563eb',
  color: disabled ? '#888' : '#fff',
  border: 'none',
  borderRadius: 5,
  padding: '5px 12px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: 12,
  fontWeight: 500,
});
