# EliasMCP — Arkitektoniska beslut

_Skrivet av Arkitekten. Skickat till Säkerhet för granskning innan implementationen startar._

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

**OBS:** ELIAS-servern kan köra HTTP (inte bara HTTPS) — `baseUrl` valideras för att acceptera `http://` om ELIAS_IGNORE_TLS=true, men vi rekommenderar starkt HTTPS. Klienten ska stödja båda, men varna vid HTTP.

---

## 2. URL-routing — dubbel baseUrl-strategi

ELIAS har **två kategorier** av endpoints med olika URL-prefix:

### API-routes (alla utom eLux):
```
ELIAS_BASE_URL/api/<path>
Ex: https://elias.example.com:22130/api/authenticate
Ex: https://elias.example.com:22130/api/containers
Ex: https://elias.example.com:22130/api/{container}/idfs
```

### eLux-routes (filserving för tunna klienter):
```
ELIAS_BASE_URL/<container>/<filename>
Ex: https://elias.example.com:22130/{container}/container.ini
Ex: https://elias.example.com:22130/{container}/{imageName}.idf
```

**Beslut:** `EliasClient` exponerar **två request-metoder**:
```typescript
// Alla API-routes — prefixar automatiskt med /api
request<T>(method, path, body?): Promise<T>
  // path = "/{container}/idfs" → URL = baseUrl + "/api" + path

// eLux-routes — ingen prefix
requestElux<T>(method, path): Promise<T>
  // path = "/{container}/container.ini" → URL = baseUrl + path
```

Alternativt kan vi ha ett flag `{ elux: true }` i request-optionerna. Den separata metoden är tydligare och eliminerar risken för fel.

### Routes som är eLux (ingen /api-prefix):
- `/{container}/container.ini`
- `/{container}/{imageName}.idf` (eLux-variant, inte `/idf/{name}.idf`)
- `/{container}/{filename}.sig`
- `/{container}/{filename}` (generisk filserving)

Dessa implementeras INTE som MCP-verktyg (de används av tunna klienter, inte av AI-agenter). Vi implementerar dem inte om de inte behövs.

### Routes med /api-prefix (implementeras som MCP-verktyg):
Alla övriga routes i openapi.json — containers, images, templates, packages, certificates, solve, export, import, access control, about.

---

## 3. Export/Import — binär data och zip-filer

### Export
Export-endpoints returnerar olika content-types:

| Endpoint | Content-Type | Hantering |
|----------|--------------|-----------|
| `/{container}/export/container` | `application/zip` | Returnera base64 till MCP-klient |
| `/{container}/export/{name}.idf` | `text/plain` | Returnera som text |
| `/{container}/export/{name}.idt` | `text/plain` | Returnera som text |
| `/{container}/export/{name}.jidf` | `text/plain` | Returnera som text |
| `/{container}/export/{name}.sig` | `application/force-download` (binary) | Returnera base64 |
| `/{container}/export/{name}.stw` | `application/zip` | Returnera base64 |
| `/{container}/export/{name}.zip` | `application/zip` | Returnera base64 |

**Beslut:** 
- Text-responses (IDF, IDT, JIDF): returneras som text direkt i MCP-svaret
- Binära responses (zip, sig, stw): returneras som base64-sträng i MCP-svaret, med tydlig metadata om filtyp och filnamn
- `EliasClient` exponerar `requestBinary(method, path): Promise<{ data: Buffer; contentType: string }>` för binära responses

### Import
Import-endpoints accepterar olika content-types:

| Endpoint | Content-Type | Hantering |
|----------|--------------|-----------|
| `/{container}/import/{filename}` (zip/cab/udf/cap/bup) | `multipart/form-data` | MCP-verktyg tar filinnehåll som base64 |
| `/{container}/import/{name}.idf` | `text/plain` | MCP-verktyg tar IDF-text direkt |
| `/{container}/import/{name}.idt` | `application/json` (men egentligen text) | MCP-verktyg tar IDT-text direkt |
| `/{container}/import/{name}.jidf` | `application/json` (men egentligen text) | MCP-verktyg tar JIDF-text direkt |

**Beslut:**
- Import av zip/cab/etc: MCP-verktyg tar `fileContentBase64: string` + `filename: string` — klienten avkodar base64, skapar FormData med `zip`-fält
- Import av IDF/IDT/JIDF: MCP-verktyg tar `content: string` (filinnehåll som text)
- Force-varianter (overwrite=true) hanteras med `force: boolean`-parameter
- Asynkron import (zip): response innehåller UUID i header — vi returnerar UUID och låter användaren anropa `elias_import` med `action=check_status` och UUID

### Async import-status
Zip-import är asynkron och returnerar ett UUID i `UUID`-headern. MCP-verktyget:
1. Skickar filen
2. Hämtar UUID från response-header
3. Returnerar `{ importId: uuid, status: "pending", message: "..." }`
4. Separata anrop med `action=check_status&importId=<uuid>` pollar `/{container}/checkimport/{uuid}`

---

## 4. Teststrategi

