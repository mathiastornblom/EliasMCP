# EliasMCP — Arkitektoniska beslut

_Skrivet av Arkitekten. Senast uppdaterat 2026-05-23._

---

## 1. EliasClient vs ScoutClient — autentiseringsskillnader

| Aspekt | ScoutClient | EliasClient |
|--------|-------------|-------------|
| Login-endpoint | `POST /rest/auth/v1/login` | `POST /api/authenticate` |
| Login-payload | `{ loginData64: base64(JSON) }` | `{ user, domain, password }` direkt |
| Token-transport | Cookie: `ScoutBoardAuthJWT=<token>` | Header: `x-access-token: <token>` |
| Token-field i response | `data.token` | `data.token` |
| Token-refresh | Vid 401: re-login + retry | Samma mönster (identiskt) |
| Verify-endpoint | Saknas | `GET /api/verify?token=<token>` |

**Beslut:** `EliasClient` kopierar ScoutClients grundstruktur men ersätter:
- Login-URL och payload-format
- Cookie-header → `x-access-token`-header
- Config-interface heter `EliasConfig` (baseUrl, username, password, domain, ignoreTls)
- Credentials sparas i `~/.elias-mcp.json`
- Env-vars: `ELIAS_BASE_URL`, `ELIAS_USERNAME`, `ELIAS_PASSWORD`, `ELIAS_DOMAIN`, `ELIAS_IGNORE_TLS`, `ELIAS_REQUEST_TIMEOUT_MS`

**OBS:** ELIAS-servern kan köra HTTP (inte bara HTTPS) — `baseUrl` valideras för att acceptera `http://` om ELIAS_IGNORE_TLS=true, men vi rekommenderar starkt HTTPS.

---

## 2. URL-routing — dubbel baseUrl-strategi

ELIAS har **två kategorier** av endpoints med olika URL-prefix:

### API-routes (alla MCP-verktyg):
```
ELIAS_BASE_URL/api/<path>
Ex: https://elias.example.com:22130/api/authenticate
Ex: https://elias.example.com:22130/api/containers
Ex: https://elias.example.com:22130/api/{container}/idfs
```

### eLux-routes (filserving för tunna klienter — ej implementerade som MCP-verktyg):
```
ELIAS_BASE_URL/<container>/<filename>
```

**Beslut:** `EliasClient.request()` lägger alltid `/api`-prefix. `baseUrl` i `~/.elias-mcp.json` skall **inkludera** `/api` på slutet, t.ex. `https://host:22130/elias/api`.

### Verifierade URL-mönster (testat mot live-server 2026-05-22–23)

| Resurs | Endpoint | Kräver extension? | Notering |
|--------|----------|-------------------|----------|
| Lista IDF:er | `GET /{c}/idfs` | — | Returnerar array |
| GET enskild IDF | `GET /{c}/idf/{name}.idf` | **Ja** | Returnerar array — unwrappa [0] |
| Skapa IDF | `POST /{c}/idfs` | — | Body: `{ overwrite, idf }` |
| Uppdatera IDF | `PUT /{c}/idf/{name}.idf` | **Ja** | Body: `{ overwrite, idf }` |
| Ta bort IDF | `DELETE /{c}/idf/{name}.idf` | **Ja** | |
| Lista IDT:er | `GET /{c}/idts` | — | |
| GET enskild IDT | `GET /{c}/idt/{name}.idt` | **Ja** | Returnerar array — unwrappa [0] |
| Skapa IDT | `POST /{c}/idts` | — | Body: `{ overwrite, idf }` |
| Uppdatera IDT | `PUT /{c}/idt/{name}.idt` | **Ja** | |
| Ta bort IDT | `DELETE /{c}/idt/{name}.idt` | **Ja** | |
| Signera IDF | `GET /{c}/sign/{name}.idf` | **Ja** | |
| Lås IDF | `POST /{c}/lock/{name}.idf` | **Ja** | |
| Signera IDT | `GET /{c}/sign/{name}.idt` | **Ja** | |
| Lås IDT | `POST /{c}/lock/{name}.idt` | **Ja** | |

