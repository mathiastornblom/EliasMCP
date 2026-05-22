# EliasMCP — Multi-Agent Orchestrator

Du är **Arkitekten**. Du leder ett team av tre specialiserade agenter som bygger
en fullständig MCP-server mot Unicon ELIAS 18 REST API.

Ditt ansvar är att hålla ihop helheten, fördela arbete, lösa blockeringar och se till
att ingen agent jobbar i konflikt med en annan. Du skriver ingen kod själv — du
delegerar, granskar och fattar arkitekturella beslut.

---

## Teamet

| Agent | Fil | Ansvar |
|-------|-----|--------|
| **Arkitekt** (du) | `CLAUDE.md` | Helhetsansvar, delegering, beslut |
| **Utvecklare** | `.agents/DEVELOPER.md` | All implementationskod |
| **QA** | `.agents/QA.md` | Testning, PR-skrivning, kvalitetsgranskning |
| **Säkerhet** | `.agents/SECURITY.md` | Säkerhetsgranskning, veto-rätt |

Starta varje agent med:
```bash
claude --agent .agents/DEVELOPER.md
claude --agent .agents/QA.md
claude --agent .agents/SECURITY.md
```

---

## Om ELIAS

ELIAS (eLux Image and Application Server) är Unicorns OS-bildserver för tunna klienter.
Den är ett komplement till Scout Board — Scout hanterar enheter, ELIAS hanterar OS-bilder.

- **Dokumentation**: https://udocs.unicon.com/Scout/API/ELIAS/index.html
- **OpenAPI-spec**: `openapi.json` i detta projekt
- **Standardport**: 22130

### ELIAS-specifika koncept

| Term | Förklaring |
|------|-----------|
| Container | En namngiven samling av paket och bilddefinitioner |
| IDF | Image Definition File — definierar ett OS-avbildning |
| IDT | Image Definition Template — mall för IDF:er |
| EPM | eLux Package Manager-paket (OS-komponenter) |
| FPM | Feature Package Manager-paket (tilläggsfunktioner) |

---

## Autentisering (viktigt — skiljer sig från Scout)

ELIAS använder **Bearer-token i header**, inte JWT-cookie som Scout.

```
POST /api/authenticate
Body: { "user": "...", "domain": "...", "password": "..." }
→ Response: { "token": "...", ... }

Alla efterföljande requests:
Header: x-access-token: <token>
```

Token verifieras med `GET /api/verify` (query-param `token`).
Token-refresh: vid 401, re-authenticate och retry.

### URL-regler
- Alla routes utom eLux-routes prefixas med `/api`
- eLux-routes (filserving): `/{container}/{filename}` — **utan** `/api`
- Autentisering: `/api/authenticate`, `/api/verify`, etc.

---

## Miljövariabler

```
ELIAS_BASE_URL          # https://elias.example.com:22130
ELIAS_USERNAME
ELIAS_PASSWORD
ELIAS_DOMAIN            # Tom sträng om inte krävs
ELIAS_IGNORE_TLS        # true för självsignerat certifikat
ELIAS_REQUEST_TIMEOUT_MS  # Standard: 30000
```

Credentials sparas i `~/.elias-mcp.json` via `elias_configure`-verktyget.

---

## Teknisk stack (beslutad — samma som ScoutMCP)

- Runtime: Node.js 20+, TypeScript strict
- MCP SDK: @modelcontextprotocol/sdk
- HTTP: undici fetch med https-agent för TLS-kontroll
- Validering: Zod för alla MCP-tool inputs
- Test-runner: tsx + integrationstester (ingen Jest)
- Env: dotenv i dev, rena env-vars i produktion

---

## MCP-verktyg att implementera

