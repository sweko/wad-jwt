# How To Mess Up JWTs — Workshop

A 2-hour hands-on security workshop expanding the "How To Mess Up JWTs" conference talk. Attendees
attack deliberately vulnerable JWT implementations, then fix them, across five pillars of
JWT-related mistakes.

## Structure

Each pillar is a ~15-18 minute block:

1. Short slide recap (from the companion talk deck)
2. Live-vulnerable code demo (attack it)
3. Hands-on exercise (attendees fix it or exploit it themselves)
4. Debrief / gotchas

The workshop opens with a "spot the vulnerability" warmup and closes with a capstone exercise
combining multiple stacked bugs in one broken auth service.

## Repo layout

- [generating-jwt/](generating-jwt/) — toolkit for generating JWTs three ways: unsigned
  (`alg: none`), HMAC-signed, and RSA-signed. No verification logic — generation only.
- [jwt-playground/](jwt-playground/) — small web app for generating and inspecting JWTs. Paste
  any token to see its **decoded** header/payload (always readable, no key needed) next to its
  **verification** result (a real signature check) — useful across every pillar, not tied to one
  lab.
- [exercises/](exercises/) — per-lab hands-on projects:
  - [algo-check/](exercises/algo-check/) — algorithm confusion / `alg: none` lab
  - [expiry-management-jwt/](exercises/expiry-management-jwt/) — token expiration & refresh-token
    reuse lab
  - [integrating-jwt/](exercises/integrating-jwt/) — JWT integration lab

Each project is an independent Node.js/TypeScript package with its own `package.json`.

## Getting started

Each folder under `generating-jwt/` and `exercises/*/` is installed and run independently:

```bash
cd generating-jwt        # or exercises/<lab-name>
npm install
```

`generating-jwt/` exposes token-generation scripts:

```bash
npm run unsigned      # alg: none
npm run signed-hmac   # HMAC SHA-256
npm run signed-rsa    # RSA SHA-256
```

Each lab under `exercises/`, and `jwt-playground/`, is a small Express app:

```bash
npm run dev     # run with nodemon for live editing
npm run build   # compile TypeScript
npm run start   # run the compiled build
```

`jwt-playground/` serves its UI at `http://localhost:3000`.

### Prerequisites

- Node.js 16+
- npm

## Status

This workshop is under active development. See [CLAUDE.md](CLAUDE.md) for the detailed build
plan, per-pillar status, and outstanding work.

## License

Unlicense (public domain) — see [LICENSE](LICENSE).
