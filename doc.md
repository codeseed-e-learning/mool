# Mool — Feature Inventory

A complete, one-by-one list of what exists in the Mool framework today and
what's still missing. "Implemented" means real, working code that was
exercised and verified (not a stub). Package publish status is noted where
relevant.

---

## ✅ Implemented

### CLI — `@codeseedelearning/mool` (published)

| Feature | Details |
|---|---|
| `mool help` | Lists all commands |
| `mool version` | Prints CLI version |
| `mool new <name> [--<template>]` | Scaffolds a project by copying a template directory, patching `package.json`'s `name`, restoring `.gitignore` (shipped as `gitignore` to survive npm's tarball stripping). Only `--basic` has real content; unknown/empty template names are rejected with a list of what's actually available. |
| `mool dev` | Finds `bootstrap/app.ts` in the current directory, dynamically imports it (registering routes as a side effect), starts the HTTP server on `PORT` or `3000` |
| `mool start` | Identical to `dev` — no dev/prod distinction exists yet |
| `mool make:controller <Name>` | Generates `app/Controllers/<Name>.ts` from a stub file, resolved relative to the CLI package itself (works standalone, not just in the monorepo) |

### Core — `@codeseedelearning/mool-core` (published)

| Feature | Details |
|---|---|
| `Container` | `bind(Class, instance?)` / `make(Class)` — a flat singleton map. No auto-wiring, no constructor injection, no reflection — you must bind everything by hand. |
| `Application` | Owns the container, binds `Server` into it, exposes `register(provider)`, `make(Class)`, `bootstrap()`, `start(port)` |
| `Kernel` | Thin wrapper: `boot()` calls `application.bootstrap()`, `start()` calls `application.start()` |
| `Provider` (abstract class) | `register()` / `boot()` lifecycle hooks, both no-ops by default — subclass to add behavior |
| `ProviderRepository` | Holds registered providers, calls `register()` on all of them then `boot()` on all of them |

### Router — `@codeseedelearning/mool-router@0.0.2` (published)

| Feature | Details |
|---|---|
| `Route.get/post/put/delete(path, handler)` | Static registration into a shared `RouteCollection` |
| Path param matching | `:id`-style segments, e.g. `/users/:id` → `request.params.id` |
| `.middleware(m)` chaining | Attaches a `Middleware` (sync `handle(request): boolean`) to a route definition |
| `Router.resolve(request)` | Matches method+path, runs middlewares, awaits and returns the handler's result — **fixed and republished as `0.0.2`**; `0.0.1` didn't await async handlers, silently serializing `{}` for any async route |
| 404 / 401 | Returns literal strings `"404 Not Found"` / `"401 Unauthorized"` when no route matches or middleware rejects |

### HTTP — `@codeseedelearning/mool-http@0.0.2` (published)

| Feature | Details |
|---|---|
| `Request` | Wraps Node's `IncomingMessage`: `.method`, `.url`, `.headers`, `.params`, `.body` (JSON-parsed from the raw body, falls back to `{}` on parse failure) |
| `Response` | `.status(code)`, `.header(name, value)`, `.send(string)` (text/plain), `.json(data)` — all chainable except the terminal two |
| `Server` | Raw `node:http` server: reads the full request body, JSON-parses it, calls the router, sends a string via `.send()` or anything else via `.json()`, catches thrown errors into a generic `500 {"success":false,"message":"Internal Server Error"}` |

### Config — `@codeseedelearning/mool-config` (published)

| Feature | Details |
|---|---|
| `loadEnv(path?)` | Parses a `.env` file (`KEY=VALUE`, `#` comments, quoted values) into `process.env`, without overriding variables already set |
| `Config.load(dir?)` | Dynamically imports every `.ts`/`.js` file in `config/`, indexes each by filename (`config/app.ts` → `Config.get("app")`) |
| `Config.get(key, fallback?)` | Dot-notation lookup, e.g. `Config.get("app.port")` |
| `Config.all()` / `Config.clear()` | Introspection / reset (mainly useful for tests) |

### Events — `@codeseedelearning/mool-events` (published)

| Feature | Details |
|---|---|
| `Event.listen(name, handler)` | Registers a handler for a named event |
| `Event.dispatch(name, payload)` | Awaits every registered handler in registration order |
| `Event.clear(name?)` | Removes listeners for one event, or all of them |

### Validation — `@codeseedelearning/mool-validation` (published)

| Feature | Details |
|---|---|
| `validate(data, rules)` | Laravel-style rule strings (`"required\|string\|min:2"`) per field, returns `{ valid, errors }` |
| Supported rules | `required`, `string`, `number`, `email`, `min:N`, `max:N` (length for strings, value for numbers) |

