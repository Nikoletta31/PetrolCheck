import {
  FUEL_TYPES,
  FUEL_FIELD_MAP,
  TOP_CHEAP_COUNT,
} from "../config/constants.js";

export function mapApiRecordToStation(record) {
  const carburants = buildCarburantsArray(record);
  const maj = deriveMajDate(record);

  return {
    id: record.id,
    nom: `Station #${record.id}`,
    adresse: record.adresse || "",
    ville: record.ville || "",
    lat: record.geom.lat,
    lng: record.geom.lon,
    maj,
    carburants,
  };
}

export function buildCarburantsArray(record) {
  return FUEL_TYPES.map((type) => {
    const prefix = FUEL_FIELD_MAP[type];
    const prix = record[`${prefix}_prix`];
    const maj = record[`${prefix}_maj`];
    const dispo = prix != null;

    return {
      type,
      prix: dispo ? prix : null,
      dispo,
      maj: dispo ? maj : null,
    };
  });
}

export function deriveMajDate(record) {
  let latestDate = null;

  for (const type of FUEL_TYPES) {
    const prefix = FUEL_FIELD_MAP[type];
    const maj = record[`${prefix}_maj`];
    if (maj) {
      if (!latestDate || maj > latestDate) {
        latestDate = maj;
      }
    }
  }

  return latestDate;
}

// Haversine distance in km between two lat/lng points
export function computeDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Sort stations by primaryFuel price ASC, then distance from center ASC.
// Stations without the primary fuel available are pushed to the end.
export function sortStationsByPriceAndDistance(
  stations,
  primaryFuel,
  centerLat,
  centerLng,
) {
  const hasCenter = centerLat != null && centerLng != null;

  return [...stations].sort((a, b) => {
    const fuelA = a.carburants.find((c) => c.type === primaryFuel);
    const fuelB = b.carburants.find((c) => c.type === primaryFuel);

    const priceA =
      fuelA?.dispo && fuelA?.prix != null ? fuelA.prix : Infinity;
    const priceB =
      fuelB?.dispo && fuelB?.prix != null ? fuelB.prix : Infinity;

    if (priceA !== priceB) return priceA - priceB;

    if (hasCenter) {
      return (
        computeDistance(centerLat, centerLng, a.lat, a.lng) -
        computeDistance(centerLat, centerLng, b.lat, b.lng)
      );
    }

    return 0;
  });
}

// Returns Map<stationId, rank> for the top N cheapest+closest stations.
// rank is 1-indexed. Use .has(id) to check membership, .get(id) for the rank.
export function findTopCheapStations(
  stations,
  primaryFuel,
  centerLat,
  centerLng,
) {
  const eligible = sortStationsByPriceAndDistance(
    stations,
    primaryFuel,
    centerLat,
    centerLng,
  ).filter((s) => {
    const fuel = s.carburants.find((c) => c.type === primaryFuel);
    return fuel && fuel.dispo && fuel.prix != null;
  });

  const result = new Map();
  eligible.slice(0, TOP_CHEAP_COUNT).forEach((s, i) => {
    result.set(s.id, i + 1);
  });
  return result;
}

export function filterStationsByFuelTypes(stations, fuelTypes) {
  if (!fuelTypes || fuelTypes.length === 0) {
    return stations;
  }

  return stations.filter((station) => {
    return station.carburants.some(
      (c) => c.dispo && fuelTypes.includes(c.type),
    );
  });
}

// Client-side safety net — mirrors the server-side price clause in stationsAPI.js.
// Keeps stations where at least one relevant fuel has a price <= maxPrix.
export function filterStationsByMaxPrix(stations, maxPrix, fuelTypes) {
  if (maxPrix == null) return stations;

  return stations.filter((station) => {
    const candidates =
      fuelTypes && fuelTypes.length > 0
        ? station.carburants.filter((c) => fuelTypes.includes(c.type))
        : station.carburants;

    return candidates.some(
      (c) => c.dispo && c.prix != null && c.prix <= maxPrix,
    );
  });
}
