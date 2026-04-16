# Guide d'intégration — Partie Frontend (Nika)

## Vue d'ensemble

La partie backend (services + composables) est implémentée. Ce document explique comment consommer ces modules pour construire l'interface utilisateur.

---

## Architecture des fichiers

```
src/
├── config/
│   └── constants.js              ← Constantes (URLs, carburants, rayon)
├── services/
│   ├── geocodeAPI.js             ← Appel API adresse (ne pas toucher)
│   ├── stationsAPI.js            ← Appel API carburant (ne pas toucher)
│   └── filters.js                ← Transformation + tri + distance
├── composables/
│   ├── useSearch.js              ← À consommer pour le formulaire
│   ├── useFilters.js             ← À consommer pour les filtres
│   └── useStations.js            ← À consommer pour la carte + liste
└── components/
    ├── SearchForm.vue            ← Formulaire adresse + filtres + bouton GO
    ├── MapView.vue               ← Carte Leaflet avec markers
    ├── StationList.vue           ← Liste triée des stations (prix + distance)
    └── StationPopup.vue          ← Détail d'une station
```

**Règle** : Ne pas modifier `services/` ni `composables/`. L'interface entre les deux parties, ce sont les composables.

---

## 1. Formulaire de recherche — `useSearch()`

### Import

```js
import { useSearch } from './composables/useSearch.js'
```

### API

```js
const { query, suggestions, selectedCoords, search, select, clear } = useSearch()
```

| Variable / Fonction | Type | Description |
|---|---|---|
| `query` | `ref<string>` | Texte saisi par l'utilisateur dans le champ adresse |
| `suggestions` | `ref<Array<{label, lat, lng}>>` | Résultats d'autocomplétion (vide si < 3 caractères) |
| `selectedCoords` | `ref<{lat, lng} \| null>` | Coordonnées GPS après sélection d'une suggestion |
| `search(q)` | `function` | À appeler à chaque frappe (debounce intégré de 300ms) |
| `select(suggestion)` | `function` | À appeler quand l'utilisateur clique sur une suggestion |
| `clear()` | `function` | Réinitialise tout (query, suggestions, coords) |

### Exemple d'utilisation dans un composant

```vue
<script setup>
import { useSearch } from '../composables/useSearch.js'

const { query, suggestions, selectedCoords, search, select, clear } = useSearch()
</script>

<template>
  <div class="search-form">
    <input
      v-model="query"
      @input="search(query)"
      placeholder="Saisir une adresse..."
      type="text"
    />

    <ul v-if="suggestions.length">
      <li v-for="s in suggestions" :key="s.label" @click="select(s)">
        {{ s.label }}
      </li>
    </ul>
  </div>
</template>
```

### Notes importantes

- Le **debounce est déjà géré** dans le composable (300ms). Pas besoin de le réimplémenter.
- Les suggestions apparaissent uniquement à partir de **3 caractères**.
- `selectedCoords` est `null` tant que l'utilisateur n'a pas cliqué sur une suggestion.
- `suggestions` est un array d'objets : `{ label: string, lat: number, lng: number }`.

---

## 2. Filtres — `useFilters()`

### Import

```js
import { useFilters } from './composables/useFilters.js'
```

### API

```js
const { filters, toggleCarburant, setRayon, reset } = useFilters()
```

| Variable / Fonction | Type | Description |
|---|---|---|
| `filters` | `reactive<{ carburants: string[], rayon: number }>` | État des filtres |
| `toggleCarburant(type)` | `function` | Ajoute/retire un carburant de la sélection |
| `setRayon(km)` | `function` | Change le rayon de recherche |
| `reset()` | `function` | Réinitialise les filtres (carburants vides, rayon 10km) |

### Types de carburants disponibles

Les valeurs à passer à `toggleCarburant()` sont :

```
'SP95', 'SP98', 'Gazole', 'E85', 'GPLc', 'E10'
```

### Rayons disponibles

```
5, 10, 20, 50  (en km)
```

### Exemple d'utilisation

```vue
<script setup>
import { useFilters } from '../composables/useFilters.js'
import { FUEL_TYPES, RADIUS_OPTIONS } from '../config/constants.js'

const { filters, toggleCarburant, setRayon, reset } = useFilters()
</script>

<template>
  <div class="filters">
    <div class="fuel-checklist">
      <label v-for="fuel in FUEL_TYPES" :key="fuel">
        <input
          type="checkbox"
          :checked="filters.carburants.includes(fuel)"
          @change="toggleCarburant(fuel)"
        />
        {{ fuel }}
      </label>
    </div>

    <select :value="filters.rayon" @change="setRayon(Number($event.target.value))">
      <option v-for="r in RADIUS_OPTIONS" :key="r" :value="r">
        {{ r }} km
      </option>
    </select>
  </div>
</template>
```

### Notes importantes

- `filters.carburants` est un **array vide par défaut** → signifie "tous les carburants".
- Si l'array est vide, l'API ne filtre pas par carburant (retourne toutes les stations du rayon).
- `filters.rayon` vaut **10 par défaut**.

---

## 3. Carte et stations — `useStations()`

