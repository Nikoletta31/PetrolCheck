<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet.markercluster'
import { FRANCE_CENTER, FRANCE_ZOOM } from '../config/constants.js'

const props = defineProps({
  stations: {
    type: Array,
    default: () => []
  },
  center: {
    type: Object,
    default: null
  },
  topCheap: {
    type: Object,
    default: () => new Map()
  },
  focusStation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select-station'])

const mapContainer = ref(null)
let map = null
let clusterGroup = null

const BLUE = '#378ADD'
const GREEN = '#1D9E75'

function createMarkerIcon(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <filter id="s" x="-30%" y="-10%" width="160%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
      </filter>
      <path d="M14 2 C7.373 2 2 7.373 2 14 C2 22 14 34 14 34 C14 34 26 22 26 14 C26 7.373 20.627 2 14 2 Z"
            fill="${color}" filter="url(#s)"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.95"/>
      <path d="M14 9.5 C14 9.5 10.5 13.5 10.5 15.5 C10.5 17.433 12.067 19 14 19 C15.933 19 17.5 17.433 17.5 15.5 C17.5 13.5 14 9.5 14 9.5 Z"
            fill="${color}"/>
    </svg>`
  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -34]
  })
}

function createRankedMarkerIcon(color, rank) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <filter id="sr${rank}" x="-30%" y="-10%" width="160%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
      <path d="M14 2 C7.373 2 2 7.373 2 14 C2 22 14 34 14 34 C14 34 26 22 26 14 C26 7.373 20.627 2 14 2 Z"
            fill="${color}" filter="url(#sr${rank})"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.95"/>
      <path d="M14 9.5 C14 9.5 10.5 13.5 10.5 15.5 C10.5 17.433 12.067 19 14 19 C15.933 19 17.5 17.433 17.5 15.5 C17.5 13.5 14 9.5 14 9.5 Z"
            fill="${color}"/>
      <circle cx="25" cy="7" r="7" fill="${color}" stroke="white" stroke-width="1.5"/>
      <text x="25" y="11" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="sans-serif">${rank}</text>
    </svg>`
  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [32, 40],
    iconAnchor: [14, 38],
    popupAnchor: [0, -38]
  })
}

function clearMarkers() {
  if (clusterGroup) {
    clusterGroup.clearLayers()
  }
}

function addMarkers(stations) {
  if (!map || !clusterGroup) return

  const validStations = stations.filter(s => s.lat != null && s.lng != null)

  validStations.forEach((station) => {
    const rank = props.topCheap.get(station.id)
    let icon
    if (rank) {
      icon = createRankedMarkerIcon(GREEN, rank)
    } else {
      icon = createMarkerIcon(BLUE)
    }
    const marker = L.marker([station.lat, station.lng], { icon })
    marker.on('click', () => emit('select-station', station))
    clusterGroup.addLayer(marker)
  })

  if (validStations.length > 0) {
    const bounds = L.latLngBounds(validStations.map(s => [s.lat, s.lng]))
    map.stop()
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
  }
}

onMounted(() => {
  map = L.map(mapContainer.value, {
    center: [FRANCE_CENTER.lat, FRANCE_CENTER.lng],
    zoom: FRANCE_ZOOM,
    zoomControl: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map)

  clusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 40
  })
  map.addLayer(clusterGroup)
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

watch(
  () => props.stations,
  (newStations) => {
    clearMarkers()
    if (newStations && newStations.length > 0) {
      addMarkers(newStations)
    }
  },
  { deep: true }
)

watch(
  () => props.center,
  (coords) => {
    if (coords && map) {
      map.flyTo([coords.lat, coords.lng], 13, { duration: 1 })
    }
  }
)

watch(
  () => props.focusStation,
  (station) => {
    if (station && map) {
      map.flyTo([station.lat, station.lng], 16, { duration: 1 })
    }
  }
)

watch(
  () => props.topCheap,
  () => {
    clearMarkers()
    if (props.stations && props.stations.length > 0) {
      addMarkers(props.stations)
    }
  }
)
</script>

<template>
  <div ref="mapContainer" class="map-view" />
</template>

<style scoped>
.map-view {
  flex: 1;
  width: 100%;
  min-height: 0;
}
</style>