### Säkra att testa mot live-server (READ-only):
- `GET /api/containers` — listar containers
- `GET /api/container/{name}` — validerar om container finns
- `GET /api/{container}/idfs` — listar images
- `GET /api/{container}/idts` — listar templates
- `GET /api/{container}/epms` — listar EPMs
- `GET /api/{container}/fpms` — listar FPMs
- `GET /api/{container}/about` — copyright/version-info
- `GET /api/{container}/certs` — listar certifikat
- `GET /api/verify?token=<token>` — token-validering
- `POST /api/authenticate` — inloggning (ofarlig)

### Kräver försiktighet (skrivoperationer):
- Skapa/byta namn på/ta bort containers — ALDRIG i test utan en dedikerad testcontainer
- Skapa/uppdatera/ta bort IDF/IDT — använd testcontainer
- Import av paket — använd testcontainer

### Testsstrategi (implementeras av QA):
- Integration tests kör mot live-server om `ELIAS_BASE_URL` är satt, annars hoppas över
- Alla destruktiva tester kräver `ELIAS_TEST_CONTAINER` (en dedikerad container som får förstöras)
- Read-only tester kräver bara `ELIAS_TEST_CONTAINER` för att ha en giltig container att läsa från
- Ingen mocking — samma princip som ScoutMCP

### Miljövariabler för tester:
```
ELIAS_BASE_URL         # Obligatorisk för alla tester
ELIAS_USERNAME
ELIAS_PASSWORD
ELIAS_DOMAIN
ELIAS_IGNORE_TLS
ELIAS_TEST_CONTAINER   # Container som tester läser från och skriver till
```

---

## 5. Övriga beslut

### Token i accessControls/accessControl
OpenAPI-specen visar att `/api/accessControls` tar `token` som query-parameter. Detta är inkonsekvent med övriga routes som tar `x-access-token` som header. 

**Beslut:** Skicka token i header (`x-access-token`) för alla routes — servern verkar acceptera båda formaten. Om det inte fungerar, falla tillbaka på query-param för just dessa endpoints.

### IDF POST — skapande
Det finns INGEN `POST /{container}/idf/{name}.idf` — nya images skapas via `POST /{container}/idfs` med `{ overwrite: false, idf: {...} }`. Uppdatering sker via `PUT /{container}/idf/{name}.idf`.

### packagecontains
`POST /{container}/packagecontains` — hittar vilket paket som innehåller en viss fil. Läggs in i `elias_packages`-verktyget.

### cleanup
`DELETE /{container}/cleanup` — tar bort oanvända EPMs/FPMs. Läggs in i `elias_packages`-verktyget.

### Filformat i URL — AVVIKELSE FRÅN OPENAPI-SPEC (verifierat mot live-server 2026-05-22)

OpenAPI-spec anger `/{container}/idf/{imageName}.idf` men den faktiska servern beter sig annorlunda:

| Endpoint | Spec | Faktisk server | Notering |
|----------|------|----------------|----------|
| GET enskild IDF | `/{container}/idf/{name}.idf` | `/{container}/idf/{name}` | Med `.idf` → returnerar `[]` |
| PUT (uppdatera IDF) | `/{container}/idf/{name}.idf` | `/{container}/idf/{name}` | Extension i URL → 404 |
| DELETE IDF | `/{container}/idf/{name}.idf` | `/{container}/idf/{name}` | Extension i URL → 404 |
| GET enskild IDT | `/{container}/idt/{name}.idt` | `/{container}/idt/{name}` | Samma mönster |
| PUT/DELETE IDT | `/{container}/idt/{name}.idt` | `/{container}/idt/{name}` | Samma mönster |
| GET sign IDF | `/{container}/sign/{name}.idf` | `/{container}/sign/{name}.idf` | Extension KRÄVS här |
| POST lock IDF | `/{container}/lock/{name}.idf` | `/{container}/lock/{name}.idf` | Extension KRÄVS här |

**Regel:** Extensionen i URL gäller bara för `sign/` och `lock/` — INTE för `idf/` och `idt/` enskilda resurser.

**GET returnerar array:** `GET /{container}/idf/{name}` returnerar `[{id, name, ...}]` (array), inte ett enskilt objekt. Tom array `[]` = inte hittat (ingen 404). Implementationen unwrappar första elementet och returnerar `fail()` vid tom array.

---

## Nästa steg

1. **Säkerhet granskar detta dokument** → skriver "SECURITY: APPROVED" i `.agents/security-review.md`
2. **Utvecklare implementerar** i ordning:
   - `src/types.ts` (kopia från ScoutMCP med `ok()`, `fail()`, `buildQuery()`)
   - `src/session.ts` (EliasConfig, ~/.elias-mcp.json)
   - `src/client.ts` (EliasClient med dual-URL-strategi)
   - `src/tools/configure.ts`
   - `src/tools/containers.ts`
   - `src/tools/images.ts` + `src/tools/templates.ts`
   - `src/tools/packages.ts`
   - `src/tools/certificates.ts`
   - `src/tools/solve.ts`
   - `src/tools/export.ts`
   - `src/tools/import.ts`
   - `src/tools/access.ts`
   - `src/tools/about.ts`
   - `src/index.ts` (MCP server bootstrap)
3. **QA testar löpande** och skriver PR-filer
