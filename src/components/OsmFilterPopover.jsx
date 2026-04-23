import { useEffect, useRef } from 'react';
import { OSM_FILTER_DEFS } from '../utils/overpass';

export function OsmFilterPopover({ filters, onChange, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [onClose]);

  const allOn = OSM_FILTER_DEFS.every((f) => filters[f.key]);

  return (
    <div ref={ref} style={popoverStyle}>
      <div style={headerStyle}>
        <span style={{ fontWeight: 600, fontSize: 12 }}>OSM Data Layers</span>
        <button
          onClick={() => {
            const next = Object.fromEntries(OSM_FILTER_DEFS.map((f) => [f.key, !allOn]));
            onChange(next);
          }}
          style={toggleAllBtn}
        >
          {allOn ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {OSM_FILTER_DEFS.map((f) => (
        <label key={f.key} style={rowStyle}>
          <input
            type="checkbox"
            checked={!!filters[f.key]}
            onChange={(e) => onChange({ ...filters, [f.key]: e.target.checked })}
            style={{ accentColor: f.color, flexShrink: 0, width: 14, height: 14, cursor: 'pointer' }}
          />
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#e0e0e0' }}>{f.label}</div>
            <div style={{ fontSize: 10, color: '#777', lineHeight: 1.4 }}>{f.description}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

const popoverStyle = {
  position: 'absolute',
  top: 48,
  right: 0,
  background: '#1e1e1e',
  border: '1px solid #444',
  borderRadius: 8,
  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
  zIndex: 3000,
  width: 290,
  padding: 12,
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
  paddingBottom: 8,
  borderBottom: '1px solid #333',
};

const toggleAllBtn = {
  background: 'none',
  border: '1px solid #555',
  color: '#aaa',
  borderRadius: 4,
  padding: '2px 7px',
  fontSize: 10,
  cursor: 'pointer',
};

const rowStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  padding: '7px 0',
  borderBottom: '1px solid #2a2a2a',
  cursor: 'pointer',
};
