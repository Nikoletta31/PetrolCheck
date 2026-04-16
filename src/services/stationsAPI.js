import {
  STATIONS_API_URL,
  STATIONS_MAX_LIMIT,
  FUEL_FIELD_MAP,
  FUEL_TYPES,
} from '../config/constants.js'

export async function fetchStations({ lat, lng, radius, fuelTypes, maxPrix }) {
  const whereClauses = [
    `within_distance(geom, GEOM'POINT(${lng} ${lat})', ${radius}km)`,
  ]

  // Price filter: keep only stations where at least one relevant fuel is <= maxPrix.
  // Applied server-side to reduce payload before client-side re-check in filters.js.
  if (maxPrix != null) {
    const fuelsToCheck = fuelTypes && fuelTypes.length > 0 ? fuelTypes : FUEL_TYPES
    const priceClauses = fuelsToCheck.map(f => `${FUEL_FIELD_MAP[f]}_prix <= ${maxPrix}`)
    whereClauses.push(`(${priceClauses.join(' OR ')})`)
  }

  const params = new URLSearchParams({
    where: whereClauses.join(' AND '),
    limit: String(STATIONS_MAX_LIMIT),
  })

  if (fuelTypes && fuelTypes.length > 0) {
    for (const fuel of fuelTypes) {
      params.append('refine', `carburants_disponibles:"${fuel}"`)
    }
  }

  const url = `${STATIONS_API_URL}?${params.toString()}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Stations API error: ${response.status}`)
  }

  const data = await response.json()
  return data.results || []
}
