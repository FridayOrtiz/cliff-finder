import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cliff-finder-locations';

export function useLocations() {
  const [locations, setLocations] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  }, [locations]);

  const addLocation = (location) => {
    const newLoc = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'unexplored', // unexplored | viable | non-viable
      notes: '',
      name: '',
      ...location,
    };
    setLocations((prev) => [...prev, newLoc]);
    return newLoc;
  };

  const updateLocation = (id, updates) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, ...updates } : loc))
    );
  };

  const deleteLocation = (id) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  return { locations, addLocation, updateLocation, deleteLocation };
}
