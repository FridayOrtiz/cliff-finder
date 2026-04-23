import { X } from 'lucide-react';

const SECTIONS = [
  {
    icon: '🗺️',
    title: 'Map Layers',
    body: `Switch base maps using the layer control (top-right corner of the map).
• OpenTopoMap — topographic contours, best for reading terrain relief at a glance
• USGS Topo — US government topo map, high accuracy
• ESRI Satellite — aerial imagery, great for spotting exposed rock visually
• OpenStreetMap — general reference

Toggle the Hillshade overlay to add shaded relief on top of any base map — especially useful over satellite.`,
  },
  {
    icon: '🪨',
    title: 'OSM Rock (OpenStreetMap Features)',
    body: `Fetches rock and climbing features from OpenStreetMap for the current map view. Use the filter icon (⚙) next to the button to choose which types to load:
• Cliffs — cliff faces mapped in OSM
• Exposed Rock — bare rock slabs and outcrops
• Scree & Talus — loose rock fields (often beneath cliffs)
• Mapped Climbing — areas explicitly tagged as climbing in OSM
• Boulders — individual large boulders

Orange/yellow markers appear on the map. Tap a marker to see property listing links or save it to your list. Note: OSM coverage is incomplete — use "Known Climbs" to supplement.`,
  },
  {
    icon: '📐',
    title: 'Slope Analysis',
    body: `Samples a 10×10 grid of elevation points across the current view using SRTM 30m satellite elevation data, then computes the slope angle at each point.

Color coding:
• Yellow — 20–30°, rolling terrain with some relief
• Orange — 30–40°, steep slopes, likely cliff bands nearby
• Red-orange — 40–50°, very steep, strong cliff potential
• Red — 50°+, near-vertical faces

Works best zoomed to county scale or closer (roughly zoom 9+). Tap any circle to see the slope angle and elevation.`,
  },
  {
    icon: '🧗',
    title: 'Known Climbs (OpenBeta)',
    body: `Queries OpenBeta (openbeta.io), an open-source climbing database, for documented climbing areas within the current view. Purple markers show areas with their route count.

This fills in crags that aren't tagged in OSM. Tap a marker to save it to your locations list. Coverage is best in the US and improving globally.`,
  },
  {
    icon: '📍',
    title: 'Pinning Locations',
    body: `Tap anywhere on the map to drop a pin. A form opens to name it and add notes. Each location can be marked:
• Unexplored (grey) — not yet checked out
• Viable (green) — confirmed climbing potential
• Non-Viable (red) — ruled out

You can also save any OSM or OpenBeta marker to your list with the "Save to My Locations" button.

Your pins are stored locally in your browser — they persist across sessions but are specific to this device.`,
  },
  {
    icon: '🏡',
    title: 'Property Listings',
    body: `Every saved pin and OSM marker includes links to search for nearby properties for sale:
• Google Maps — most reliable, shows all nearby listings on a map
• Zillow — residential and rural listings
• Realtor.com — land-filtered search
• Land.com — large rural land marketplace, best for acreage

Links open centered near the pin's coordinates. Results may include surrounding parcels — cross-reference with slope data to identify which parcel the rock is on.`,
  },
  {
    icon: '📋',
    title: 'Sidebar',
    body: `The sidebar (toggle with the ≡ button) lists all your saved locations with their status. Tap any entry to fly to it on the map and open its popup. On mobile the sidebar slides in as an overlay — tap outside or the X to dismiss.`,
  },
];

export function HelpModal({ onClose }) {
  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Cliff Finder — How It Works</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              Find potential climbing terrain and check if it's for sale
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle} aria-label="Close help">
            <X size={18} />
          </button>
        </div>

        <div style={bodyStyle}>
          {SECTIONS.map((s) => (
            <div key={s.title} style={sectionStyle}>
              <div style={sectionTitleStyle}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span>{s.title}</span>
              </div>
              <p style={sectionBodyStyle}>{s.body}</p>
            </div>
          ))}

          <div style={{ fontSize: 11, color: '#555', marginTop: 16, paddingTop: 12, borderTop: '1px solid #333' }}>
            Data sources: OpenStreetMap (ODbL), SRTM via OpenTopoData, OpenBeta (CC-BY), ESRI Hillshade, OpenTopoMap. Property links open third-party sites.
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  zIndex: 9000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

const modalStyle = {
  background: '#1e1e1e',
  border: '1px solid #444',
  borderRadius: 10,
  width: '100%',
  maxWidth: 560,
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '16px 20px 14px',
  borderBottom: '1px solid #333',
  flexShrink: 0,
};

const bodyStyle = {
  overflowY: 'auto',
  padding: '12px 20px 20px',
};

const sectionStyle = {
  marginBottom: 20,
};

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontWeight: 600,
  fontSize: 13,
  color: '#e0e0e0',
  marginBottom: 6,
};

const sectionBodyStyle = {
  fontSize: 12,
  color: '#999',
  lineHeight: 1.7,
  whiteSpace: 'pre-line',
  margin: 0,
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#888',
  cursor: 'pointer',
  padding: 4,
  flexShrink: 0,
  display: 'flex',
};