### Import

```js
import { useStations } from './composables/useStations.js'
```

### API

```js
const { stations, topCheap, sortedStations, primaryFuel, searchCoords, loading, error, go } = useStations()
```

| Variable / Fonction | Type | Description |
|---|---|---|
| `stations` | `ref<Station[]>` | Liste des stations trouvées (non triées) |
| `topCheap` | `computed<Map<number, number>>` | Map `id → rank` des 3 stations les moins chères (ex: `.get(id)` retourne 1, 2 ou 3) |
| `sortedStations` | `computed<Station[]>` | Stations triées par prix ASC puis distance ASC |
| `primaryFuel` | `ref<string>` | Carburant de référence pour le classement (ex: `'SP95'`) |
| `searchCoords` | `ref<{lat, lng} \| null>` | Coordonnées du centre de recherche (utilisées pour le calcul de distance) |
| `loading` | `ref<boolean>` | `true` pendant la requête |
| `error` | `ref<string \| null>` | Message d'erreur si la requête échoue |
| `go(coords, filters)` | `function` | Déclenche la recherche |

### Exemple d'utilisation

```vue
<script setup>
import { useSearch } from '../composables/useSearch.js'
import { useFilters } from '../composables/useFilters.js'
import { useStations } from '../composables/useStations.js'

const { selectedCoords } = useSearch()
const { filters } = useFilters()
const { stations, topCheap, sortedStations, primaryFuel, searchCoords, loading, error, go } = useStations()

function handleGo() {
  if (selectedCoords.value) {
    go(selectedCoords.value, filters)
  }
}
</script>

<template>
  <button @click="handleGo" :disabled="!selectedCoords">
    GO
  </button>

  <div v-if="loading">Chargement...</div>
  <div v-if="error">{{ error }}</div>

  <!-- Liste triée avec classement -->
  <div v-for="station in sortedStations" :key="station.id">
    <div v-if="topCheap.has(station.id)" class="rank-badge">
      #{{ topCheap.get(station.id) }}
    </div>
    {{ station.nom }} — {{ station.ville }}
  </div>

  <!-- Carte avec markers -->
  <MapView
    :stations="stations"
    :top-cheap="topCheap"
    @select-station="onSelectStation"
  />
</template>
```

### Notes importantes

- `go()` **ne fait rien** si `coords` est `null` ou `undefined`.
- `topCheap` est une **Map** → utiliser `topCheap.has(station.id)` pour vérifier l'appartenance, `topCheap.get(station.id)` pour obtenir le rang (1, 2 ou 3).
- `sortedStations` contient **toutes** les stations triées par prix du carburant principal ASC, puis distance ASC (les stations sans le carburant principal sont en fin de liste).
- `primaryFuel` est le **premier de `filters.carburants`**, ou `SP95` si aucun filtre.
- `searchCoords` est automatiquement renseigné quand `go()` est appelé — sert à calculer les distances dans `sortedStations`.
- `loading` passe à `true` au début de la requête, `false` à la fin (succès ou erreur).
- `error` est `null` en cas de succès.

---

## 4. Liste des stations — `StationList.vue`

### Import

```vue
<script setup>
import StationList from '@/components/StationList.vue'
</script>
```

### Props

| Prop | Type | Description |
|---|---|---|
| `stations` | `Station[]` | Liste triée des stations (passer `sortedStations`) |
| `topCheap` | `Map<number, number>` | Map des rangons (passer `topCheap`) |
| `primaryFuel` | `string` | Carburant de référence (passer `primaryFuel`) |
| `searchCoords` | `{lat, lng} \| null` | Centre de recherche pour le calcul de distance |

### Events

| Event | Payload | Description |
|---|---|---|
| `select-station` | `Station` | Émis quand l'utilisateur clique sur une station dans la liste |

### Comportement

- **Desktop** : panneau latéral gauche de 300px, superposé à la carte
- **Mobile** : panneau en bas de l'écran (bottom sheet), hauteur max 50vh
- **Collapsible** : un bouton toggle permet de réduire/agrandir le panneau
- **Classement visuel** : les 3 stations les moins chères ont un badge numéroté (1, 2, 3)
- **Clic** : émet `select-station` → le parent doit centrer la carte et ouvrir le popup

### Exemple d'utilisation

```vue
<template>
  <div class="map-container">
    <StationList
      :stations="sortedStations"
      :top-cheap="topCheap"
      :primary-fuel="primaryFuel"
      :search-coords="searchCoords"
      @select-station="onSelectStation"
    />
    <MapView :stations="stations" :top-cheap="topCheap" @select-station="onSelectStation" />
  </div>
</template>
```

---

## 5. Carte — `MapView.vue`

### Props ajoutées

| Prop | Type | Description |
|---|---|---|
| `stations` | `Station[]` | Liste des stations à afficher |
| `center` | `{lat, lng} \| null` | Centre de la carte après recherche (zoom 13) |
| `topCheap` | `Map<number, number>` | Map des rangons pour les markers numérotés |
| `focusStation` | `Station \| null` | Station sur laquelle zoomer (zoom 16) |

### Events

