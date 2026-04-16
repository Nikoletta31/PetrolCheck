import { reactive } from 'vue'
import { DEFAULT_RADIUS, MAX_PRIX_DEFAULT } from '../config/constants.js'

export function useFilters() {
  const filters = reactive({
    carburants: [],
    rayon: DEFAULT_RADIUS,
    maxPrix: MAX_PRIX_DEFAULT,
  })

  function toggleCarburant(type) {
    const idx = filters.carburants.indexOf(type)
    if (idx === -1) {
      filters.carburants.push(type)
    } else {
      filters.carburants.splice(idx, 1)
    }
  }

  function setRayon(rayon) {
    filters.rayon = rayon
  }

  // prix: number (e.g. 1.9) or null to remove the filter
  function setMaxPrix(prix) {
    filters.maxPrix = prix
  }

  function reset() {
    filters.carburants = []
    filters.rayon = DEFAULT_RADIUS
    filters.maxPrix = MAX_PRIX_DEFAULT
  }

  return { filters, toggleCarburant, setRayon, setMaxPrix, reset }
}
