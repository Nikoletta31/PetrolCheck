<script setup>
import { ref } from 'vue'
import SearchForm from '@/components/SearchForm.vue'
import MapView from '@/components/MapView.vue'
import StationPopup from '@/components/StationPopup.vue'
import StationList from '@/components/StationList.vue'
import { useStations } from '@/composables/useStations.js'

const { stations, topCheap, sortedStations, primaryFuel, searchCoords, loading, error, go } = useStations()

const mapCenter = ref(null)
const selectedStation = ref(null)
const focusStation = ref(null)

function onSearch({ coords, filters }) {
  mapCenter.value = coords
  selectedStation.value = null
  focusStation.value = null
  go(coords, filters)
}

function onSelectStation(station) {
  selectedStation.value = station
  focusStation.value = station
}

function onClosePopup() {
  selectedStation.value = null
}
</script>

<template>
  <div class="app-layout">
    <SearchForm @go="onSearch" />

    <Transition name="fade">
      <div v-if="loading" class="app-banner app-banner--loading">
        <span class="spinner" />
        <span>Recherche en cours…</span>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="error" class="app-banner app-banner--error">
        {{ error }}
      </div>
    </Transition>

    <div class="map-container">
      <StationList
        :stations="sortedStations"
        :top-cheap="topCheap"
        :primary-fuel="primaryFuel"
        :search-coords="searchCoords"
        @select-station="onSelectStation"
      />

      <MapView
        :stations="stations"
        :center="mapCenter"
        :top-cheap="topCheap"
        :focus-station="focusStation"
        @select-station="onSelectStation"
      />
    </div>

    <StationPopup
      :station="selectedStation"
      @close="onClosePopup"
    />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
}

.map-container {
  flex: 1;
  position: relative;
  min-height: 0;
}

.app-banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
}

.app-banner--loading {
  background-color: var(--color-accent);
  color: #fff;
}

.app-banner--error {
  background-color: #fff3f3;
  color: var(--color-rupture);
  border-bottom: 1px solid rgba(229, 62, 62, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
