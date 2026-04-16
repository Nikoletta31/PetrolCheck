# TODO — Backend / Anouar

## Questions en suspens

### 1. Nom de la station (priorité moyenne)
- **Problème** : L'API carburant ne retourne pas de champ `nom` ou `enseigne` (ex: "BP", "Total", "Leclerc").
- **Solution actuelle** : Affichage `Station #<id>` (ex: "Station #29300002").
- **À faire** : Trouver un moyen d'obtenir l'enseigne. Options :
  - Vérifier si un champ caché existe dans l'API (ex: `enseigne`, `marque`, `brand`)
  - Parser le champ `services` ou `adresse` pour extraire une info
  - Accepter l'affichage par ID
- **Impact** : Uniquement cosmétique, le fonctionnement n'est pas bloqué.

### 2. E10 dans l'UI (décision produit)
- **Statut** : E10 a été ajouté à la liste des carburants (`FUEL_TYPES`) mais le PRD original ne le mentionnait pas.
- **À valider** : Confirmer avec le PO que E10 doit apparaître dans la checklist du formulaire.

### 3. Gestion du rate limit API carburant (amélioration)
- **Limite** : 20 000 requêtes/jour avec reset à minuit UTC.
- **Risque** : Si l'app devient populaire, on peut atteindre le plafond.
- **À prévoir** :
  - Afficher un message d'erreur user-friendly quand le rate limit est atteint
  - Mettre en cache les résultats côté client (localStorage/sessionStorage) avec TTL
  - Surveiller le header `X-RateLimit-Remaining`

### 4. Pagination des résultats stations (amélioration)
- **Limite actuelle** : `limit=100` (max de l'API).
- **Scénario** : Dans un rayon de 50km en zone dense, il peut y avoir >100 stations.
- **À prévoir** : Implémenter la pagination avec `offset` si `total_count > 100`.

### 5. Géolocalisation utilisateur pour prioriser les résultats adresse (amélioration)
- **Fonctionnalité** : L'API adresse supporte `lat`/`lon` pour favoriser les résultats proches.
- **À faire** : Demander la permission de géolocalisation au chargement (`navigator.geolocation`) et passer les coords à `searchAddress()`.
- **Statut** : Le composable `useSearch` supporte déjà les paramètres `userLat`/`userLon` mais ils ne sont pas encore fournis.

### 6. Fallback si l'API adresse ne retourne aucun résultat (UX)
- **Scénario** : L'utilisateur tape une adresse qui n'existe pas ou est mal orthographiée.
- **À faire** : Afficher un message d'erreur clair dans le formulaire ("Aucune adresse trouvée").

### 7. Formatage des dates de mise à jour (UX)
- **Format API** : ISO 8601 (ex: `2026-04-16T00:50:00+00:00`)
- **Affichage souhaité** : Format localisé français (ex: "16/04/2026 à 00:50")
- **À faire** : Créer une utilité de formatage de date ou utiliser `Intl.DateTimeFormat`.

### 8. Gestion du champ `rupture_type` (logique métier)
- **Valeurs possibles** : `"definitive"`, `"temporaire"` (à confirmer)
- **Statut actuel** : On traite toute rupture de la même manière (`dispo: false`).
- **À discuter** : Faut-il distinguer rupture temporaire vs définitive dans l'UI ?

### 9. Validation du rayon de recherche (edge case)
- **Valeurs** : 5, 10, 20, 50 km
- **Question** : Que se passe-t-il si le rayon est trop petit et qu'aucune station n'est trouvée ?
- **À faire** : Afficher un message "Aucune station trouvée dans ce rayon" si `stations.length === 0`.

### 10. Performance du debounce sur l'autocomplétion (optimisation)
- **Valeur actuelle** : 300ms
- **À ajuster** : Possiblement réduire à 200ms si le réseau est rapide, ou augmenter à 500ms si l'API est lente.

---

## Fichiers créés

| Fichier | Rôle |
|---|---|
| `src/config/constants.js` | URLs, mapping carburants, constantes |
| `src/services/geocodeAPI.js` | Appel API adresse |
| `src/services/stationsAPI.js` | Appel API carburant |
| `src/services/filters.js` | Transformation + filtrage des données |
| `src/composables/useSearch.js` | État recherche (query, suggestions, coords) |
| `src/composables/useFilters.js` | État filtres (carburants, rayon) |
| `src/composables/useStations.js` | Orchestration (go → stations, topCheap) |

---

## Interface avec Nika (composables)

### `useSearch()`
```js
const { query, suggestions, selectedCoords, search, select, clear } = useSearch()
```

### `useFilters()`
```js
const { filters, toggleCarburant, setRayon, reset } = useFilters()
// filters.carburants: string[]
// filters.rayon: number
```

### `useStations()`
```js
const { stations, topCheap, loading, error, go } = useStations()
// go(coords, filters) → déclenche la recherche
// stations: ref([{ id, nom, adresse, ville, lat, lng, maj, carburants: [{ type, prix, dispo }] }])
// topCheap: computed Set → IDs des 3 stations les moins chères
```
