const ENDPOINT = 'https://api.openbeta.io/';
const MAX_RADIUS_M = 100_000;

// Introspect CragsNear to find its actual fields (run once in console to debug)
export async function introspectCragsNear() {
  const query = `{
    __type(name: "CragsNear") { fields { name type { name kind ofType { name kind } } } }
    __schema { queryType { fields(includeDeprecated: true) {
      name args { name type { name kind ofType { name } } }
    } } }
  }`;
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

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
  console.log('[OpenBeta] raw response:', JSON.stringify(json, null, 2));

  if (json.errors?.length) throw new Error(json.errors[0]?.message || 'OpenBeta query error');

  const crags = json.data?.cragsNear?.crags;
  console.log('[OpenBeta] crags:', crags);

  return (crags ?? []).filter(
    (a) => a.metadata?.lat && a.metadata?.lng && a.totalClimbs > 0
  );
}
