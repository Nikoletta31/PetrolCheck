import { STATIONS_API_URL, STATIONS_MAX_LIMIT } from '../config/constants.js'

export async function fetchStations({ lat, lng, radius, fuelTypes }) {
  const whereClauses = [
    `within_distance(geom, GEOM'POINT(${lng} ${lat})', ${radius}km)`,
  ]

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
