export const GEOCODE_API_URL = 'https://data.geopf.fr/geocodage/search'

export const STATIONS_API_URL =
  'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records'

export const FUEL_TYPES = ['SP95', 'SP98', 'Gazole', 'E85', 'GPLc', 'E10']

export const FUEL_FIELD_MAP = {
  SP95: 'sp95',
  SP98: 'sp98',
  Gazole: 'gazole',
  E85: 'e85',
  GPLc: 'gplc',
  E10: 'e10',
}

export const RADIUS_OPTIONS = [5, 10, 20, 50]
export const DEFAULT_RADIUS = 10

export const GEOCODE_LIMIT = 5
export const GEOCODE_DEBOUNCE_MS = 300
export const GEOCODE_MIN_QUERY_LENGTH = 3

export const STATIONS_MAX_LIMIT = 100
export const TOP_CHEAP_COUNT = 3

export const FRANCE_CENTER = { lat: 46.603354, lng: 1.888334 }
export const FRANCE_ZOOM = 6