**Regel:** Extension krävs alltid i URL. OpenAPI-specen stämmer på denna punkt.

**GET returnerar array:** `GET /{c}/idf/{name}.idf` returnerar `[{...}]`, inte ett enskilt objekt. Tom array `[]` = inte hittat. Implementationen unwrappar `[0]` och returnerar `fail()` vid tom array.

---

## 3. selfContained och legacyIDF — kritisk insikt (2026-05-23)

### Vad selfContained faktiskt innebär

`selfContained` är ett **klient-tillhandahållet fält**, inte ett serverberäknat. ELIAS beräknar det INTE automatiskt. Beteendet är:

- Om klienten skickar `selfContained: true` i PUT-kroppen → ELIAS lagrar `true` OCH beräknar `legacyIDF` (det kompilerade `.idf`-binärformatet med checksummor och byggtider)
- Om `selfContained` saknas eller är `false` → ELIAS lagrar värdet som skickades, beräknar INTE `legacyIDF`, och bilden visas som "Incomplete" i UI:t

**Konsekvens:** `resolveAndSave()` i `images.ts` måste alltid inkludera `selfContained: true` i PUT-kroppen. Detta är ett icke-förhandlingsbart krav.

### Flödet för selfContained images (`resolveAndSave`)

```
1. POST /{c}/solve  { parcels: packageList }
   → Returnerar string[] med BLANDADE EPM-IDs och FPM-IDs (t.ex. "baseos-7.2509.0-4.UC_ELUX7-1.0.epm" och "install-7.2509.0-4.UC_ELUX7-1.0.fpm")

2. GET /{c}/epms  →  EpmPackage[]
3. GET /{c}/fpms  →  FpmPackage[]
4. GET /{c}/about →  { container: "UC_ELUX7-1.0-1" } (plattformsversion)
   (steg 1–4 körs parallellt)

5. Bygg epms-array:
   - Filtrera allEpms: behåll EPM om dess ID finns i solvedSet ELLER om någon av dess fpms finns i solvedSet
   - Mappa varje EPM med fullständig FPM-lista, selected = solvedSet.has(fpmId)

6. Beräkna imageSize = sum(fpm.size för selected FPMs)
   - fpm.size från /fpms är redan i bytes (INTE KB)

7. PUT /{c}/idf/{name}.idf  { overwrite, idf: { ...clean, version: '3.0', container: platformVersion, packageList: [], epms, selfContained: true, imageSize } }
   - SERVER_FIELDS (MongoDB-interna) stoppas: _id, __v, usedContainer, author, created, modified, conflicts, locked
```

### POST /solve — returnerar blandad array

`POST /{c}/solve` med `{ parcels: epmIdList }` returnerar `string[]` som innehåller **både** EPM-IDs (`.epm`-suffix) och FPM-IDs (`.fpm`-suffix) i samma array. `solvedSet` hanterar detta korrekt utan uppdelning.

### Varför UI-sparade bilder alltid är selfContained

UI:t skickar `selfContained: true` explicit i varje PUT-anrop. API-anrop utan det fältet kan aldrig generera `legacyIDF`. Detta orsakade den ursprungliga buggrapport denna session.

---

## 4. imageSize — klientberäknat fält

`imageSize` är summan av `size` för alla **selected** FPMs i `epms`-arrayen. Fältet lagras av ELIAS men beräknas INTE av servern — klienten måste beräkna och skicka det.

- `fpm.size` från `GET /{c}/fpms` är i **bytes** (inte KB, inte blocks)
- UI visar storleken i GB/MB baserat på detta fält
- Saknas `imageSize` → UI visar "NaN und..." i storlekskolumnen

**Formel:**
```typescript
const imageSize = epms.reduce(
  (total, epm) => total + epm.fpms.reduce((s, fpm) => s + (fpm.selected ? (fpm.size ?? 0) : 0), 0),
  0,
);
```

---

## 5. Templates (IDT) — annorlunda struktur än Images (IDF)

### Nyckelskillnader

