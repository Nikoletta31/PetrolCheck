# PRD — Carburant Map

## Vision

Application web de recherche de tarifs de carburant en France. Un utilisateur arrive, saisit une adresse, choisit ses carburants et un rayon de recherche, clique sur GO, et voit les stations les moins chères autour de lui.

Pas de compte, pas de paiement, pas de back-end. Une app Vue statique qui consomme deux API publiques.

---

## Stack

| Couche | Choix |
|---|---|
| Front | Vue 3 + Vite |
| Carte | Leaflet + Leaflet.markerCluster |
| Données stations | API data.economie.gouv.fr |
| Géocodage | API adresse.data.gouv.fr |
| Hébergement | Netlify (site statique) |
| Back-end | Aucun |
| Base de données | Aucune |
| Auth | Aucune |

---

## Flow utilisateur

L'utilisateur saisit une adresse (obligatoire)
→ Autocomplétion via API adresse.data.gouv.fr

Il coche un ou plusieurs types de carburant (optionnel)
→ Checklist : SP95, SP98, Gazole, E85, GPLc
→ Si rien coché : tous les carburants

Il choisit un rayon de recherche
→ Slider ou select (ex: 5km, 10km, 20km, 50km)

Il clique sur GO

Le système :
→ Appelle API adresse.data.gouv.fr avec l'adresse saisie
→ Extrait les coordonnées GPS du résultat
→ Appelle API data.economie.gouv.fr avec les coords + rayon
→ Filtre par carburants sélectionnés (si applicable)
→ Affiche les stations sur la carte, centrée sur l'adresse

L'utilisateur clique sur un marker
→ Popup avec le détail de la station

Les 3 stations les moins chères ont un marker d'une couleur différente



**Rien ne se passe tant que l'utilisateur n'a pas cliqué sur GO.** La carte est vide ou affiche un état par défaut au chargement.

---

## Features

### 1. Formulaire de recherche
- Champ adresse avec autocomplétion (API adresse.data.gouv.fr) — **obligatoire**
- Checklist types de carburant (SP95, SP98, Gazole, E85, GPLc) — **optionnel**, tous par défaut
- Sélecteur rayon de recherche (5km, 10km, 20km, 50km)
- Bouton **GO** — déclenche la recherche
- Le bouton GO est désactivé tant qu'aucune adresse n'est saisie

### 2. Carte interactive
- Au chargement : carte centrée sur la France, vide
- Après GO : carte recentrée sur l'adresse, markers des stations dans le rayon
- Les **3 stations les moins chères** ont un marker d'une couleur distincte (ex: vert vs bleu)
- Clustering au dézoom si beaucoup de résultats (Leaflet.markerCluster)

### 3. Popup station
Au clic sur un marker :
┌──────────────────────────────────┐
│  Station BP Rivoli               │  ← nom de la station
│  Mis à jour le 15/01/2025       │  ← date de dernière MàJ
│                                  │
│  Carburant     │ Prix            │
│  ─────────────────────────────── │
│  SP95          │ 1.879 €/L      │
│  Gazole        │ 1.654 €/L      │
│  E85           │ Rupture         │
└──────────────────────────────────┘

- Titre : nom de la station
- Sous-titre : date de mise à jour
- Tableau simple : carburant + tarif
- Si rupture de stock : afficher "Rupture" à la place du prix

### 4. Mise en avant des moins chères
- Après une recherche, les 3 stations les moins chères (sur le carburant principal sélectionné, ou le premier de la checklist) sont visuellement distinctes :
  - Marker d'une couleur différente sur la carte (ex: vert)
  - Optionnel : badge ou highlight dans la popup

---

## Ce qu'on ne fait PAS

- Authentification
- Paiement
- Back-end / API custom
- Base de données
- Historique des prix
- Itinéraire
- PWA / notifications
- CI/CD
- Recherche à chaque déplacement de carte (la recherche est déclenchée uniquement par GO)

---

## Architecture
src/
├── components/          ← NIKA
│   ├── MapView.vue
│   ├── StationPopup.vue
│   ├── SearchForm.vue
│   └── App.vue
│
├── composables/         ← ANOUAR
│   ├── useStations.js
│   ├── useSearch.js
│   └── useFilters.js
│
├── services/            ← ANOUAR
│   ├── stationsAPI.js
│   ├── geocodeAPI.js
│   └── filters.js
│
├── assets/styles/       ← NIKA
└── config/              ← ANOUAR

**Règle : NIKA ne touche pas `services/` ni `composables/`. ANOUAR ne touche pas `components/`.**

L'interface entre les deux, ce sont les composables.

---

## Contrat d'interface

### useSearch()

```js
const { query, suggestions, selectedCoords, search } = useSearch()

// query = ref("")                    ← texte saisi par l'utilisateur
// suggestions = ref([                ← résultats autocomplétion
//   { label: "12 rue de Rivoli, Paris", lat: 48.856, lng: 2.347 }
// ])
// selectedCoords = ref(null)         ← { lat, lng } après sélection
// search(queryString) → met à jour suggestions
// select(suggestion) → met à jour selectedCoords
useFilters()
const { filters } = useFilters()

// filters = reactive({
//   carburants: [],        // string[] — ex: ["SP95", "Gazole"], vide = tous
//   rayon: 10              // number en km
// })
useStations(coords, filters)
const { stations, topCheap, loading, error, go } = useStations()

// go(coords, filters) → déclenche la requête
//
// stations = ref([
//   {
//     id: "75056001",
//     nom: "Station BP Rivoli",
//     adresse: "12 rue de Rivoli",
//     ville: "Paris",
//     lat: 48.856,
//     lng: 2.347,
//     maj: "2025-01-15",
//     carburants: [
//       { type: "SP95", prix: 1.879, dispo: true },
//       { type: "Gazole", prix: 1.654, dispo: true },
//       { type: "E85", prix: null, dispo: false }
//     ]
//   }
// ])
//
// topCheap = computed → les 3 IDs des stations les moins chères
//   (basé sur le premier carburant sélectionné dans filters.carburants,
