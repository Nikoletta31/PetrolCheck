// STUB — implementation owned by Anouar (src/composables/useStations.js)
// Replace this file with the real API implementation.
import { ref, computed } from 'vue'

function makeStations(centerLat, centerLng) {
  return [
    {
      id: 'S001',
      nom: 'Total Energies Express',
      adresse: '14 Avenue de la République',
      ville: 'Paris',
      lat: centerLat + 0.012,
      lng: centerLng - 0.008,
      maj: '2024-04-15T09:30:00',
      carburants: [
        { type: 'SP95',   prix: 1.769, dispo: true },
        { type: 'SP98',   prix: 1.849, dispo: true },
        { type: 'Gazole', prix: 1.689, dispo: true },
        { type: 'E85',    prix: 0.899, dispo: true },
      ],
    },
    {
      id: 'S002',
      nom: 'BP Station Centrale',
      adresse: '3 Rue du Commerce',
      ville: 'Paris',
      lat: centerLat - 0.005,
      lng: centerLng + 0.015,
      maj: '2024-04-14T18:00:00',
      carburants: [
        { type: 'SP95',   prix: 1.799, dispo: true },
        { type: 'SP98',   prix: 1.879, dispo: true },
        { type: 'Gazole', prix: 1.659, dispo: true },
        { type: 'GPLc',   prix: 0.979, dispo: true },
      ],
    },
    {
      id: 'S003',
      nom: 'Esso Leclerc',
      adresse: '88 Boulevard Voltaire',
      ville: 'Paris',
      lat: centerLat + 0.022,
      lng: centerLng + 0.009,
      maj: '2024-04-15T07:15:00',
      carburants: [
        { type: 'SP95',   prix: 1.739, dispo: true },
        { type: 'Gazole', prix: 1.629, dispo: true },
        { type: 'E85',    prix: 0.879, dispo: true },
        { type: 'SP98',   prix: null,  dispo: false },
      ],
    },
    {
      id: 'S004',
      nom: 'Shell Autoroute A6',
      adresse: 'Aire de repos Nord',
      ville: 'Paris',
      lat: centerLat - 0.018,
      lng: centerLng - 0.020,
      maj: '2024-04-13T11:00:00',
      carburants: [
        { type: 'SP95',   prix: 1.849, dispo: true },
        { type: 'SP98',   prix: 1.929, dispo: true },
        { type: 'Gazole', prix: 1.779, dispo: true },
      ],
    },
    {
      id: 'S005',
      nom: 'Intermarché Carbu',
      adresse: '55 Rue de la Paix',
      ville: 'Paris',
      lat: centerLat + 0.007,
      lng: centerLng + 0.028,
      maj: '2024-04-15T06:00:00',
      carburants: [
        { type: 'SP95',   prix: 1.719, dispo: true },
        { type: 'Gazole', prix: 1.609, dispo: true },
        { type: 'GPLc',   prix: 0.959, dispo: true },
        { type: 'E85',    prix: 0.859, dispo: false },
      ],
    },
    {
      id: 'S006',
      nom: 'Carrefour Market Fuel',
      adresse: '2 Place de la Nation',
      ville: 'Paris',
      lat: centerLat - 0.030,
      lng: centerLng + 0.005,
      maj: '2024-04-14T20:00:00',
      carburants: [
        { type: 'SP95',   prix: 1.729, dispo: true },
        { type: 'SP98',   prix: 1.809, dispo: true },
        { type: 'Gazole', prix: 1.619, dispo: true },
      ],
    },
  ]
}

export function useStations() {
  const stations = ref([])
  const loading = ref(false)
  const error = ref(null)

  const topCheap = computed(() => {
    if (!stations.value.length) return []

    // Find lowest Gazole price across stations that have it available
    const withGazole = stations.value
      .map(s => ({
        id: s.id,
        prix: s.carburants.find(c => c.type === 'Gazole' && c.dispo && c.prix != null)?.prix ?? Infinity,
      }))
      .sort((a, b) => a.prix - b.prix)

    return withGazole.slice(0, 3).map(s => s.id)
  })

  function go(coords) {
    loading.value = true
    error.value = null

    // Simulate a short network delay
    setTimeout(() => {
      stations.value = makeStations(coords.lat, coords.lng)
      loading.value = false
    }, 600)
  }

  return { stations, topCheap, loading, error, go }
}
