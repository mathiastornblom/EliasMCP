# QA Status

**Datum: 2026-05-22**

## Testmiljö

```
ELIAS_BASE_URL=https://scoutsrv.tornbloms.net:443/elias/api
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

Se `.agents/pr-2026-05-22-1.md` för fullständig redogörelse.

| Bug | PR | Status |
|-----|----|--------|
| Container saknades på server | pr-2026-05-22-1 | FIXAT |
| `containerCreatedByTest` ReferenceError | pr-2026-05-22-1 | FIXAT |
| Double `/api` i URL (client.ts) | pr-2026-05-22-1 | FIXAT |
| IDF saknade `id`-fält | pr-2026-05-22-1 | FIXAT |
| `_id` vs `id`/`name` (MongoDB ObjectId) | pr-2026-05-22-1 | FIXAT |

## Avvikelse: serverfält saknas i OpenAPI

Servern returnerar `_id`, `locked`, `usedContainer`, `fpmGroups`, `__v` — inte dokumenterade i `openapi.json`. Inte blockerande.

## Status: QA: ALL TESTS PASS

Alla 16 tester gröna. Nästa steg: Säkerhet Fas 2 (final code review).
