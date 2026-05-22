# Security Review — 2026-05-22

## Fas: Design

## Status: SECURITY: APPROVED

---

## Godkänt

### Credential-hantering
- `~/.elias-mcp.json` skapas med `mode: 0o600` (identiskt med ScoutMCP)
- Credentials lagras i runtime-session eller persisted fil — aldrig i kod, git eller env-filer med riktiga värden
- `.env.example` innehåller bara platshållarvärden
- Password exponeras INTE i `action=status`-svar (bara username och baseUrl)

### Token-hantering
- Token transporteras som `x-access-token` header — aldrig i URL/query-params
- accessControls-endpoints: design-decisions.md anger header-first med fallback — godkänt under förutsättning att token ALDRIG hamnar i URL-logg. Om servern kräver query-param för accessControls måste detta tydligt dokumenteras och token ska redact:as ur ev. loggar.
- Token loggas aldrig (implementeras med samma mönster som ScoutMCP)
- Re-auth vid 401 med max ett retry — korrekt

### TLS
- HTTPS krävs (EliasClient kastar vid non-HTTPS om ignoreTls=false)
- `ELIAS_IGNORE_TLS=true` tillåts explicit — acceptabelt för self-signed i interna nätverk
- undici Agent med `rejectUnauthorized: false` används bara när `ignoreTls` är aktivt

### Input-validering
- Alla tool-inputs valideras med Zod (identiskt mönster med ScoutMCP)
- Path-parametrar (containerName, imageName) ska sanitiseras mot path traversal — design nämner detta under importverktyg

### Binär data / export/import
- Base64 för zip/binary — korrekt, inga säkerhetsrisker identifierade
- FormData för zip-import — korrekt

### Destruktiva operationer
- Import med `force: boolean` är separerat — godkänt
- Async import returnerar UUID, ingen direktdestruktion

---

## Krav som MÅSTE uppfyllas i implementationen (blockerar Fas 2)

1. **Path traversal-skydd**: containerName och imageName måste valideras med Zod `.regex(/^[a-zA-Z0-9._-]+$/)` — inga slash, inga `..`
2. **Token aldrig i URL**: Om accessControls-endpoints kräver `?token=<value>`, ska en tydlig kommentar markera detta som API-krav (inte ett val)
3. **Password maskas** i configure-verktygets `action=status`-svar
4. **Stack traces** exponeras aldrig till MCP-klienten (index.ts catch-block)
5. **Filnamn i import** valideras mot lista av tillåtna extensions: `.idf`, `.idt`, `.jidf`, `.zip`, `.cab`, `.udf`, `.cap`, `.bup`

---

## Noteringar (rekommendationer, blockerande ej)

- HTTP-varning (inte bara HTTPS-krav) rekommenderas som console.warn, inte fel — designdokumentet nämner detta korrekt
- `ELIAS_REQUEST_TIMEOUT_MS` bör ha övre gräns (t.ex. 300 000 ms) för att undvika resursläckor
- `requestBinary` bör sätta Content-Length-kontroll om servern returnerar stora filer

---

# Security Review — 2026-05-22 (Fas 2: Kodgranskning)

## Fas: Kod

## Status: SECURITY: FINAL APPROVED

---

## Godkänt

### client.ts

| Punkt | Kontroll | Utfall |
|-------|----------|--------|
| Token-transport | `x-access-token` header i `authHeaders()` — alla metoder | ✓ |
| Token i URL | Ingen query-param, inget `?token=` förekommer | ✓ |
| 401-retry | `isRetry`-flag, max ett försök per request | ✓ |
| TLS | `rejectUnauthorized: false` sätts **enbart** när `ignoreTls === true` | ✓ |
| HTTPS-krav | Konstruktorn kastar `EliasError` vid `http://` om inte `ignoreTls=true` | ✓ |
| Timeout | `AbortController` med `clearTimeout`, övre gräns `Math.min(parsed, 300_000)` | ✓ |
| Felmeddelanden | `tryParseError` returnerar bara `message`-fältet — ingen intern sökväg läcker | ✓ |
| Token loggas ej | Token förekommer i inga `console.*`-anrop eller fel-strängar | ✓ |

