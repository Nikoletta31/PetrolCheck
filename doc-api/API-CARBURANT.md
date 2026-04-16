# API Prix des Carburants en France (v2.1)
Voici la documentation unifiée, structurée des capacités de filtrage du moteur OpenDataSoft v2.1 avec le schéma de données spécifique aux prix des carburants.
Cette API fournit les prix des carburants en temps réel, les services disponibles et l'état des stocks des stations-service en France. Elle repose sur le moteur de recherche **OpenDataSoft (ODS) Explore v2.1**.

**Endpoint de base :**
`https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records`

---

## 1. Paramètres de Requête (Query Parameters)

| Paramètre | Type | Défaut | Description |
| :--- | :--- | :--- | :--- |
| `select` | `string` | `*` | Champs à retourner, transformations ou agrégations (ex: `ville, avg(gazole_prix)`). |
| `where` | `string` | - | Filtres booléens complexes SQL-like (ex: `gazole_prix < 1.8`). |
| `group_by` | `string` | - | Champs de regroupement pour les agrégations (ex: `ville`). |
| `order_by` | `string` | - | Tri des résultats : `nom_du_champ [ASC\|DESC]`. |
| `limit` | `integer` | `20` | Nombre de résultats par page (Maximum : 100). |
| `offset` | `integer` | `0` | Index du premier résultat pour la pagination. |
| `refine` | `string` | - | Filtre de facette strict. Format : `nom_facette:"valeur"`. Peut être répété. |
| `exclude` | `string` | - | Exclusion de facette. Format : `nom_facette:"valeur"`. |
| `timezone` | `string` | `UTC` | Fuseau horaire pour les dates (ex: `Europe/Paris`). |

---

## 2. Syntaxe des Clauses Complexes

### A. Clause `where` (Filtrage avancé)
- **Opérateurs :** `AND`, `OR`, `NOT`, `>`, `<`, `>=`, `<=`, `=`, `like`.
- **Fonction Géo :** `within_distance(geom, geom'POINT(longitude latitude)', distance)` (ex: `10km`).
- **Exemple :** `where=gazole_prix > 1.5 AND (ville like "Paris" OR cp="75001")`

### B. Clause `select` (Projection et Calculs)
- **Alias :** `champ AS label`.
- **Agrégations :** `count(*)`, `avg()`, `min()`, `max()`.
- **Exemple :** `select=ville, gazole_prix * 1.20 AS gazole_ttc`

### C. Clause `order_by` (Tri)
- **Règle :** Les agrégations doivent être placées **avant** les champs simples dans la liste de tri.
- **Exemple :** `order_by=avg(gazole_prix) DESC, ville ASC`

---

## 3. Schéma des Données (Response Schema)

Chaque objet dans le tableau `results` suit la structure ci-dessous. Si un carburant est en rupture, ses champs associés (`_prix`, `_maj`) sont `null`.

### Station et Services
- `id` (int) : ID unique.
- `adresse`, `ville`, `cp` (string) : Coordonnées postales.
- `pop` (string) : Type de zone (`R` : Route, `A` : Autoroute).
- `services_service` (array[str]) : Liste des services (ex: `["Lavage haute pression", "Vente de gaz domestique"]`).
- `horaires_automate_24_24` (string) : `"Oui"` ou `"Non"`.

### Géolocalisation
- `geom` (object) : Coordonnées standards `{lat, lon}`. **À utiliser pour les calculs géo.**
- `latitude` / `longitude` (string) : Coordonnées brutes sans point décimal (ex: `488584` pour `48.8584`).

### Prix par Carburant
| Carburant | Prix (float) | Mise à jour (ISO Date) | Type Rupture |
| :--- | :--- | :--- | :--- |
| **Gazole** | `gazole_prix` | `gazole_maj` | `gazole_rupture_type` |
| **SP95** | `sp95_prix` | `sp95_maj` | `sp95_rupture_type` |
| **SP98** | `sp98_prix` | `sp98_maj` | `sp98_rupture_type` |
| **E10** | `e10_prix` | `e10_maj` | `e10_rupture_type` |
| **E85** | `e85_prix` | `e85_maj` | `e85_rupture_type` |
| **GPLc** | `gplc_prix` | `gplc_maj` | `gplc_rupture_type` |

---

## 4. Filtrage par Facettes (`refine`)

Utilisez `refine` pour des filtres rapides sur les catégories suivantes :
- **Carburants :** `carburants_disponibles` ou `carburants_indisponibles` (Valeurs : `Gazole`, `SP95`, `SP98`, `E10`, `E85`, `GPLc`).
- **Localisation :** `region`, `departement`, `code_departement` (ex: `29`).
- **Services :** `services_service` (ex: `Boutique alimentaire`).

---

## 5. Exemples de Requêtes

**1. Top 5 des stations Gazole les moins chères dans le Finistère :**
`GET .../records?limit=5&refine=departement:"Finistère"&where=gazole_prix>0&order_by=gazole_prix ASC`