### Cache — `@codeseedelearning/mool-cache` (published)

| Feature | Details |
|---|---|
| `Cache.put(key, value, ttlSeconds?)` | In-memory `Map` store, optional expiry |
| `Cache.get(key)` / `.has(key)` / `.forget(key)` | Standard cache reads/eviction, lazily expires on read |
| `Cache.remember(key, ttl, callback)` | Get-or-compute-and-store pattern |
| `Cache.flush()` | Clears everything |

### Distribution / tooling

| Feature | Details |
|---|---|
| npm workspaces monorepo | `packages/*`, root `package.json` marked `private` |
| Real published packages | All 8 packages live on the public npm registry under `@codeseedelearning/*` |
| `npx @codeseedelearning/mool new my-app --basic` | Verified working end-to-end from the real registry — Config, Validation, Events, and Cache all confirmed working through a fresh, purely-registry-installed project — zero cloning |
| Local-CLI-via-devDependency pattern | Generated projects get `@codeseedelearning/mool` as a `devDependency`, so `npm run dev` uses the locally installed CLI — no global install needed |
| `basic` template | The only populated template; demonstrates Config, Events, Validation, and Cache together in `routes/web.ts` |

---

## ❌ Not implemented (empty placeholder packages)

These exist as directories with a `.gitkeep` and nothing else:

- **`auth`** — no login/session/token handling of any kind
- **`orm`** / **`database`** — no models, migrations, query builder, or DB connection of any kind. This is the single biggest gap.
- **`queue`** — no background job system
- **`mail`** — no mailer/transport
- **`middleware`** — no dedicated middleware package; the only middleware mechanism is the router's single synchronous `handle(): boolean` gate (see below)
- **`filesystem`** — no `Storage`-style abstraction for `public/`/`storage/` (the CLI has its own internal file-copying helper, but nothing user-facing)
- **`jwt`** — no token signing/verification
- **`console`** — no way for a user's own app to register custom CLI commands (only the framework's own commands exist)
- **`contracts`** — no centralized interfaces; `Middleware`/`RouteHandler` types live inside the router package instead of a shared contracts package
- **`container`** — dedicated DI package doesn't exist; the minimal container lives inline in `core`
- **`support`** — no helper/utility function library
- **`testing`** — no test harness, no HTTP test client, no assertions helpers
- **`packages/templates/*`** (root-level `default`, `api`, `full-stack`) — dead code, superseded by `packages/cli/src/templates/basic`; should probably be deleted

## ⚠️ Partially built / declared but not wired up

- **`Request.query`** — the property exists (`Record<string, string>`) but nothing ever parses the URL's query string into it; always `{}`
- **`mool serve`** — still registered as a command but boots a blank `Application` with no routes loaded; dead code superseded by `dev`/`start`, should be removed
- **`--api` / `--full-stack` templates** — flags exist and are rejected cleanly (good error message), but no content behind them
- **Middleware model** — synchronous-only, single boolean gate per middleware, no `next()` chaining, no way to modify the request/response or short-circuit with a custom status/body
- **Error handling** — any thrown error becomes a generic `500 Internal Server Error`; no custom exception classes, no per-route error handlers
- **No static file serving** — `public/` is scaffolded but the server never serves anything from it
- **No CORS support**
- **No logging system** — the framework prints raw `console.log` calls on every request (including the entire route table on every single request, in `Router.resolve`), not a real logger
- **No build pipeline** — `npm run build` (`tsc`) exists but isn't part of the workflow; the compiler currently reports errors across the codebase (missing `@types/node`, ESM extension requirements) that have never been cleaned up

---

## Suggested priority order for what's next

~~1. Publish `config`, `events`, `validation`, `cache`~~ — done. All 8 packages
are published, including a `0.0.2` republish of `router`/`http`/`core` to fix
an async-handler bug found while verifying the public install flow (see
above). Full `npx @codeseedelearning/mool new my-app --basic` → `npm install`
→ `npm run dev` confirmed working end-to-end from the real registry.

1. **Database/ORM** — the biggest single gap; even a minimal SQLite-backed `Model` (find/create/update/delete) would unlock real Auth
2. **Auth** — depends on #1 to mean anything beyond an in-memory demo
3. **Fix `Request.query`, remove `mool serve`, add basic error classes** — small, cheap correctness fixes
4. **Middleware rework** — support async + a real `next()`-style chain, not just a boolean gate
5. **Static file serving + CORS** — needed for almost any real app
6. **`testing` package** — an HTTP test client would make everything above easier to verify going forward
