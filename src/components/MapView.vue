<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet.markercluster'

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
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select-station'])

const mapContainer = ref(null)
let map = null
let clusterGroup = null

function createMarkerIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px; height:14px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 1px 4px rgba(0,0,0,0.3)
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  })
}

const BLUE = '#378ADD'
const GREEN = '#1D9E75'

function clearMarkers() {
  if (clusterGroup) {
    clusterGroup.clearLayers()
  }
}

function addMarkers(stations) {
  if (!map || !clusterGroup) return

  stations.forEach((station) => {
    if (station.lat == null || station.lng == null) return

    const isCheap = props.topCheap.includes(station.id)
    const icon = createMarkerIcon(isCheap ? GREEN : BLUE)

    const marker = L.marker([station.lat, station.lng], { icon })
    marker.on('click', () => emit('select-station', station))
    clusterGroup.addLayer(marker)
  })

  if (stations.length > 0) {
    try {
      map.fitBounds(clusterGroup.getBounds(), { padding: [40, 40], maxZoom: 14 })
    } catch {
      // getBounds can throw if all markers are at same point
    }
  }
}

onMounted(() => {
  map = L.map(mapContainer.value, {
    center: [46.5, 2.35],
    zoom: 6,
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

// Re-render markers when topCheap changes (update colors)
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
