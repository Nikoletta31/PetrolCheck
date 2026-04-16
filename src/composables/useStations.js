import { ref, computed } from "vue";
import { fetchStations } from "../services/stationsAPI.js";
import {
  mapApiRecordToStation,
  findTopCheapStations,
  filterStationsByFuelTypes,
} from "../services/filters.js";
import { FUEL_TYPES } from "../config/constants.js";

export function useStations() {
  const stations = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const primaryFuel = ref(FUEL_TYPES[0]);

  const topCheap = computed(() => {
    return findTopCheapStations(stations.value, primaryFuel.value);
  });

  async function go(coords, filters) {
    if (!coords) {
      error.value = "No coordinates provided";
      return;
    }

    loading.value = true;
    error.value = null;
    stations.value = [];

    try {
      const records = await fetchStations({
        lat: coords.lat,
        lng: coords.lng,
        radius: filters.rayon,
        fuelTypes: filters.carburants,
      });

      let mapped = records.map(mapApiRecordToStation);

      mapped = filterStationsByFuelTypes(mapped, filters.carburants);

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

  return { stations, topCheap, loading, error, go };
}
