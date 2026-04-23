const ENDPOINT = 'https://api.openbeta.io/';

export async function fetchOpenBetaAreas(lat, lng, radiusMeters = 40000) {
  const query = `
    query NearbyAreas($lng: Float!, $lat: Float!, $maxDistance: Int!) {
      cragsNear(lng: $lng, lat: $lat, maxDistance: $maxDistance, includeCrags: true) {
        areaName
        metadata { lat lng }
        totalClimbs
        uuid
      }
    }
  `;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { lat, lng, maxDistance: radiusMeters } }),
  });

  if (!res.ok) throw new Error(`OpenBeta error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || 'OpenBeta query error');

  return (json.data?.cragsNear ?? []).filter(
    (a) => a.metadata?.lat && a.metadata?.lng && a.totalClimbs > 0
  );
}