**2. Stations en Bretagne proposant du GPLc et possédant une laverie :**
`GET .../records?refine=region:"Bretagne"&refine=carburants_disponibles:"GPLc"&refine=services_service:"Laverie"`

**3. Prix moyen du SP98 par ville dans le département 75 :**
`GET .../records?select=ville, avg(sp98_prix) as moyenne&where=code_departement="75"&group_by=ville&order_by=moyenne ASC`

---

## 6. Précisions techniques pour l'implémentation

1. **Vérification de disponibilité :** Ne pas se fier uniquement à la présence d'un prix. Utiliser le tableau `carburants_disponibles` pour confirmer qu'un carburant est distribué.
2. **Dates :** Toutes les dates de mise à jour (`_maj`) sont au format ISO 8601 (ex: `2024-04-16T12:00:00Z`).
3. **Encodage URL :** Les valeurs des paramètres `refine` et `where` doivent être encodées en cas d'espaces ou de caractères spéciaux (ex: `refine=region:"Auvergne-Rhône-Alpes"` devient `region:%22Auvergne-Rh%C3%B4ne-Alpes%22`).
4. **Groupement Géo :** Le `group_by` sur des points géographiques directs n'est pas supporté. Utiliser `geo_cluster(geom)` pour des agrégations cartographiques.

## Exemple de réponses JSON - total 54, mais tronqué à 2 réponses

