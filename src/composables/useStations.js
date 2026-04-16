import { ref, computed } from "vue";
import { fetchStations } from "../services/stationsAPI.js";
import {
  mapApiRecordToStation,
  findTopCheapStations,
  sortStationsByPriceAndDistance,
  filterStationsByFuelTypes,
  filterStationsByMaxPrix,
} from "../services/filters.js";
import { FUEL_TYPES } from "../config/constants.js";

export function useStations() {
  const stations = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const primaryFuel = ref(FUEL_TYPES[0]);
  const searchCoords = ref(null);

  const topCheap = computed(() => {
    return findTopCheapStations(
      stations.value,
      primaryFuel.value,
      searchCoords.value?.lat,
      searchCoords.value?.lng,
    );
  });

  const sortedStations = computed(() => {
    return sortStationsByPriceAndDistance(
      stations.value,
      primaryFuel.value,
      searchCoords.value?.lat,
      searchCoords.value?.lng,
    );
  });

  async function go(coords, filters) {
    if (!coords) {
      error.value = "No coordinates provided";
      return;
    }

    searchCoords.value = coords;
    loading.value = true;
    error.value = null;
    stations.value = [];

    try {
      const records = await fetchStations({
        lat: coords.lat,
        lng: coords.lng,
        radius: filters.rayon,
        fuelTypes: filters.carburants,
        maxPrix: filters.maxPrix,
      });

      let mapped = records.map(mapApiRecordToStation);

      mapped = filterStationsByFuelTypes(mapped, filters.carburants);
      mapped = filterStationsByMaxPrix(mapped, filters.maxPrix, filters.carburants);

      if (filters.carburants && filters.carburants.length > 0) {
        primaryFuel.value = filters.carburants[0];
      } else {
        primaryFuel.value = FUEL_TYPES[0];
      }

      stations.value = mapped;
    } catch (err) {
      console.error("Stations fetch error:", err);
      error.value = err.message || "Failed to fetch stations";
    } finally {
      loading.value = false;
    }
  }

  return { stations, topCheap, sortedStations, primaryFuel, searchCoords, loading, error, go };
}
