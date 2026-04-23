import { useState, useCallback, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { CliffMap } from './components/CliffMap';
import { useLocations } from './hooks/useLocations';
import { useIsMobile } from './hooks/useIsMobile';
import { fetchClimbingFeatures } from './utils/overpass';
import { fetchSlopeGrid } from './utils/terrain';
import { fetchOpenBetaAreas } from './utils/openBeta';

export default function App() {
  const { locations, addLocation, updateLocation, deleteLocation } = useLocations();
  const [osmFeatures, setOsmFeatures] = useState([]);
  const [slopeData, setSlopeData] = useState([]);
  const [openBetaAreas, setOpenBetaAreas] = useState([]);
  const [osmLoading, setOsmLoading] = useState(false);
  const [terrainLoading, setTerrainLoading] = useState(false);
  const [climbsLoading, setClimbsLoading] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const mapRef = useRef(null);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const getBounds = () => {
    const map = mapRef.current;
    if (!map) return null;
    const b = map.getBounds();
    return { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() };
  };

  const handleMapClick = useCallback((latlng) => {
    const loc = addLocation({ lat: latlng.lat, lng: latlng.lng });
    setFlyTarget({ ...loc, _t: Date.now() });
  }, [addLocation]);

  const handleAddLocation = useCallback((data) => {
    const loc = addLocation(data);
    setFlyTarget({ ...loc, _t: Date.now() });
  }, [addLocation]);

  const handleFetchOsm = useCallback(async () => {
    const bounds = getBounds();
    if (!bounds) return;
    setOsmLoading(true);
    try {
      setOsmFeatures(await fetchClimbingFeatures(bounds));
    } catch (err) {
      alert(`OSM fetch failed: ${err.message}`);
    } finally {
      setOsmLoading(false);
    }
  }, []);

  const handleAnalyzeTerrain = useCallback(async () => {
    const bounds = getBounds();
    if (!bounds) return;
    const spanDeg = bounds.north - bounds.south;
    if (spanDeg > 3) {
      alert('Zoom in more before running slope analysis — it works best at zoom 9 or closer.');
      return;
    }
    setTerrainLoading(true);
    try {
      setSlopeData(await fetchSlopeGrid(bounds));
    } catch (err) {
      alert(`Terrain analysis failed: ${err.message}`);
    } finally {
      setTerrainLoading(false);
    }
  }, []);

  const handleFetchClimbs = useCallback(async () => {
    const bounds = getBounds();
    if (!bounds) return;
    const centerLat = (bounds.south + bounds.north) / 2;
    const centerLng = (bounds.west + bounds.east) / 2;
    // Radius = half the diagonal of the bounding box in metres (rough)
    const latM = ((bounds.north - bounds.south) / 2) * 111320;
    const lngM = ((bounds.east - bounds.west) / 2) * 111320 * Math.cos(centerLat * Math.PI / 180);
    const radius = Math.round(Math.sqrt(latM ** 2 + lngM ** 2));
    setClimbsLoading(true);
    try {
      setOpenBetaAreas(await fetchOpenBetaAreas(centerLat, centerLng, radius));
    } catch (err) {
      alert(`OpenBeta fetch failed: ${err.message}`);
    } finally {
      setClimbsLoading(false);
    }
  }, []);

  const handleSelectLocation = useCallback((loc) => {
    setFlyTarget({ ...loc, _t: Date.now() });
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        onFetchOsm={handleFetchOsm}
        osmLoading={osmLoading}
        osmCount={osmFeatures.length}
        onAnalyzeTerrain={handleAnalyzeTerrain}
        terrainLoading={terrainLoading}
        slopeCount={slopeData.length}
        onFetchClimbs={handleFetchClimbs}
        climbsLoading={climbsLoading}
        climbsCount={openBetaAreas.length}
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
            openBetaAreas={openBetaAreas}
            slopeData={slopeData}
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
