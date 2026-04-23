const ENDPOINT = 'https://api.openbeta.io/';
const MAX_RADIUS_M = 100_000;

export async function fetchOpenBetaAreas(lat, lng, radiusMeters = 40_000) {
  const maxDistance = Math.min(Math.round(radiusMeters), MAX_RADIUS_M);

  const query = `
    query CragsNear($lnglat: Point, $maxDistance: Int) {
      cragsNear(lnglat: $lnglat, maxDistance: $maxDistance, includeCrags: true) {
        crags {
          areaName
          metadata { lat lng }
          totalClimbs
        }
      }
    }
  `;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { lnglat: { lat, lng }, maxDistance },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenBeta ${res.status}${text ? ': ' + text : ''}`);
  }

  const json = await res.json();

  if (json.errors?.length) throw new Error(json.errors[0]?.message || 'OpenBeta query error');

  const crags = json.data?.cragsNear?.crags ?? [];

  // Return diagnostic info alongside results so the caller can surface it
  return { crags, raw: json.data };
}
