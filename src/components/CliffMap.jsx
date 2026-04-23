import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OsmFeaturePopup } from './OsmFeaturePopup';
import { LocationPopup } from './LocationPopup';
import { slopeColor, slopeLabel } from '../utils/terrain';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS = {
  unexplored: '#888888',
  viable: '#4caf50',
  'non-viable': '#f44336',
};

const OSM_COLORS = {
  cliff: '#ff9800',
  bare_rock: '#ff9800',
  rock: '#ffc107',
  scree: '#cc8800',
  climbing: '#2196f3',
};

function makeCircleIcon(color, size = 14) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.6);box-shadow:0 1px 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

function makeOpenBetaIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:3px;background:#a855f7;border:2px solid rgba(255,255,255,0.7);box-shadow:0 1px 4px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700;">C</div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -13],
  });
}

// Stops tap events inside popups from propagating to the Leaflet map click handler.
function PopupContent({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      L.DomEvent.disableClickPropagation(ref.current);
      L.DomEvent.disableScrollPropagation(ref.current);
    }
  }, []);
  return <div ref={ref}>{children}</div>;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

function MapRefSetter({ mapRef }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

function FlyToLocation({ target }) {
  const map = useMap();
  const prevTarget = useRef(null);
  useEffect(() => {
    if (target && target._t !== prevTarget.current?._t) {
      prevTarget.current = target;
      map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
    }
  }, [target, map]);
  return null;
}

export function CliffMap({
  mapRef,
  locations,
  osmFeatures,
  openBetaAreas,
  slopeData,
  onMapClick,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  flyTarget,
}) {
  const markerRefs = useRef({});

  useEffect(() => {
    if (flyTarget) {
      const timer = setTimeout(() => {
        markerRefs.current[flyTarget.id]?.openPopup();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [flyTarget]);

  return (
    <MapContainer
      center={[39.5, -98.35]}
      zoom={5}
      style={{ width: '100%', height: '100%' }}
    >
      <MapRefSetter mapRef={mapRef} />
      <FlyToLocation target={flyTarget} />
      <MapClickHandler onMapClick={onMapClick} />

      <LayersControl position="topright">
        {/* Base layers */}
        <LayersControl.BaseLayer checked name="OpenTopoMap">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors, SRTM | &copy; OpenTopoMap'
            maxZoom={17}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="ESRI Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri'
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="USGS Topo">
          <TileLayer
            url="https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}"
            attribution='USGS'
            maxZoom={16}
          />
        </LayersControl.BaseLayer>

        {/* Overlays */}
        <LayersControl.Overlay name="Hillshade">
          <TileLayer
            url="https://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade_Dark/MapServer/tile/{z}/{y}/{x}"
            attribution='ESRI'
            opacity={0.45}
            maxZoom={19}
          />
        </LayersControl.Overlay>
      </LayersControl>

      {/* Slope heatmap from terrain analysis */}
      {slopeData.map((pt, i) => (
        <CircleMarker
          key={i}
          center={[pt.lat, pt.lng]}
          radius={18}
          pathOptions={{
            color: 'transparent',
            fillColor: slopeColor(pt.slope),
            fillOpacity: 0.55,
          }}
        >
          <Popup keepInView maxWidth={220}>
            <PopupContent>
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: slopeColor(pt.slope) }}>
                  {pt.slope.toFixed(0)}° slope
                </div>
                <div style={{ fontSize: 11, color: '#bbb', marginBottom: 4 }}>{slopeLabel(pt.slope)}</div>
                <div style={{ fontSize: 11, color: '#666' }}>{pt.elevation.toFixed(0)} m elevation</div>
              </div>
            </PopupContent>
          </Popup>
        </CircleMarker>
      ))}

      {/* OpenBeta known climbing areas */}
      {openBetaAreas.map((area) => (
        <Marker
          key={`${area.metadata.lat}-${area.metadata.lng}`}
          position={[area.metadata.lat, area.metadata.lng]}
          icon={makeOpenBetaIcon()}
        >
          <Popup keepInView maxWidth={240}>
            <PopupContent>
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{area.areaName}</div>
                <div style={{ fontSize: 11, color: '#a855f7', marginBottom: 6 }}>
                  {area.totalClimbs} climb{area.totalClimbs !== 1 ? 's' : ''} · OpenBeta
                </div>
                <button
                  onClick={() => onAddLocation({
                    lat: area.metadata.lat,
                    lng: area.metadata.lng,
                    name: area.areaName,
                  })}
                  style={saveBtnStyle}
                >
                  + Save to My Locations
                </button>
              </div>
            </PopupContent>
          </Popup>
        </Marker>
      ))}

      {/* OSM natural features */}
      {osmFeatures.map((feature) => (
        <Marker
          key={feature.osmId}
          position={[feature.lat, feature.lon]}
          icon={makeCircleIcon(OSM_COLORS[feature.type] || '#ff9800', 12)}
        >
          <Popup keepInView maxWidth={280}>
            <PopupContent>
              <OsmFeaturePopup feature={feature} onAddLocation={onAddLocation} />
            </PopupContent>
          </Popup>
        </Marker>
      ))}

      {/* User-saved locations */}
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={makeCircleIcon(STATUS_COLORS[loc.status] || STATUS_COLORS.unexplored, 16)}
          ref={(ref) => { markerRefs.current[loc.id] = ref; }}
        >
          <Popup keepInView maxWidth={280}>
            <PopupContent>
              <LocationPopup
                location={loc}
                onUpdate={onUpdateLocation}
                onDelete={onDeleteLocation}
              />
            </PopupContent>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

const saveBtnStyle = {
  background: '#7c3aed',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: 13,
  width: '100%',
  touchAction: 'manipulation',
};