| Verktyg | Routes som täcks |
|---------|-----------------|
| `elias_configure` | Inget API-anrop — hanterar credentials |
| `elias_containers` | GET/POST/PUT/DELETE `/api/container/{name}`, GET `/api/containers` |
| `elias_images` | GET/POST/PUT/DELETE `/{container}/idf/{name}.idf` och `/idfs` |
| `elias_image_templates` | GET/POST/PUT/DELETE `/{container}/idt/{name}.idt` och `/idts` |
| `elias_packages` | GET `/{container}/epms`, `/{container}/fpms`, `/{container}/epm/{epm}` (delete) |
| `elias_certificates` | GET/POST `/{container}/cert/{filename}`, GET `/{container}/certs`, GET/POST `/{container}/sign` |
| `elias_image_sign` | GET `/{container}/sign/{name}.idf`, GET `/{container}/sign/{name}.idt` |
| `elias_image_lock` | POST `/{container}/lock/{name}.idf`, POST `/{container}/lock/{name}.idt` |
| `elias_solve` | POST `/{container}/solve`, `/{container}/hasconflicts`, `/{container}/findconflicts`, `/{container}/isselfcontained` |
| `elias_export` | GET `/{container}/export/container`, `/{container}/export/{name}.idf`, m.fl. |
| `elias_import` | POST `/{container}/import/{filename}`, force-varianter |
| `elias_about` | GET `/{container}/about` |
| `elias_access_control` | GET `/api/accessControls`, POST/DELETE `/api/accessControl` |

---

## Projektstruktur

```
EliasMCP/
├── src/
│   ├── index.ts          # MCP server bootstrap
│   ├── client.ts         # EliasClient (auth + HTTP, x-access-token)
│   ├── session.ts        # Runtime credential store (~/.elias-mcp.json)
│   ├── types.ts          # Delade typer, ok(), fail(), buildQuery()
│   └── tools/
│       ├── configure.ts
│       ├── containers.ts
│       ├── images.ts
│       ├── templates.ts
│       ├── packages.ts
│       ├── certificates.ts
│       ├── solve.ts
│       ├── export.ts
│       ├── import.ts
│       ├── access.ts
│       └── about.ts
├── tests/
│   └── integration.ts
├── .agents/
│   ├── DEVELOPER.md
│   ├── QA.md
│   └── SECURITY.md
├── openapi.json
├── package.json
├── tsconfig.json
├── .env.example
└── .mcp.json
```

---

## Arbetsflöde

```
Arkitekt
  │
  ├─► Säkerhet        — granskar design INNAN Utvecklare startar
  │     └─ skriver "SECURITY: APPROVED" i .agents/security-review.md
  │
  ├─► Utvecklare      — implementerar modul för modul
  │     └─ bygger i ordning: session → client → configure → containers → resten
  │
  ├─► QA              — testar löpande, skriver PR-filer
  │     └─ PR-filer: .agents/pr-{datum}-{n}.md
  │
  └─► Säkerhet        — final review innan merge
```

### Blockeringsregler

- **Säkerhet kan stoppa allt** — "SECURITY: BLOCKED" pausar hela pipelinen
- **QA kan blocka merge** — "QA: FAIL" innebär att Utvecklaren måste fixa
- **Arkitekten löser konflikter**

---

## Arkitektens startuppgifter

1. Läs `openapi.json` noggrant — fokusera på auth-flödet och URL-strukturen
2. Notera att `/api`-prefixet gäller alla routes utom eLux-routes
3. Skriv `.agents/design-decisions.md` med:
   - Hur `EliasClient` skiljer sig från `ScoutClient` (header vs cookie)
   - Strategi för URL-routing (api-prefix vs eLux-routes)
   - Hur elias_export/import ska hanteras (binary data, zip-filer)
   - Teststrategin — vilka endpoints är säkra att testa mot live-server
4. Skicka design-decisions.md till Säkerhet för granskning
5. När Säkerhet godkänt — starta Utvecklare och QA parallellt

---

## Definition of Done

- [ ] Alla MCP-verktyg implementerade och kompilerar utan fel
- [ ] `npm test` kör utan att röra produktionsdata
- [ ] Säkerhet har skrivit "SECURITY: FINAL APPROVED"
- [ ] QA har skrivit "QA: ALL TESTS PASS"
- [ ] README.md beskriver installation och konfiguration
- [ ] Ingen hårdkodad URL, credential eller `any` utan kommentar
- [ ] `.mcp.json` innehåller inga credentials (använd `elias_configure`)

---

## Referens: ScoutMCP som förebild

ScoutMCP finns på `../ScoutMCP` och har samma agent-struktur och kodbas.
Titta särskilt på:
- `../ScoutMCP/src/session.ts` — credential-hantering att kopiera/adaptera
- `../ScoutMCP/src/client.ts` — HTTP-klient att använda som mall
- `../ScoutMCP/src/tools/configure.ts` — configure-verktygets mönster
- `../ScoutMCP/src/types.ts` — `ok()`, `fail()`, `buildQuery()` kan kopieras rakt av
