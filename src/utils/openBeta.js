const ENDPOINT = 'https://api.openbeta.io/';

// Cap radius — very large viewports aren't useful and may time out
const MAX_RADIUS_M = 100_000;

export async function fetchOpenBetaAreas(lat, lng, radiusMeters = 40_000) {
  const maxDistance = Math.min(Math.round(radiusMeters), MAX_RADIUS_M);

  // Inline values to avoid variable type ambiguity across schema versions
  const query = `{
    cragsNear(
      lng: ${lng}
      lat: ${lat}
      maxDistance: ${maxDistance}
      includeCrags: true
    ) {
      areaName
      metadata { lat lng }
      totalClimbs
    }
  }`;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenBeta ${res.status}${text ? ': ' + text : ''}`);
  }

  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0]?.message || 'OpenBeta query error');

  return (json.data?.cragsNear ?? []).filter(
    (a) => a.metadata?.lat && a.metadata?.lng && a.totalClimbs > 0
  );
}