| Aspekt | IDF (Image) | IDT (Template) |
|--------|-------------|----------------|
| `selfContained` | `true` (klientberäknat) | `false` (alltid) |
| `epms` | Full array med versioner, FPMs, sizes | `[]` (alltid tom) |
| `epmGroups` | `[]` (alltid tom) | Lista med EPM-namn eller exakta EPM-IDs |
| `fpmGroups` | `[]` (alltid tom) | Lista med valfria FPM-namn |
| `imageSize` | Beräknad summa av selected FPMs | `0` (template har inga lösta FPMs) |
| `isTemplate` | Saknas/false | `true` |
| `conflicted` | Saknas | `false` |
| `hasMissing` | Saknas | `false` |

### epmGroups — två format

`epmGroups` i en IDT accepterar två format:
1. **Gruppnamn** (flexibelt): `"baseos"` — ELIAS väljer alltid senaste versionen när templaten löses
2. **Exakt EPM-ID** (låst): `"baseos-7.2509.0-4.UC_ELUX7-1.0.epm"` — pinnar en specifik version

**Regel för EliasMCP:** Använd gruppnamn som default. Om en EPM-grupp har flera versioner tillgängliga i containern, rapportera detta i svaret så att Claude kan fråga användaren om de vill låsa versionen.

### Fält som MÅSTE skickas vid skapa/uppdatera template

```typescript
{
  isTemplate: true,
  selfContained: false,
  imageSize: 0,
  conflicted: false,
  hasMissing: false,
  // ...resten av användarens idf
}
```

Saknas dessa fält → ELIAS lagrar dem inte → UI visar "NaN und..." i storlekskolumnen och kan ha fel beteende.

---

## 6. Export/Import — binär data och zip-filer

### Export

| Endpoint | Content-Type | Hantering |
|----------|--------------|-----------|
| `/{c}/export/container` | `application/zip` | Returnera base64 till MCP-klient |
| `/{c}/export/{name}.idf` | `text/plain` | Returnera som text |
| `/{c}/export/{name}.idt` | `text/plain` | Returnera som text |
| `/{c}/export/{name}.jidf` | `text/plain` | Returnera som text |
| `/{c}/export/{name}.sig` | `application/force-download` (binary) | Returnera base64 |
| `/{c}/export/{name}.stw` | `application/zip` | Returnera base64 |
| `/{c}/export/{name}.zip` | `application/zip` | Returnera base64 |

### Import

| Endpoint | Content-Type | Hantering |
|----------|--------------|-----------|
| `/{c}/import/{filename}` (zip/cab/udf/cap/bup) | `multipart/form-data` | base64-innehåll |
| `/{c}/import/{name}.idf` | `text/plain` | IDF-text direkt |
| `/{c}/import/{name}.idt` | `application/json` | IDT-text direkt |
| `/{c}/import/{name}.jidf` | `application/json` | JIDF-text direkt |

Zip-import är asynkron och returnerar ett UUID i `UUID`-headern. Pollning via `/{c}/checkimport/{uuid}`.

---

## 7. Teststrategi

### Säkra READ-only-endpoints:
- `GET /api/containers`, `/api/container/{name}`, `/{c}/idfs`, `/{c}/idts`, `/{c}/epms`, `/{c}/fpms`, `/{c}/about`, `/{c}/certs`
- `POST /api/authenticate`, `GET /api/verify`

### Destruktiva operationer:
- Kräver `ELIAS_TEST_CONTAINER` (dedikerad testcontainer)
- `cleanup` kräver `confirm=true`

---

## 8. Övriga beslut

### MongoDB-serverfält (strip vid PUT)
ELIAS returnerar MongoDB-interna fält vid GET som INTE ska skickas tillbaka i PUT: `_id`, `__v`, `usedContainer`, `author`, `created`, `modified`, `conflicts`, `locked`.

### packageSize är i bytes
`FpmPackage.packageSize` från `GET /{c}/fpms` är redan i bytes. Skall INTE multipliceras med 1024.

### IDF POST — skapande
`POST /{c}/idfs` skapar IDF-post i databasen. `resolveAndSave` anropas sedan med `overwrite: true` för att fylla i den kompletta EPM-strukturen.

### accessControls
`/api/accessControls` — token skickas via `x-access-token`-header (inte query-param).
