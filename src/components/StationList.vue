<script setup>
import { ref, computed } from 'vue'
import { computeDistance } from '../services/filters.js'

const props = defineProps({
  stations: {
    type: Array,
    default: () => []
  },
  topCheap: {
    type: Object,
    default: () => new Map()
  },
  primaryFuel: {
    type: String,
    default: 'SP95'
  },
  searchCoords: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select-station'])

const collapsed = ref(false)

const visibleStations = computed(() => {
  return props.stations.filter(s => {
    const fuel = s.carburants.find(c => c.type === props.primaryFuel)
    return fuel && fuel.dispo && fuel.prix != null
  }).slice(0, 20)
})

function formatDistance(station) {
  if (!props.searchCoords) return ''
  const dist = computeDistance(
    props.searchCoords.lat,
    props.searchCoords.lng,
    station.lat,
    station.lng
  )
  if (dist < 1) {
    return `${Math.round(dist * 1000)} m`
  }
  return `${dist.toFixed(1)} km`
}

function formatPrice(station) {
  const fuel = station.carburants.find(c => c.type === props.primaryFuel)
  if (!fuel || fuel.prix == null) return '—'
  return Number(fuel.prix).toFixed(3)
}

function getRank(station) {
  return props.topCheap.get(station.id) || null
}

function onSelect(station) {
  emit('select-station', station)
}

function toggleCollapse() {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <div v-if="stations.length > 0" class="station-list" :class="{ 'station-list--collapsed': collapsed }">
    <button class="station-list__toggle" @click="toggleCollapse">
      <span>
        {{ collapsed ? `${stations.length} stations` : 'Masquer' }}
      </span>
      <svg class="station-list__chevron" :class="{ 'station-list__chevron--rotated': collapsed }"
        xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" />
      </svg>
    </button>

    <div v-show="!collapsed" class="station-list__body">
      <div v-for="station in visibleStations" :key="station.id" class="station-item"
        @click="onSelect(station)">
        <div v-if="getRank(station)" class="station-item__rank">
          {{ getRank(station) }}
        </div>
        <div class="station-item__info">
          <div class="station-item__name">{{ station.nom }}</div>
          <div class="station-item__address">{{ station.ville }}</div>
          <div class="station-item__meta">
            <span class="station-item__distance">{{ formatDistance(station) }}</span>
            <span class="station-item__price">{{ formatPrice(station) }} €</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.station-list {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  width: 300px;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  transition: transform 300ms ease;
}

.station-list--collapsed {
  width: auto;
}

.station-list__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-surface);
  border: none;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  white-space: nowrap;
}

.station-list__chevron {
  transition: transform 200ms ease;
}

.station-list__chevron--rotated {
  transform: rotate(-90deg);
}

.station-list__body {
  flex: 1;
  overflow-y: auto;
}

.station-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 150ms ease;
}

.station-item:hover {
  background: var(--color-bg);
}

.station-item__rank {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-accent);
  color: white;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.station-item__info {
  flex: 1;
  min-width: 0;
}

.station-item__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.station-item__address {
  font-size: 11px;
  color: var(--color-muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.station-item__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.station-item__distance {
  font-size: 11px;
  color: var(--color-muted);
}

.station-item__price {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-accent);
}

@media (max-width: 767px) {
  .station-list {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 50vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .station-list--collapsed {
    width: 100%;
  }
}
</style>
