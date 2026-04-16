import { GEOCODE_API_URL, GEOCODE_LIMIT } from '../config/constants.js'

export async function searchAddress(query, lat, lon) {
  const params = new URLSearchParams({
    q: query,
    index: 'address',
    limit: String(GEOCODE_LIMIT),
    autocomplete: 'true',
  })

  if (lat != null && lon != null) {
    params.set('lat', String(lat))
    params.set('lon', String(lon))
  }

  const response = await fetch(`${GEOCODE_API_URL}?${params}`)

  if (!response.ok) {
    throw new Error(`Geocode API error: ${response.status}`)
  }

  const data = await response.json()

  return data.features.map((feature) => ({
    label: feature.properties.label,
    lat: feature.geometry.coordinates[1],
    lng: feature.geometry.coordinates[0],
  }))
}
