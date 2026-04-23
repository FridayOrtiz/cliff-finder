import { useState } from 'react';
import { buildZillowUrl, buildGoogleMapsUrl, buildRealtorUrl, buildLandComUrl, buildTopoUrl } from '../utils/overpass';

const STATUS_OPTIONS = [
  { value: 'unexplored', label: 'Unexplored', color: '#888' },
  { value: 'viable', label: 'Viable', color: '#4caf50' },
  { value: 'non-viable', label: 'Non-Viable', color: '#f44336' },
];

export function LocationPopup({ location, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(!location.name);
  const [name, setName] = useState(location.name || '');
  const [notes, setNotes] = useState(location.notes || '');
  const [status, setStatus] = useState(location.status || 'unexplored');

  const save = () => {
    onUpdate(location.id, { name, notes, status });
    setEditing(false);
  };

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status);

  return (
    <div style={{ width: 240 }}>
      {editing ? (
        <>
          <input
            type="text"
            placeholder="Location name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ ...inputStyle, marginTop: 6 }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <textarea
            placeholder="Notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ ...inputStyle, marginTop: 6, resize: 'none' }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button onClick={save} style={btnStyle('#4caf50')}>Save</button>
            {location.name && (
              <button onClick={() => setEditing(false)} style={btnStyle('#555')}>Cancel</button>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            {location.name || 'Unnamed Location'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: currentStatus?.color }} />
            <span style={{ fontSize: 12, color: currentStatus?.color }}>{currentStatus?.label}</span>
          </div>
          {location.notes && (
            <p style={{ fontSize: 12, color: '#bbb', marginBottom: 8 }}>{location.notes}</p>
          )}
          <div style={{ fontSize: 11, color: '#666', marginBottom: 10 }}>
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={sectionLabel}>PROPERTY LISTINGS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <a href={buildGoogleMapsUrl(location.lat, location.lng)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                Google Maps — Land for Sale
              </a>
              <a href={buildZillowUrl(location.lat, location.lng)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                Zillow
              </a>
              <a href={buildRealtorUrl(location.lat, location.lng)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                Realtor.com
              </a>
              <a href={buildLandComUrl(location.lat, location.lng)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                Land.com
              </a>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={sectionLabel}>MAPS</div>
            <a href={buildTopoUrl(location.lat, location.lng)} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              OpenTopoMap
            </a>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setEditing(true)} style={btnStyle('#555')}>Edit</button>
            <button onClick={() => onDelete(location.id)} style={btnStyle('#c0392b')}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: '#1a1a1a',
  border: '1px solid #555',
  color: '#e0e0e0',
  borderRadius: 4,
  padding: '8px',
  // 16px minimum prevents iOS Safari from zooming in on focus
  fontSize: 16,
  boxSizing: 'border-box',
};

const btnStyle = (bg) => ({
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  // Tall enough for a comfortable touch target
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: 14,
  touchAction: 'manipulation',
});

const linkStyle = {
  color: '#7eb8f7',
  fontSize: 13,
  textDecoration: 'none',
  display: 'block',
  padding: '2px 0',
};

const sectionLabel = {
  fontSize: 11,
  fontWeight: 600,
  color: '#888',
  marginBottom: 4,
};
