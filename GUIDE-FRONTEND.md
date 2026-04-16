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
│   └── filters.js                ← Transformation données (ne pas toucher)
└── composables/
    ├── useSearch.js              ← À consommer pour le formulaire
    ├── useFilters.js             ← À consommer pour les filtres
    └── useStations.js            ← À consommer pour la carte
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
const { stations, topCheap, loading, error, go } = useStations()
```

| Variable / Fonction | Type | Description |
|---|---|---|
| `stations` | `ref<Station[]>` | Liste des stations trouvées |
| `topCheap` | `computed<Set<number>>` | Set des IDs des 3 stations les moins chères |
| `loading` | `ref<boolean>` | `true` pendant la requête |
| `error` | `ref<string \| null>` | Message d'erreur si la requête échoue |
| `go(coords, filters)` | `function` | Déclenche la recherche |

### Structure d'une Station

```js
{
  id: 29300002,                    // number — ID unique
  nom: "Station #29300002",        // string — temporaire (id seul)
  adresse: "Rue du Pont Aven",     // string
  ville: "Quimperlé",              // string
  lat: 47.871,                     // number
  lng: -3.567,                     // number
  maj: "2026-04-16T00:50:00+00:00",// string — ISO 8601, date la plus récente
  carburants: [                    // array
    { type: "SP95", prix: 1.98, dispo: true, maj: "2026-04-16T00:50:00+00:00" },
    { type: "E85", prix: null, dispo: false, maj: null },
    // ...
  ]
}
```

### Exemple d'utilisation

```vue
<script setup>
import { useSearch } from '../composables/useSearch.js'
import { useFilters } from '../composables/useFilters.js'
import { useStations } from '../composables/useStations.js'

const { selectedCoords } = useSearch()
const { filters } = useFilters()
const { stations, topCheap, loading, error, go } = useStations()

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

  <div v-for="station in stations" :key="station.id">
    <div :class="{ 'cheap-marker': topCheap.has(station.id) }">
      {{ station.nom }} — {{ station.ville }}
    </div>
  </div>
</template>
```

### Notes importantes

- `go()` **ne fait rien** si `coords` est `null` ou `undefined`.
- `topCheap` est un **Set** → utiliser `topCheap.has(station.id)` pour vérifier.
- Le carburant de référence pour le classement est le **premier de `filters.carburants`**, ou `SP95` si aucun filtre.
- `loading` passe à `true` au début de la requête, `false` à la fin (succès ou erreur).
- `error` est `null` en cas de succès.

---

## 4. Constantes utiles

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

## 5. Flow complet attendu

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
   → loading = true
   → Les APIs sont appelées
   → stations et topCheap sont mis à jour
   → loading = false

6. La carte affiche les markers
   → Pour chaque station dans stations : marker à (lat, lng)
   → Si topCheap.has(station.id) : marker vert (sinon bleu)

7. L'utilisateur clique sur un marker
   → Popup avec nom, adresse, date MAJ, tableau des carburants
```

---

## 6. Cas d'erreur à gérer côté UI

| Situation | Comment détecter | Suggestion UI |
|---|---|---|
| Aucune adresse trouvée | `suggestions` vide après saisie | "Aucune adresse trouvée" |
| Erreur API stations | `error` non-null dans useStations | Afficher `error` |
| Aucune station dans le rayon | `stations` vide après GO | "Aucune station dans ce rayon" |
| Rate limit atteint | `error` contient "429" ou message | "Trop de requêtes, réessayez plus tard" |
| GO cliqué sans adresse | `selectedCoords` est `null` | Désactiver le bouton GO |

---

## 7. Dépendances à installer

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

## 8. Questions en suspens

Voir `TODO-BACKEND.md` pour la liste complète des questions ouvertes, notamment :

- **Nom de station** : Affiché comme `Station #<id>` pour l'instant
- **Formatage des dates** : ISO 8601 brut, à formater côté UI si besoin
- **E10** : Ajouté dans la liste, à confirmer avec le PO
