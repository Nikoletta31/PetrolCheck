import { reactive } from 'vue'
import { DEFAULT_RADIUS } from '../config/constants.js'

export function useFilters() {
  const filters = reactive({
    carburants: [],
    rayon: DEFAULT_RADIUS,
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

  function reset() {
    filters.carburants = []
    filters.rayon = DEFAULT_RADIUS
  }

  return { filters, toggleCarburant, setRayon, reset }
}
