# API ADRESSE

## Méta-description
Il existe 2 types de geocodage (direct et inverse):

- Le service de géocodage direct permet de fournir les coordonnées géographiques d’une adresse postale, d’un lieu ou de parcelles cadastrales à partir d’une requête HTTP.
- Le service de géocodage inverse a pour but de retourner, à partir d’un ou plusieurs points géographiques indiqués en latitude/longitude, la ou les entités géolocalisées les plus proches correspondantes, parmi les adresses, toponymes, parcelles cadastrales, et/ou unités administratives.
Ces deux types de géocodage se déclinent sous la forme d'appels unitaires, ou regroupés par fichiers (géocodage en masse de fichiers csv)

géocodage direct : https://data.geopf.fr/geocodage/search
géocodage inverse : https://data.geopf.fr/geocodage/reverse

## Paramètre du geocodage direct - Endpoint : `/search` (GET)

Recherche de localisants (adresses, parcelles, points d'intérêt) via différents index.

### Paramètres de requête (Query Parameters)

| Paramètre | Type | Défaut | Description |
| :--- | :--- | :--- | :--- |
| `q` | `string` | - | Chaîne décrivant la localisation à rechercher. **Note :** Peut être vide si `index=parcel` pour effectuer une recherche structurée via les filtres de parcelle. |
| `index` | `string` | `address` | Index(es) de recherche. Valeurs possibles : `address`, `parcel`, `poi`. Plusieurs valeurs possibles séparées par une virgule. |
| `autocomplete` | `boolean` | `true` | Active ou désactive le mode auto-complétion. |
| `limit` | `integer` | `10` | Nombre maximum de résultats. Max : `50`. Si `returntruegeometry=true`, le max est forcé à `20`. |
| `lat` | `number` | - | Latitude pour favoriser les résultats proches (pondération géographique). |
| `lon` | `number` | - | Longitude pour favoriser les résultats proches (pondération géographique). |
| `returntruegeometry` | `boolean` | `false` | Si `true`, retourne la géométrie réelle de l'objet. |

### Filtres spécifiques par Index

Ces paramètres permettent d'affiner la recherche et sont dépendants de la valeur du paramètre `index`.

#### Index `address` & `poi`

| Paramètre | Type | Description |
| :--- | :--- | :--- |
| `postcode` | `string` | Filtre par code postal. |
| `citycode` | `string` | Filtre par code INSEE de la commune. |
| `city` | `string` | Filtre par nom de commune. |

#### Index `address` uniquement

| Paramètre | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | Filtre par type d'adresse (`housenumber`, `street`, `municipality`, etc.). |

#### Index `poi` uniquement

| Paramètre | Type | Description |
| :--- | :--- | :--- |
| `category` | `string` | Filtre par catégorie de POI (voir `getCapabilities` pour la liste). |

#### Index `parcel` (Recherche cadastrale)

| Paramètre | Type | Description |
| :--- | :--- | :--- |
| `departmentcode` | `string` | Code du département (ex: `75`). |
| `municipalitycode` | `string` | Code commune (ex: `056`). |
| `oldmunicipalitycode` | `string` | Code de l'ancienne commune (si applicable). |
| `districtcode` | `string` | Code de l'arrondissement. |
| `section` | `string` | Section cadastrale. |
| `number` | `string` | Numéro de parcelle. |
| `sheet` | `string` | Feuille cadastrale. |

---

### Exemples d'utilisation

#### 1. Recherche d'adresse standard

`GET /search?q=73 Avenue de Paris Saint-Mandé`

#### 2. Recherche par point d'intérêt (POI)

`GET /search?q=cimetière Vincennes&index=poi`

#### 3. Recherche multicritères (POI et Adresses)

`GET /search?q=1 boulevard Voltaire Paris&index=poi,address`

#### 4. Recherche structurée par parcelle (sans texte `q`)

Recherche de la section `AV` dans la commune `75056` (Paris 16e).

`GET /search?q=&index=parcel&departmentcode=75&municipalitycode=056&section=AV`

#### 5. Recherche avec priorité géographique

Favoriser les résultats autour de coordonnées spécifiques.

`GET /search?q=mairie&lat=48.8566&lon=2.3522`

#### 6. Dernier exemple

Recherche type d'utilisateur, avec paramètres par défaut.
`GET /search?q=1%20boulevard%20Voltaire%20Paris&autocomplete=1&index=address&limit=10&returntruegeometry=false`

---

### Contraintes et Logique métier

- **Contrainte `limit`** : La valeur est bridée à `20` automatiquement si `returntruegeometry` est à `true`, même si l'utilisateur demande `50`.
- **Paramètre `q` vide** : Uniquement valide si `index=parcel` est utilisé avec au moins un filtre cadastral (ex: `departmentcode`).
- **Multi-index** : Pour interroger plusieurs index à la fois, séparez les termes par une virgule dans le paramètre `index` (ex: `index=address,poi`).

### Exemple de Response headers
 access-control-allow-credentials: true 
 access-control-allow-headers: DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Content-Disposition,Content-Length,X-Community 
 access-control-allow-methods: GET,PUT,POST,DELETE,PATCH,OPTIONS 
 access-control-allow-origin: * 
 access-control-max-age: 1728000 
 content-encoding: gzip 
 content-type: application/json; charset=utf-8 
 date: Thu,16 Apr 2026 12:30:21 GMT 
 etag: W/"9b9-bQoaVwMKkAZLqru4Qe/y6f4lTOg" 
 ratelimit-limit: 50 
 strict-transport-security: max-age=31536000; includeSubDomains 
 vary: Origin 
 x-iplb-instance: 61218 
 x-iplb-request-id: 9F1A7040:C99D_91EFC1E7:01BB_69E0D65C_9B9856B1:23DB69 
 x-ratelimit-limit-second: 1 

### Exemple de Body reponse
````json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          2.365708,
          48.866578
        ]
      },
      "properties": {
        "label": "1 Boulevard Voltaire 75011 Paris",
        "score": 0.9838999999999999,
        "housenumber": "1",
        "id": "75111_9907_00001",
        "name": "1 Boulevard Voltaire",
        "postcode": "75011",
        "citycode": "75111",
        "x": 653469.03,
        "y": 6863136.69,
        "city": "Paris",
        "district": "Paris 11e Arrondissement",
        "context": "75, Paris, Île-de-France",
        "type": "housenumber",
        "importance": 0.8229,
        "street": "Boulevard Voltaire",
        "_type": "address"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          2.389865,
          48.852251
        ]
      },
      "properties": {
        "label": "1 Rue Voltaire 75011 Paris",
        "score": 0.4873111285266458,
        "housenumber": "1",
        "id": "75111_9912_00001",
        "name": "1 Rue Voltaire",
        "postcode": "75011",
        "citycode": "75111",
        "x": 655228.82,
        "y": 6861529.67,
        "city": "Paris",
        "district": "Paris 11e Arrondissement",
        "context": "75, Paris, Île-de-France",
        "type": "housenumber",
        "importance": 0.70525,
        "street": "Rue Voltaire",
        "_type": "address"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          2.389358,
          48.852571
        ]
      },
      "properties": {
        "label": "1 Cité Voltaire 75011 Paris",
        "score": 0.4728790909090909,
        "housenumber": "1",
        "id": "75111_9908_00001",
        "name": "1 Cité Voltaire",
        "postcode": "75011",
        "citycode": "75111",
        "x": 655191.89,
        "y": 6861565.54,
        "city": "Paris",
        "district": "Paris 11e Arrondissement",
        "context": "75, Paris, Île-de-France",
        "type": "housenumber",
        "importance": 0.70167,
        "street": "Cité Voltaire",
        "_type": "address"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          2.332933,
          48.858236
        ]
      },
      "properties": {
        "label": "1 Quai Voltaire 75007 Paris",
        "score": 0.4673463636363636,
        "housenumber": "1",
        "id": "75107_9911_00001",
        "name": "1 Quai Voltaire",
        "postcode": "75007",
        "citycode": "75107",
        "x": 651056.92,
        "y": 6862228.94,
        "city": "Paris",
        "district": "Paris 7e Arrondissement",
        "context": "75, Paris, Île-de-France",
        "type": "housenumber",
        "importance": 0.64081,
        "street": "Quai Voltaire",
        "_type": "address"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          5.689799,
          45.183737
        ]
      },
      "properties": {
        "label": "1 Rue Voltaire 38170 Seyssinet-Pariset",
        "score": 0.34893208425720623,
        "housenumber": "1",
        "id": "38485_0700_00001",
        "banId": "fe6e8649-4a28-4f7e-82ff-c1cb9376762b",
        "name": "1 Rue Voltaire",
        "postcode": "38170",
        "citycode": "38485",
        "x": 911218.5,
        "y": 6457423.07,
        "city": "Seyssinet-Pariset",
        "context": "38, Isère, Auvergne-Rhône-Alpes",
        "type": "housenumber",
        "importance": 0.54557,
        "street": "Rue Voltaire",
        "_type": "address"
      }
    }
  ],
  "query": "1 boulevard Voltaire Paris"
}```