### session.ts

| Punkt | Kontroll | Utfall |
|-------|----------|--------|
| Filrättigheter | `writeFileSync(..., { mode: 0o600 })` — ägaren läser/skriver, ingen annan | ✓ |
| Prioritetsordning | Session → env-vars → sparad fil | ✓ |
| Credentials i minnet | Aldrig i `console.*`, aldrig i undantag | ✓ |

### configure.ts

| Punkt | Kontroll | Utfall |
|-------|----------|--------|
| Password i status-svar | `action=status` returnerar `baseUrl`, `username`, `domain`, `ignoreTls`, `hasSavedFile` — inget `password` | ✓ |
| Password i set-svar | Returnerar `baseUrl`, `username` — inget `password` | ✓ |
| HTTP-varning | `process.stderr.write(...)` triggas vid `http://`-URL | ✓ |
| Anslutningstest | `err.message` fångas — ingen stacktrace exponeras | ✓ |

### import.ts

| Punkt | Kontroll | Utfall |
|-------|----------|--------|
| Arkiv-extensions | Valideras mot `ALLOWED_ARCHIVE_EXTENSIONS = ['.zip', '.cab', '.udf', '.cap', '.bup']` | ✓ |
| Bild-extensions | Härleds från action-enum `idf`/`idt`/`jidf` — ej användarinput | ✓ |
| Filnamn `filename` | `SafeFilename` regex `^[a-zA-Z0-9._-]+$` | ✓ |
| Bildnamn `name` | `ImageName` regex, samma mönster | ✓ |
| Force-prefix | Hårdkodad sträng `'/force'` — ej användarinput | ✓ |
| `encodeURIComponent` | Används på `container`, `filename` och `name` i URL | ✓ |

### index.ts

| Punkt | Kontroll | Utfall |
|-------|----------|--------|
| Stack traces | `err instanceof Error ? err.message : 'An unexpected error occurred'` — stack aldrig med | ✓ |
| Interna sökvägar | Inga `__dirname`, `process.cwd()` eller filsystemsökvägar i felmeddelanden | ✓ |
| Okänt tool-name | Returnerar `isError: true` med generellt meddelande | ✓ |

### Fas 1-krav verifierade i kod

Alla fem blockeringskrav från Fas 1 är implementerade:

1. **Path traversal-skydd** — `ContainerName`, `ImageName`, `SafeFilename` med `^[a-zA-Z0-9._-]+$` i `types.ts`, importeras och används i alla tools
2. **Token aldrig i URL** — `accessControls`-endpoints använder header, ingen query-param i kod
3. **Password maskas** i `configure.ts status`-svar ✓
4. **Stack traces** exponeras ej i `index.ts` catch-block ✓
5. **Filextension-lista** i `import.ts` ✓

---

## Fixat under denna granskning

### F1 — access.ts: `id` saknade regex (fixat)
`action=delete` skickade `id` utan validering — `..` i URL-segment kan på vissa HTTP-ramverk resolvera till överordnat path. Åtgärd: `z.string().regex(/^[a-zA-Z0-9._-]+$/)` tillagt.

### F2 — configure.ts: ingen HTTP-varning (fixat)
`http://`-URL sparades tyst. Åtgärd: `process.stderr.write(...)` vid HTTP-konfigurering.

---

## Noteringar (icke-blockerande)

- **Privat nyckel i cert-svar**: `elias_certificates action=get` returnerar hela cert-objektet från ELIAS inkl. eventuell `privateKey`-fält. Designbeslut — användaren begärde datan explicit. Risk: privat nyckel kan synas i AI-agentens konversationslogg. Accepterad och dokumenterad.
- **baseUrl måste inkludera `/api`**: Klienten adderar inget `/api`-prefix — `ELIAS_BASE_URL` måste sluta med `/api`. `.env.example` och `configure.ts`-beskrivningen anger detta korrekt. Ingen säkerhetsrisk men vanlig felkonfiguration.

---

_Säkerhetsagenten — 2026-05-22. Integrationstester: 16/16 gröna mot live-server. `npm run build`: 0 fel._
