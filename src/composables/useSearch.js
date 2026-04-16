// STUB — implementation owned by Anouar (src/composables/useSearch.js)
// Replace this file with the real geocoding implementation.
import { ref } from 'vue'

const FAKE_SUGGESTIONS = [
  { label: '12 Rue de Rivoli, Paris 75001', lat: 48.856, lng: 2.347 },
  { label: 'Place Bellecour, Lyon 69002', lat: 45.7578, lng: 4.8320 },
  { label: 'La Canebière, Marseille 13001', lat: 43.2965, lng: 5.3818 },
  { label: 'Place du Capitole, Toulouse 31000', lat: 43.6047, lng: 1.4442 },
  { label: 'Rue Sainte-Catherine, Bordeaux 33000', lat: 44.8378, lng: -0.5792 },
]

export function useSearch() {
  const query = ref('')
  const suggestions = ref([])
  const selectedCoords = ref(null)

  function search(queryString) {
    // FAKE: filter suggestions by typed text
    const q = queryString.toLowerCase()
    suggestions.value = FAKE_SUGGESTIONS.filter(s =>
      s.label.toLowerCase().includes(q)
    )
  }

  function select(suggestion) {
    selectedCoords.value = { lat: suggestion.lat, lng: suggestion.lng }
  }

  return { query, suggestions, selectedCoords, search, select }
}
