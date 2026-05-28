# QA Status

**Datum: 2026-05-22**

## Testmiljö

```
ELIAS_BASE_URL=https://elias.example.com:22130/api
ELIAS_USERNAME=admin
ELIAS_IGNORE_TLS=true
ELIAS_TEST_CONTAINER=mcp-test
```

## Testresultat — 16/16 PASS

### Authentication
- [x] Login returns token
- [x] Verify token endpoint

### Read-only (global)
- [x] List containers (8 containers hittades)

### Container-scoped read-only
- [x] Check container exists
- [x] List images (idfs)
- [x] List templates (idts)
- [x] List EPMs
- [x] List FPMs
- [x] List certificates
- [x] Get about info

### Error handling
- [x] Non-existent container → EliasError 400/404

### Destructive (IDF CRUD)
- [x] Create test image (id: mcp-test-image)
- [x] Get created image
- [x] Delete created image
- [x] Confirm image is gone (server returns [])

### Ej testat
- [ ] 401 retry-flöde (kod korrekt, ej live-testat)

## Buggar hittade och fixade

Se `.agents/pr-2026-05-22-1.md` för fullständig redogörelse av initial release.

| Bug | Session | Status |
|-----|---------|--------|
| Container saknades på server | 2026-05-22 | FIXAT |
| `containerCreatedByTest` ReferenceError | 2026-05-22 | FIXAT |
| Double `/api` i URL (client.ts) | 2026-05-22 | FIXAT |
| IDF saknade `id`-fält | 2026-05-22 | FIXAT |
| `_id` vs `id`/`name` (MongoDB ObjectId) | 2026-05-22 | FIXAT |
| `imageSize` saknades → "NaN und..." i UI | 2026-05-23 | FIXAT |
| `selfContained` saknades → Bilder "Incomplete" | 2026-05-23 | FIXAT |
| Template-fält saknades → "NaN und..." i UI | 2026-05-23 | FIXAT |

## Manuella verifieringar 2026-05-23

### MCPTest (Image) — selfContained + imageSize
- Skapad via `elias_images` action=create i container `uc-elux7-2509`
- Verifierat i UI: storlek visar "1.08 GB" (inte "NaN und...")
- Verifierat i API-svar: `selfContained: true` och `legacyIDF` finns
- Verifierat: `resolveAndSave` anropar `/solve`, `/epms`, `/fpms`, `/about` parallellt

### MCPTestTemplate (Template) — korrekt IDT-struktur
- Skapad via `elias_image_templates` action=create i container `uc-elux7-2509`
- Baserad på MCPTestUITemplate (tre EPMs, tre FPMs valda i UI)
- Verifierat i UI: storlek visar korrekt (inte "NaN und...")
- Verifierat: `isTemplate: true`, `selfContained: false`, `imageSize: 0`

### EPM multi-version detektion
- `findMultiVersionGroups()` rapporterar EPM-grupper med fler än en version
- Svaret inkluderar `multipleVersionsAvailable` med alla versioner per grupp
- Verifierat fungerar korrekt mot live-server

## Avvikelse: serverfält saknas i OpenAPI

Servern returnerar `_id`, `locked`, `usedContainer`, `fpmGroups`, `__v` — inte dokumenterade i `openapi.json`. Inte blockerande.

## Kritisk avvikelse: IDT-endpoints kräver .idt-suffix

OpenAPI-specen dokumenterar `/idts` för skapa (POST) och `/idt/{name}` utan extension för GET/PUT/DELETE. **VERIFIERAT på live-server:** Extension `.idt` krävs i URL för GET enskild IDT, PUT och DELETE. `GET /{c}/idt/{name}.idt` returnerar array `[{...}]` — unwrappa `[0]`. Se `design-decisions.md` sektion 2.

## Status: QA: ALL TESTS PASS

Initial 16 tester gröna (2026-05-22). Bugfixar från 2026-05-23 verifierade manuellt mot live-server.
