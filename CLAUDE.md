# wad-jwt — "How To Mess Up JWTs" Workshop

Expanding a 45-minute conference talk into a 2-hour hands-on security workshop.

## Existing assets

- **Slide deck**: `How_To_Mess_Up_JWTs.pptx` — 14 slides, 5 numbered "mess up" pillars plus intro/outro.
  This is the 45-min talk and stays largely as-is. It's the "recap" portion of each workshop
  block — do NOT add new slides for deep-dive content; that lives in code and facilitator notes.
- **Base lab repo**: [generating-jwt/](generating-jwt/) —
  TypeScript toolkit generating JWTs three ways: unsigned (`alg: none`), HMAC-signed, RSA-signed,
  built from shared `data.ts` payload (includes a `sensitivePayload` variant). No verification
  code exists in it — it only makes tokens, doesn't check them.
- **Backup reference doc**: `jwt-workshop-receipts.md` — 6-7 real, named, sourced security incidents
  (Auth0/2015 alg-confusion disclosure, CVE-2022-23529 jsonwebtoken RCE, CVE-2022-21449 Java
  "Psychic Signatures", CVE-2023-22482 Argo CD missing `aud` check, Kubernetes service-account
  JWT theft in 2025-26 React2Shell campaigns, etc). Q&A ammunition only — explicitly NOT slide
  content. Talk philosophy is vibes-driven / meme-structured with no data on slides; this doc
  exists purely to back up claims if challenged live.

## Workshop structure (2 hours)

5 existing pillars as the spine, each turned into a ~15-18 min block:
1. Short slide recap (2-3 min) — reuse existing deck content
2. Live-vulnerable code demo (attack it)
3. Hands-on exercise (attendees fix it or exploit it themselves)
4. Debrief / gotchas

Plus: opening "spot the vulnerability" warmup (redacted real JWT, ~10 min), a mid-point break,
and a closing capstone (one deliberately broken auth service with multiple stacked bugs, teams
race to find them all).

## Content per pillar

| Pillar | Status | Notes |
|---|---|---|
| Algorithm confusion / `alg: none` | Base repo has `make-unsigned` | Need a naive verifier to attack |
| JWKS / key attacks (new depth) | Not started | `jku`/`x5u` header injection, `kid` path traversal / SQLi — need minimal JWKS-serving piece + `kid`-trusting verifier |
| Sensitive data in payload | `sensitivePayload` exists in `data.ts` | Just needs a decode-live demo |
| Expiration / refresh tokens | Not started | Nothing in base repo touches `exp`, `nbf`, or refresh flow. Needs reuse-detection exercise (replay a used refresh token, attendees implement "burn the whole family") |
| Cross-service trust / confused deputy (optional 6th pillar) | Not started | Token passthrough scenario |

## Repo layout

`wad-jwt` is a single monorepo (one root `.git`) holding the workshop deck plus all lab code.
The pieces below started life as separate GitHub repos under `dev-vs-ciso/` (generating-jwt,
algo-check-jwt, expiry-management-jwt, integrating-jwt) and were folded in as plain folders —
their nested `.git` directories were removed, so there's no submodule/subtree relationship left,
just files. GitHub still hosts the original standalone repos if old history is ever needed.

- `generating-jwt/` — base lab repo (token generation only, no verification)
- `jwt-playground/` — shared, cross-pillar Express+TS tool: generate a JWT (none/HS256/RS256)
  and inspect any token, seeing **decode** (always works, no key needed) and **verify** (real
  crypto check) side by side. Self-contained per the algo-check precedent below — its
  `src/lib/jwt.ts` and `src/lib/data.ts` duplicate the small amount of logic from
  `generating-jwt/` rather than cross-importing. `npm install && npm run dev`, served at
  `localhost:3000`.
- `exercises/` — per-lab companion projects:
  - `algo-check/` — Express app w/ `src/utils/jwt.ts` for the alg-confusion lab
  - `expiry-management-jwt/` — Express app w/ `src/utils/verifications.ts` for the expiry/refresh lab
  - `integrating-jwt/` — appears to be the integration/capstone-style app (has anon/logged-in pages)

Keep vulnerable and fixed versions clearly separated in file structure so nothing gets confused
during a live demo — e.g. one naive verifier, one fixed, one deliberately-broken per lab
(`npm run attack-alg-confusion` style scripts).

## Outstanding work

- [x] Build a shared JWT generate/decode/verify playground (`jwt-playground/`) — foundational,
      cross-pillar teaching tool, not tied to one lab
- [ ] Add companion `verify-*.ts` scripts to `generating-jwt` (or per-exercise) — naive / fixed /
      deliberately-broken per lab
- [ ] Build JWKS-serving + `kid`-trusting verifier for the key-injection lab
- [ ] Build expiration/refresh-token logic incl. reuse-detection exercise
- [ ] Build the opening warmup (realistic redacted JWT with an inspectable flaw)
- [ ] Build the closing capstone service with multiple stacked, intentional bugs
- [ ] Write short facilitator notes per block (timing, talking points, common attendee mistakes)
- [ ] Decide: cross-service trust as a real 6th pillar, or bonus/stretch topic

## Working preferences

- TypeScript, Node.js — matches existing repo and general stack
- Runnable `npm run` scripts per lab, not just code snippets
- Deep background in auth (SRP, JWT, OIDC, AWS Cognito) — skip fundamentals, go straight to
  implementation
- Deck (pptx) doesn't need new slides for deep-dive content
