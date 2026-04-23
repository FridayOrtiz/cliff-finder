import { useState, useCallback, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { CliffMap } from './components/CliffMap';
import { useLocations } from './hooks/useLocations';
import { useIsMobile } from './hooks/useIsMobile';
import { fetchClimbingFeatures } from './utils/overpass';

export default function App() {
  const { locations, addLocation, updateLocation, deleteLocation } = useLocations();
  const [osmFeatures, setOsmFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const mapRef = useRef(null);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleMapClick = useCallback((latlng) => {
    const loc = addLocation({ lat: latlng.lat, lng: latlng.lng });
    setFlyTarget({ ...loc, _t: Date.now() });
  }, [addLocation]);

  const handleAddLocation = useCallback((data) => {
    const loc = addLocation(data);
    setFlyTarget({ ...loc, _t: Date.now() });
  }, [addLocation]);

  const handleFetchFeatures = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds();
    setLoading(true);
    try {
      const features = await fetchClimbingFeatures({
        south: b.getSouth(),
        west: b.getWest(),
        north: b.getNorth(),
        east: b.getEast(),
      });
      setOsmFeatures(features);
    } catch (err) {
      alert(`Failed to fetch OSM features: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectLocation = useCallback((loc) => {
    setFlyTarget({ ...loc, _t: Date.now() });
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        onFetchFeatures={handleFetchFeatures}
        loading={loading}
        osmCount={osmFeatures.length}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Sidebar
          locations={locations}
          onSelectLocation={handleSelectLocation}
          onDeleteLocation={deleteLocation}
          selectedId={flyTarget?.id}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
        <div style={{ flex: 1, position: 'relative' }}>
          <CliffMap
            mapRef={mapRef}
            locations={locations}
            osmFeatures={osmFeatures}
            onMapClick={handleMapClick}
            onAddLocation={handleAddLocation}
            onUpdateLocation={updateLocation}
            onDeleteLocation={deleteLocation}
            flyTarget={flyTarget}
          />
        </div>
      </div>
    </div>
  );
}
