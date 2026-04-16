import { ref } from 'vue'
import { searchAddress } from '../services/geocodeAPI.js'
import { GEOCODE_DEBOUNCE_MS, GEOCODE_MIN_QUERY_LENGTH } from '../config/constants.js'

export function useSearch() {
  const query = ref('')
  const suggestions = ref([])
  const selectedCoords = ref(null)

  let debounceTimer = null

  async function search(q, userLat, userLon) {
    query.value = q

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (!q || q.length < GEOCODE_MIN_QUERY_LENGTH) {
      suggestions.value = []
      return
    }

    debounceTimer = setTimeout(async () => {
      try {
        suggestions.value = await searchAddress(q, userLat, userLon)
      } catch (err) {
        console.error('Search error:', err)
        suggestions.value = []
      }
    }, GEOCODE_DEBOUNCE_MS)
  }

  function select(suggestion) {
    selectedCoords.value = {
      lat: suggestion.lat,
      lng: suggestion.lng,
    }
    query.value = suggestion.label
    suggestions.value = []
  }

  function clear() {
    query.value = ''
    suggestions.value = []
    selectedCoords.value = null
  }

  return { query, suggestions, selectedCoords, search, select, clear }
}