| Event | Payload | Description |
|---|---|---|
| `select-station` | `Station` | Émis quand l'utilisateur clique sur un marker |

### Markers

- **Station normale** : marker bleu avec goutte de carburant
- **Top 3 pas chères** : marker vert avec badge numéroté (1, 2, 3) en haut à droite
- Le numéro correspond au rang dans `topCheap.get(station.id)`

### focusStation

Quand `focusStation` change, la carte fait un `flyTo` sur la station avec zoom 16. À utiliser quand l'utilisateur clique sur une station dans la liste `StationList`.

### Exemple d'utilisation

```vue
<template>
  <MapView
    :stations="stations"
    :center="mapCenter"
    :top-cheap="topCheap"
    :focus-station="focusStation"
    @select-station="onSelectStation"
  />
</template>
```

---

## 6. Fonctions utilitaires — `filters.js`

### Import

```js
import {
  computeDistance,
  sortStationsByPriceAndDistance,
  findTopCheapStations,
} from '@/services/filters.js'
```

### `computeDistance(lat1, lng1, lat2, lng2)`

Retourne la distance en **km** entre deux points (formule Haversine).

### `sortStationsByPriceAndDistance(stations, primaryFuel, centerLat, centerLng)`

Retourne les stations triées par **prix ASC** du carburant principal, puis **distance ASC** en cas d'égalité. Les stations sans le carburant principal sont poussées en fin de liste.

### `findTopCheapStations(stations, primaryFuel, centerLat, centerLng)`

Retourne une **Map<id, rank>** des N stations les moins chères (N = `TOP_CHEAP_COUNT`). Le rank est 1-indexé.

---

## 7. Constantes utiles

### Import

```js
import {
  FUEL_TYPES,
  RADIUS_OPTIONS,
  DEFAULT_RADIUS,
  FRANCE_CENTER,
  FRANCE_ZOOM,
} from '../config/constants.js'
```

| Constante | Valeur | Utilisation |
|---|---|---|
| `FUEL_TYPES` | `['SP95', 'SP98', 'Gazole', 'E85', 'GPLc', 'E10']` | Générer la checklist |
| `RADIUS_OPTIONS` | `[5, 10, 20, 50]` | Générer le select de rayon |
| `DEFAULT_RADIUS` | `10` | Valeur par défaut du rayon |
| `FRANCE_CENTER` | `{ lat: 46.603354, lng: 1.888334 }` | Centrer la carte au chargement |
| `FRANCE_ZOOM` | `6` | Zoom initial de la carte |

---

## 8. Flow complet attendu

```
1. L'utilisateur tape une adresse
   → search() est appelé à chaque frappe (debounce 300ms)
   → suggestions se met à jour

2. L'utilisateur clique sur une suggestion
   → select(suggestion) est appelé
   → selectedCoords est mis à jour
   → query affiche le label complet

3. L'utilisateur coche/décoche des carburants
   → toggleCarburant(fuel) est appelé
   → filters.carburants est mis à jour

4. L'utilisateur change le rayon
   → setRayon(km) est appelé
   → filters.rayon est mis à jour

5. L'utilisateur clique sur GO
   → go(selectedCoords, filters) est appelé
   → searchCoords est enregistré
   → loading = true
   → Les APIs sont appelées
   → stations, sortedStations et topCheap sont mis à jour
   → loading = false

6. La carte affiche les markers
   → Pour chaque station dans stations : marker à (lat, lng)
   → Si topCheap.has(station.id) : marker vert avec numéro (1, 2, 3)
   → Sinon : marker bleu classique

7. La liste StationList s'affiche
   → Stations triées par prix ASC, puis distance ASC
   → Les 3 premières ont un badge numéroté
   → Chaque ligne montre : rang, nom, ville, distance, prix

8. L'utilisateur clique sur un marker ou une ligne de la liste
   → La carte fait un flyTo sur la station (zoom 16)
   → Le popup StationPopup s'ouvre avec les détails
```

---

## 9. Cas d'erreur à gérer côté UI

| Situation | Comment détecter | Suggestion UI |
|---|---|---|
| Aucune adresse trouvée | `suggestions` vide après saisie | "Aucune adresse trouvée" |
| Erreur API stations | `error` non-null dans useStations | Afficher `error` |
| Aucune station dans le rayon | `stations` vide après GO | "Aucune station dans ce rayon" |
| Rate limit atteint | `error` contient "429" ou message | "Trop de requêtes, réessayez plus tard" |
| GO cliqué sans adresse | `selectedCoords` est `null` | Désactiver le bouton GO |

---

## 10. Dépendances à installer

Si pas encore fait :

```bash
npm install leaflet leaflet.markercluster
```

Et ajouter dans le CSS global (ex: `main.js` ou `index.html`) :

```js
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
```

---

## 11. Questions en suspens

Voir `TODO-BACKEND.md` pour la liste complète des questions ouvertes, notamment :

- **Nom de station** : Affiché comme `Station #<id>` pour l'instant
- **Formatage des dates** : ISO 8601 brut, à formater côté UI si besoin
- **E10** : Ajouté dans la liste, à confirmer avec le PO
