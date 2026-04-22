import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OsmFeaturePopup } from './OsmFeaturePopup';
import { LocationPopup } from './LocationPopup';

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
      </LayersControl>

      {osmFeatures.map((feature) => (
        <Marker
          key={feature.osmId}
          position={[feature.lat, feature.lon]}
          icon={makeCircleIcon(OSM_COLORS[feature.type] || '#ff9800', 12)}
        >
          <Popup>
            <OsmFeaturePopup feature={feature} onAddLocation={onAddLocation} />
          </Popup>
        </Marker>
      ))}

      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={makeCircleIcon(STATUS_COLORS[loc.status] || STATUS_COLORS.unexplored, 16)}
          ref={(ref) => { markerRefs.current[loc.id] = ref; }}
        >
          <Popup>
            <LocationPopup
              location={loc}
              onUpdate={onUpdateLocation}
              onDelete={onDeleteLocation}
            />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
