import {
  FUEL_TYPES,
  FUEL_FIELD_MAP,
  TOP_CHEAP_COUNT,
} from "../config/constants.js";

export function mapApiRecordToStation(record) {
  const carburants = buildCarburantsArray(record);
  const maj = deriveMajDate(record);

  console.log(record, "record");

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

export function findTopCheapStations(stations, primaryFuel) {
  const priced = stations
    .filter((station) => {
      const fuel = station.carburants.find((c) => c.type === primaryFuel);
      return fuel && fuel.dispo && fuel.prix != null;
    })
    .sort((a, b) => {
      const priceA = a.carburants.find((c) => c.type === primaryFuel).prix;
      const priceB = b.carburants.find((c) => c.type === primaryFuel).prix;
      return priceA - priceB;
    });

  return new Set(priced.slice(0, TOP_CHEAP_COUNT).map((s) => s.id));
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
