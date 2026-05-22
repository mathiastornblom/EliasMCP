# Developer Status

**Datum: 2026-05-23**

## Klart

- `src/types.ts` — ok(), fail(), buildQuery(), ContainerName, ImageName, SafeFilename validators
- `src/session.ts` — EliasConfig, ~/.elias-mcp.json, resolveConfig()
- `src/client.ts` — EliasClient med x-access-token header, dual URL-strategi (/api prefix), requestBinary, requestText, requestMultipart, 300k timeout-cap
- `src/tools/configure.ts` — elias_configure (set/status/clear), testar anslutning vid set
- `src/tools/containers.ts` — elias_containers (list/check/create/rename/delete)
- `src/tools/images.ts` — elias_images (list/get/create/update/delete/sign/lock) — **uppdaterad 2026-05-23**
- `src/tools/templates.ts` — elias_image_templates (list/get/create/update/delete/sign/lock) — **uppdaterad 2026-05-23**
- `src/tools/packages.ts` — elias_packages (list-epms/list-fpms/delete-epm/cleanup/package-contains)
- `src/tools/certificates.ts` — elias_certificates (list/get/save/get-signing/save-signing)
- `src/tools/solve.ts` — elias_solve (solve/has-conflicts/find-conflicts/is-self-contained)
- `src/tools/export.ts` — elias_export (container/idf/idt/jidf/sig/stw/zip)
- `src/tools/import.ts` — elias_import (zip/idf/idt/jidf/check-status)
- `src/tools/about.ts` — elias_about
- `src/tools/access.ts` — elias_access_control (list/set/delete)
- `src/index.ts` — MCP server bootstrap
- `npm run build` — kompilerar utan fel

## Buggar fixade 2026-05-23

### Bug 1 — imageSize saknas i IDF (images.ts)
**Symptom:** UI visar "NaN und..." i storlekskolumnen för MCP-skapade bilder.
**Orsak:** `resolveAndSave()` skickade inte `imageSize`-fältet i PUT-kroppen. ELIAS beräknar inte detta automatiskt — klienten måste beräkna och skicka det.
**Fix:** Beräkna `imageSize = sum(fpm.size för selected FPMs)` och inkludera i `finalIdf`. `fpm.size` mappas från `fpm.packageSize` i `/fpms`-svaret, som är i bytes (inte KB).

### Bug 2 — selfContained hanterades fel (images.ts)
**Symptom:** Bilder skapade via MCP visades som "Incomplete" i UI och saknade `legacyIDF`.
**Orsak:** `selfContained: true` saknades i PUT-kroppen. ELIAS beräknar `legacyIDF` ENDAST när klienten skickar `selfContained: true` — det är ett klient-tillhandahållet fält, inte serverberäknat.
**Fix:** `finalIdf` inkluderar nu alltid `selfContained: true`. Detta är ett icke-förhandlingsbart krav.

### Bug 3 — Template-fält saknas (templates.ts)
**Symptom:** Mallar skapade via MCP visade "NaN und..." i UI och hade felaktigt beteende.
**Orsak:** Fälten `isTemplate`, `selfContained`, `imageSize`, `conflicted`, `hasMissing` saknades i PUT/POST-kroppen.
**Fix:** `saveTemplate()` injicerar alltid dessa fält med korrekta värden för IDT:
```typescript
{ isTemplate: true, selfContained: false, imageSize: 0, conflicted: false, hasMissing: false, ...idfInput }
```

### Feature — EPM-version-detektion för templates (templates.ts)
**Bakgrund:** En IDT:s `epmGroups` accepterar antingen gruppnamn (`"baseos"`) för flexibel/senaste-version, eller exakt EPM-ID (`"baseos-7.2509.0-4.UC_ELUX7-1.0.epm"`) för pinnad version.
**Implementering:** `findMultiVersionGroups()` hämtar alla EPMs och rapporterar vilka grupper som har fler än en version i containern. Körs parallellt med spara-anropet. Svaret inkluderar `multipleVersionsAvailable` och en `note` så att Claude kan fråga användaren om de vill pinna versionen.

## Säkerhetskrav uppfyllda

- Path traversal-skydd: ContainerName, ImageName, SafeFilename validators med /^[a-zA-Z0-9._-]+$/
- Token aldrig i URL (x-access-token header)
- Password maskas i configure status-svar
- Stack traces aldrig exponerade (index.ts catch-block)
- Filnamnsvalidering i import: ALLOWED_ARCHIVE_EXTENSIONS och ALLOWED_IMAGE_EXTENSIONS
- Timeout max 300,000ms
- cleanup kräver confirm=true

## Kritisk regel (stop-hook)

**En Image får ALDRIG skapas eller uppdateras utan att bli selfContained.**
`resolveAndSave()` skickar alltid `selfContained: true` i PUT-kroppen. Detta är arkitektens beslut och får inte ändras utan explicit godkännande.