```json{
"total_count":54,
"results":[
{
"id":29300002,
"latitude":"4787100",
"longitude":"-356700",
"cp":"29300",
"pop":"R",
"adresse":"Rue du Pont Aven",
"ville":"Quimperlé",
"horaires":"{"@automate-24-24": "", "jour": [{"@id": "1", "@nom": "Lundi", "@ferme": ""}, {"@id": "2", "@nom": "Mardi", "@ferme": ""}, {"@id": "3", "@nom": "Mercredi", "@ferme": ""}, {"@id": "4", "@nom": "Jeudi", "@ferme": ""}, {"@id": "5", "@nom": "Vendredi", "@ferme": ""}, {"@id": "6", "@nom": "Samedi", "@ferme": ""}, {"@id": "7", "@nom": "Dimanche", "@ferme": ""}]}",
"services":"{"service": ["Boutique alimentaire", "Boutique non alimentaire", "Vente de gaz domestique (Butane, Propane)"]}",
"prix":"[{"@nom": "Gazole", "@id": "1", "@maj": "2026-04-16 00:50:00", "@valeur": "2.199"}, {"@nom": "SP95", "@id": "2", "@maj": "2026-04-16 00:50:00", "@valeur": "1.980"}, {"@nom": "E10", "@id": "5", "@maj": "2026-04-16 00:50:00", "@valeur": "1.919"}, {"@nom": "SP98", "@id": "6", "@maj": "2026-04-16 00:50:00", "@valeur": "1.999"}]",
"rupture":"[{"@nom": "E85", "@id": "3", "@debut": "2025-02-12 10:51:09", "@fin": "", "@type": "definitive"}, {"@nom": "GPLc", "@id": "4", "@debut": "2025-02-12 10:51:09", "@fin": "", "@type": "definitive"}]",
"geom":{
"lon":-3.567,
"lat":47.871
},
"gazole_maj":"2026-04-16T00:50:00+00:00",
"gazole_prix":2.199,
"sp95_maj":"2026-04-16T00:50:00+00:00",
"sp95_prix":1.98,
"e85_maj":null,
"e85_prix":null,
"gplc_maj":null,
"gplc_prix":null,
"e10_maj":"2026-04-16T00:50:00+00:00",
"e10_prix":1.919,
"sp98_maj":"2026-04-16T00:50:00+00:00",
"sp98_prix":1.999,
"e10_rupture_debut":null,
"e10_rupture_type":null,
"sp98_rupture_debut":null,
"sp98_rupture_type":null,
"sp95_rupture_debut":null,
"sp95_rupture_type":null,
"e85_rupture_debut":"2025-02-12T10:51:09+00:00",
"e85_rupture_type":"definitive",
"gplc_rupture_debut":"2025-02-12T10:51:09+00:00",
"gplc_rupture_type":"definitive",
"gazole_rupture_debut":null,
"gazole_rupture_type":null,
"carburants_disponibles":[
"Gazole",
"SP95",
"E10",
"SP98"
],
"carburants_indisponibles":[
"E85",
"GPLc"
],
"carburants_rupture_temporaire":null,
"carburants_rupture_definitive":"E85;GPLc",
"horaires_automate_24_24":"Non",
"services_service":[
"Boutique alimentaire",
"Boutique non alimentaire",
"Vente de gaz domestique (Butane, Propane)"
],
"departement":"Finistère",
"code_departement":"29",
"region":"Bretagne",
"code_region":"53",
"horaires_jour":null
},
{
"id":29590001,
"latitude":"4829800",
"longitude":"-417000",
"cp":"29590",
"pop":"R",
"adresse":"ZONE DE QUIELLA",
"ville":"Le Faou",
"horaires":"{"@automate-24-24": "1", "jour": [{"@id": "1", "@nom": "Lundi", "@ferme": "", "horaire": {"@ouverture": "09.00", "@fermeture": "19.30"}}, {"@id": "2", "@nom": "Mardi", "@ferme": "", "horaire": {"@ouverture": "09.00", "@fermeture": "19.30"}}, {"@id": "3", "@nom": "Mercredi", "@ferme": "", "horaire": {"@ouverture": "09.00", "@fermeture": "19.30"}}, {"@id": "4", "@nom": "Jeudi", "@ferme": "", "horaire": {"@ouverture": "09.00", "@fermeture": "19.30"}}, {"@id": "5", "@nom": "Vendredi", "@ferme": "", "horaire": {"@ouverture": "09.00", "@fermeture": "19.30"}}, {"@id": "6", "@nom": "Samedi", "@ferme": "", "horaire": {"@ouverture": "09.00", "@fermeture": "19.30"}}, {"@id": "7", "@nom": "Dimanche", "@ferme": "", "horaire": {"@ouverture": "09.00", "@fermeture": "19.30"}}]}",
"services":"{"service": ["Laverie", "Relais colis", "Restauration à emporter", "Location de véhicule", "Piste poids lourds", "Lavage automatique", "Lavage manuel", "Vente de gaz domestique (Butane, Propane)", "Automate CB 24/24"]}",
"prix":"[{"@nom": "Gazole", "@id": "1", "@maj": "2026-04-16 08:04:41", "@valeur": "2.249"}, {"@nom": "SP95", "@id": "2", "@maj": "2026-04-16 08:04:41", "@valeur": "1.999"}, {"@nom": "SP98", "@id": "6", "@maj": "2026-04-16 08:04:41", "@valeur": "2.049"}]",
"rupture":"[{"@nom": "E85", "@id": "3", "@debut": "2017-09-05 10:26:03", "@fin": "", "@type": "definitive"}, {"@nom": "GPLc", "@id": "4", "@debut": "2017-09-05 10:26:04", "@fin": "", "@type": "definitive"}, {"@nom": "E10", "@id": "5", "@debut": "2017-09-05 10:26:04", "@fin": "", "@type": "definitive"}]",
"geom":{
"lon":-4.17,
"lat":48.298
},
"gazole_maj":"2026-04-16T08:04:41+00:00",
"gazole_prix":2.249,
"sp95_maj":"2026-04-16T08:04:41+00:00",
"sp95_prix":1.999,
"e85_maj":null,
"e85_prix":null,
"gplc_maj":null,
"gplc_prix":null,
"e10_maj":null,
"e10_prix":null,
"sp98_maj":"2026-04-16T08:04:41+00:00",
"sp98_prix":2.049,
"e10_rupture_debut":"2017-09-05T10:26:04+00:00",
"e10_rupture_type":"definitive",
"sp98_rupture_debut":null,
"sp98_rupture_type":null,
"sp95_rupture_debut":null,
"sp95_rupture_type":null,
"e85_rupture_debut":"2017-09-05T10:26:03+00:00",
"e85_rupture_type":"definitive",
"gplc_rupture_debut":"2017-09-05T10:26:04+00:00",
"gplc_rupture_type":"definitive",
"gazole_rupture_debut":null,
"gazole_rupture_type":null,
"carburants_disponibles":[
"Gazole",
"SP95",
"SP98"
],
"carburants_indisponibles":[
"E85",
"GPLc",
"E10"
],
"carburants_rupture_temporaire":null,
"carburants_rupture_definitive":"E85;GPLc;E10",
"horaires_automate_24_24":"Oui",
"services_service":[
"Laverie",
"Relais colis",
"Restauration à emporter",
"Location de véhicule",
"Piste poids lourds",
"Lavage automatique",
"Lavage manuel",
"Vente de gaz domestique (Butane, Propane)",
"Automate CB 24/24"
],
"departement":"Finistère",
"code_departement":"29",
"region":"Bretagne",
"code_region":"53",
"horaires_jour":"Automate-24-24, Lundi09.00-19.30, Mardi09.00-19.30, Mercredi09.00-19.30, Jeudi09.00-19.30, Vendredi09.00-19.30, Samedi09.00-19.30, Dimanche09.00-19.30"
},
]
}
```

## ODSQL predicate within_distance()
Syntax: within_distance(<geo_field>, <center_geometry>, <distance><unit>)

Clauses where it can be used: where only

Returned type: boolean

Examples of a within_distance function:

within_distance(field_name, GEOM'<geometry>', 1km)

within_distance(field_name, GEOM'<geometry>', 100yd)
The within_distance function limits the result set to a geographical area defined by a circle. This circle must be defined by its center and a distance.

The center of the circle is expressed as a geometry literal.

The distance is numeric and can have a unit in:

miles (mi)
yards (yd)
feet (ft)
meters (m)
centimeters (cm)
kilometers (km)
millimeters (mm)
