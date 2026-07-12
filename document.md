# Mool — Project Documentation

Mool is a Laravel-inspired backend framework for Node.js, currently in early
development. This is the single consolidated reference for the project:
what it is, how to use it, what's implemented, what's missing, and how to
maintain/publish it.

---

## Table of contents

1. [Packages](#packages)
2. [Using Mool (install and scaffold a project)](#using-mool-install-and-scaffold-a-project)
3. [Framework features, with usage examples](#framework-features-with-usage-examples)
4. [CLI command reference](#cli-command-reference)
5. [Feature inventory — implemented](#feature-inventory--implemented)
6. [Feature inventory — not implemented](#feature-inventory--not-implemented)
7. [Feature inventory — partially built / known gaps](#feature-inventory--partially-built--known-gaps)
8. [Priority order for what's next](#priority-order-for-whats-next)
9. [For maintainers: working on the framework](#for-maintainers-working-on-the-framework)
10. [Publishing the packages](#publishing-the-packages)
11. [Troubleshooting](#troubleshooting)

---

## Packages

Mool is split into scoped npm packages under `@codeseedelearning/*` (the
unscoped `mool` name is already taken by an unrelated package on the
registry).

| Package | What it is | Version | Published? |
|---|---|---|---|
| `@codeseedelearning/mool` | The `mool` CLI (scaffolding, `dev`/`start`, `migrate`, etc.) | 0.0.2 local (0.0.1 published) | 🔧 |
| `@codeseedelearning/mool-core` | Application/DI container, service providers | 0.0.3 | ✅ |
| `@codeseedelearning/mool-router` | Route definitions, matching, real `next()`-based middleware pipeline | 0.0.3 | ✅ |
| `@codeseedelearning/mool-http` | Request/Response wrappers, `HttpResponse`, the HTTP server | 0.0.3 | ✅ |
| `@codeseedelearning/mool-config` | `.env` + `config/*.ts` loading | 0.0.1 | ✅ |
| `@codeseedelearning/mool-events` | `Event.listen()` / `Event.dispatch()` pub-sub | 0.0.1 | ✅ |
| `@codeseedelearning/mool-validation` | Rule-based request validation | 0.0.1 | ✅ |
| `@codeseedelearning/mool-cache` | In-memory cache with TTL | 0.0.1 | ✅ |
| `@codeseedelearning/mool-database` | SQLite (`node:sqlite`) + MySQL (`mysql2`) connections, migrations — async | 0.0.2 local (0.0.1 published) | 🔧 |
| `@codeseedelearning/mool-orm` | Minimal async Active Record `Model` (find/all/where/create/update/delete) | 0.0.2 local (0.0.1 published) | 🔧 |
| `@codeseedelearning/mool-jwt` | Zero-dependency HS256 JWT sign/verify | 0.0.1 | ✅ |
| `@codeseedelearning/mool-auth` | Password hashing (scrypt) + JWT auth (`createToken`, `AuthMiddleware`) | 0.0.2 | ✅ |
| `@codeseedelearning/mool-view` | Minimal zero-dependency view engine (`<%= %>`/`<% %>` tags), `View.render()`, `html()` | 0.0.1 | ✅ |

**Status notes:**
- All 13 packages were fully published at one point; since then, `mool` (CLI, hot reload) and `mool-database`/`mool-orm` (MySQL support, below) have local changes **not yet republished**.
- **MySQL support added.** `mool-database` now supports MySQL/MariaDB via `mysql2` alongside SQLite — driver chosen at runtime by `DB_CONNECTION` (env var), defaulting to SQLite (zero config, unchanged behavior). This required making `Database`/`Model` genuinely async (`mysql2` is real network I/O; there's no way to represent that behind a sync API without hacks), which is a **breaking API change**: every `Database.query/execute` and every `Model` method (`all`/`find`/`where`/`create`/instance `update`/`delete`) now returns a `Promise` and must be `await`ed. Verified live against a real local MySQL/MariaDB server (full create→find→where→update→delete→verify cycle, in a dedicated `mool_test` database, dropped afterward) — not just structurally reviewed. The SQLite path was fully regression-tested afterward in `my-app` with zero issues.
- `core`/`router`/`http` went through two published versions: `0.0.1` → `0.0.2` (fixed async handlers not being awaited) → `0.0.3` (the middleware pipeline rework: `Request.state`, `HttpResponse`, real `next()`-based chaining).

---

## Using Mool (install and scaffold a project)

No cloning, no workspace setup — just Node.js ≥22.5 (needed for
`mool-database`'s use of the built-in `node:sqlite` module) and npm.

```bash
npx @codeseedelearning/mool new my-app --basic
cd my-app
npm install
npm run dev
```

`npx` fetches and runs the CLI without a global install. `--basic` selects
the `basic` starter template — currently the only populated one. Omitting
the flag defaults to `basic` too.

If you'll be creating multiple projects, install the CLI once instead:

```bash
npm install -g @codeseedelearning/mool
mool new my-app --basic
```

### What gets generated

```
my-app/
├── app/
│   ├── Controllers/HomeController.ts
│   ├── Middleware/
│   └── Models/User.ts
├── bootstrap/app.ts      # builds the Application, imports routes, migrates
├── config/app.ts
├── database/
│   └── migrations/0001_create_users_table.ts
├── resources/
│   └── views/welcome.html
├── routes/web.ts         # example routes
├── public/
├── storage/
├── package.json          # name auto-set to "my-app"
├── tsconfig.json
├── .env.example
└── .gitignore             # ignores database/*.sqlite too
```

`.env` is generated automatically from `.env.example`, with a random
`APP_KEY` filled in (mirrors Laravel's `key:generate`) — it's gitignored,
so it only ever exists on disk, not in the template itself.

`npm install` inside the generated project pulls in the framework packages
(`mool-core`, `mool-router`, `mool-config`, `mool-events`,
`mool-validation`, `mool-cache`, `mool-database`, `mool-orm`, `mool-jwt`,
`mool-auth`, `mool-view`) as real dependencies, plus `@codeseedelearning/mool` itself as
a `devDependency` — that's what makes `npm run dev` (`"dev": "mool dev"`)
work using the locally-installed CLI, with no global install required at
all.

### Running it

```bash
npm run dev
```

This:
1. finds `bootstrap/app.ts` in the current directory,
2. imports it (which registers the routes from `routes/web.ts` and runs pending migrations),
3. starts an HTTP server (default port `3000`, override with `PORT=xxxx npm run dev`).

Confirm it's running:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

`npm run start` does the same thing (`"start": "mool start"`).

---

## Framework features, with usage examples

The generated `bootstrap/app.ts` and `routes/web.ts` already demonstrate
all of these together.

```ts
// config: config/app.ts is loaded automatically; read it anywhere via
import { Config } from "@codeseedelearning/mool-config";
Config.get("app.name", "Mool"); // reads process.env.APP_NAME via .env

// events: fire-and-forget pub/sub
import { Event } from "@codeseedelearning/mool-events";
Event.listen("user.registered", (payload) => { /* ... */ });
Event.dispatch("user.registered", { name: "Amit" });

// validation: rule strings, Laravel-style
import { validate } from "@codeseedelearning/mool-validation";
const { valid, errors } = validate(request.body, {
  name: "required|string|min:2",
  email: "required|email",
});

// cache: in-memory, with TTL
import { Cache } from "@codeseedelearning/mool-cache";
const value = await Cache.remember("key", 10, () => expensiveWork());

// database/orm: SQLite (default) or MySQL, switch via DB_CONNECTION in .env
// — fully async either way (mysql2 is real network I/O)
import { Model } from "@codeseedelearning/mool-orm";
class User extends Model {
  static table = "users";
}
await User.all();                 // SELECT * FROM users
await User.find(1);                // SELECT * FROM users WHERE id = 1
await User.create({ name: "Amit", email: "amit@example.com" });

// auth: JWT only (no sessions/OAuth) — password hashing + token issuance
import { hashPassword, verifyPassword, createToken, AuthMiddleware }
  from "@codeseedelearning/mool-auth";

hashPassword("secret123");                       // scrypt, random salt
verifyPassword("secret123", storedHash);          // timing-safe compare
const token = createToken({ id: user.id });       // secret = process.env.APP_KEY

// middleware attaches the decoded token to request.state.user and sends a
// real HTTP 401 (via HttpResponse) if the token is missing/invalid/expired —
// no need to re-verify inside the handler
Route.get("/profile", (request) => {
  return { success: true, user: request.state.user };
}).middleware(new AuthMiddleware());

// views: <%= %> escaped, <%- %> raw, <% %> arbitrary JS (if/for/etc.)
import { View, html } from "@codeseedelearning/mool-view";
Route.get("/welcome", () => {
  const rendered = View.render("welcome", { title: "Hi", features: ["A", "B"] });
  return html(rendered); // sets Content-Type: text/html
});
```

Migrations (`database/migrations/*.ts`) run automatically every time you
`mool dev`/`start` — no separate step needed for local dev, though `mool
migrate` also exists for running them explicitly (e.g. in a deploy step).

Try the generated example routes: `GET /users`, `POST /users` (register —
validation + password hashing + events), `POST /login` (issues a JWT),
`GET /profile` (protected — needs `Authorization: Bearer <token>`),
`GET /welcome` (renders `resources/views/welcome.html`), and
`GET /cached-time` (cache).

---

## CLI command reference

| Command | Description |
|---|---|
| `mool help` | List available commands |
| `mool version` | Show CLI version |
| `mool new <name> [--<template>]` | Scaffold a new project (`--basic` is the only real template today) |
| `mool dev` | Load `bootstrap/app.ts` and start the server, **auto-restarting on file changes** (routes, controllers, models, views — anything loaded, via `tsx watch`) |
| `mool start` | Same, but runs once — no file watching. Use for production/always-on. |
| `mool serve` | Starts a bare server with **no** routes loaded — a leftover from early development, not project-aware. Prefer `dev`/`start`. Should probably be removed. |
| `mool make:controller <Name>` | Generate `app/Controllers/<Name>.ts` from a stub |
| `mool make:model <Name>` | Generate `app/Models/<Name>.ts` from a stub, with the table name guessed via a small built-in pluralizer (`Post` → `posts`, `Category` → `categories`, `BlogPost` → `blog_posts`) — not a full inflector, irregular plurals need a manual fix |
| `mool migrate` | Run every pending file in `database/migrations/`, tracked in a `migrations` table |
| `mool migrate:status` | List every migration with ✅ Ran (+ timestamp) or ⏳ Pending — runs nothing, safe to call any time |
| `mool make:migration <name>` | Generate a timestamped migration file (table name inferred from `create_x_table`-style names) |

---

## Feature inventory — implemented

"Implemented" means real, working code that was exercised and verified end
to end (not a stub).

### CLI — `@codeseedelearning/mool` (published)

| Feature | Details |
|---|---|
| `mool help` | Lists all commands |
| `mool version` | Prints CLI version |
| `mool new <name> [--<template>]` | Scaffolds a project by copying a template directory, patching `package.json`'s `name`, restoring `.gitignore` (shipped as `gitignore` to survive npm's tarball stripping). Only `--basic` has real content; unknown/empty template names are rejected with a list of what's actually available. |
| `mool dev` | Finds `bootstrap/app.ts` in the current directory, dynamically imports it (registering routes as a side effect), starts the HTTP server on `PORT` or `3000` — run under `tsx watch`, so any change to a loaded file (routes, controllers, models, migrations, views) kills and restarts the process automatically. Implemented in the CLI's `bin/mool.js` launcher (checks if the first arg is `dev`, and if so spawns `tsx watch <entry>` instead of a plain one-shot `tsx <entry>`), not in `DevCommand` itself — the command doesn't know or care that it's being watched. |
| `mool start` | Same underlying command as `dev`, but the launcher runs it once (plain `tsx`, no watch) — the real dev/prod distinction that was previously missing |
| `mool make:controller <Name>` | Generates `app/Controllers/<Name>.ts` from a stub file, resolved relative to the CLI package itself (works standalone, not just in the monorepo) |
| `mool make:model <Name>` | Generates `app/Models/<Name>.ts` extending `Model` with `static table` pre-filled. Table name guessed via a small built-in pluralizer (PascalCase → snake_case, then common English pluralization rules) — not a full inflector, so irregular plurals (`Person` → `people`, not `persons`) need a manual edit. Rejects if the file already exists. |
| `mool migrate` | Runs every pending file in `database/migrations/` in filename order, tracking what's applied in a `migrations` table so re-runs are a no-op |
| `mool migrate:status` | Wraps `mool-database`'s new `getMigrationStatus()` — creates the tracking table if missing (same as `runMigrations`, but applies nothing), lists every migration file with ✅/⏳ and the applied timestamp, and a pending count with a hint to run `mool migrate` |
| `mool make:migration <name>` | Generates a timestamp-prefixed migration file (`20260712185544_create_posts_table.ts`), deriving the table name from `create_x_table`-style names |
| `.env` auto-setup on `mool new` | If a template ships `.env.example`, it's copied to `.env` automatically, and an empty `APP_KEY=` line is filled with a random 32-byte key (`crypto.randomBytes(32).toString("base64url")`) — mirrors Laravel's `key:generate`, so auth works with zero manual setup |

### Core — `@codeseedelearning/mool-core` (published)

| Feature | Details |
|---|---|
| `Container` | `bind(Class, instance?)` / `make(Class)` — a flat singleton map. No auto-wiring, no constructor injection, no reflection — you must bind everything by hand. |
| `Application` | Owns the container, binds `Server` into it, exposes `register(provider)`, `make(Class)`, `bootstrap()`, `start(port)` |
| `Kernel` | Thin wrapper: `boot()` calls `application.bootstrap()`, `start()` calls `application.start()` |
| `Provider` (abstract class) | `register()` / `boot()` lifecycle hooks, both no-ops by default — subclass to add behavior |
| `ProviderRepository` | Holds registered providers, calls `register()` on all of them then `boot()` on all of them |

### Router — `@codeseedelearning/mool-router@0.0.3` (published)

| Feature | Details |
|---|---|
| `Route.get/post/put/delete(path, handler)` | Static registration into a shared `RouteCollection` |
| Path param matching | `:id`-style segments, e.g. `/users/:id` → `request.params.id` |
| `.middleware(m)` chaining | Attaches one or more `Middleware` to a route definition, in call order |
| **Real middleware pipeline** | `Middleware.handle(request, next)` — an onion-style chain built with `reduceRight`. Each middleware calls `next()` to continue (and gets the downstream result back — can pass it through or transform it), or returns its own value directly to short-circuit without calling `next()`. Fully async. Mutate `request` before calling `next()` to pass data forward (see `Request.state` below). This replaces the old `0.0.2` contract, which was a single synchronous `handle(request): boolean` gate with no chaining, no mutation, and no way to influence the response. |
| `Router.resolve(request)` | Matches method+path, builds the middleware pipeline, awaits and returns its result. `0.0.2`'s async-handler-not-awaited bug (fixed in `0.0.2`) is unaffected. Also dropped the per-request `console.log` of the full route table while rewriting this. |
| 404 | Returns the literal string `"404 Not Found"` when no route matches — still doesn't set a real HTTP status code (pre-existing gap, tracked separately under "Error handling") |

### HTTP — `@codeseedelearning/mool-http@0.0.3` (published)

| Feature | Details |
|---|---|
| `Request` | Wraps Node's `IncomingMessage`: `.method`, `.url`, `.headers`, `.params`, `.body` (JSON-parsed from the raw body, falls back to `{}` on parse failure), and **`.state`** (new — a generic `Record<string, unknown>` bag middleware use to pass data forward, e.g. `request.state.user = ...`) |
| `Response` | `.status(code)`, `.header(name, value)`, `.send(string)` (text/plain), `.json(data)` — all chainable except the terminal two |
| **`HttpResponse`** (new) | Return `new HttpResponse(status, body)` from a route handler or middleware to control the actual HTTP status code — plain return values always send `200`. This is what makes `AuthMiddleware`'s 401 a *real* 401 now, not just a `200` with the string `"401 Unauthorized"` as the body (which is what `0.0.2` actually did — verified via `curl -w "%{http_code}"`, a real bug, now fixed). |
| `Server` | Raw `node:http` server: reads the full request body, JSON-parses it, calls the router; if the result is an `HttpResponse`, sets the real status code; otherwise sends a string via `.send()` or anything else via `.json()` (200 default); catches thrown errors into a generic `500 {"success":false,"message":"Internal Server Error"}` |

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

### Database — `@codeseedelearning/mool-database@0.0.2` (local, not yet published)

Two drivers behind one API — SQLite (`node:sqlite`, zero external
dependency, default) and MySQL/MariaDB (via `mysql2`, the one genuine
external dependency anywhere in this framework — there's no built-in Node
MySQL client and hand-rolling the wire protocol isn't reasonable the way
hand-rolling JWT/scrypt was). Both drivers use `?` positional placeholders,
so `query`/`execute` calls are portable between them; raw DDL generally
isn't (see `Database.dialect()` below).

**Breaking change from `0.0.1`:** every method is now `async`/returns a
`Promise` — `0.0.1`'s SQLite-only API was synchronous, which can't
represent MySQL's real network I/O, so this was unavoidable to add a
second driver correctly (rejected the alternative of faking sync-over-async).

| Feature | Details |
|---|---|
| `Database.connect(config?)` | Picks a driver: `config.connection` → `DB_CONNECTION` env var → `"sqlite"` default. For MySQL: host/port/user/password/database from `config` or `DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD`/`DB_DATABASE`. For SQLite: `config.database` or `DB_DATABASE` overrides the default `database/database.sqlite` path. Lazily called on first query if you never call it yourself. |
| `Database.query(sql, params?)` | `async` — runs a `SELECT`, returns rows as plain objects |
| `Database.execute(sql, params?)` | `async` — runs an `INSERT`/`UPDATE`/`DELETE`, returns `{ lastInsertRowid, changes }` (mapped from `mysql2`'s `insertId`/`affectedRows` on the MySQL side) |
| `Database.close()` | `async` — closes the active connection/pool |
| `Database.dialect()` | Returns `"sqlite"` or `"mysql"` — for migrations that need different DDL per database (see ORM section and the MySQL guide in `guide.md`) |
| `Migration` (abstract class) | `up()` / `down()`, now `void \| Promise<void>` — write (`await`ed) SQL against `Database.execute()` |
| `runMigrations(dir?)` | `async`. Creates a `migrations` tracking table (dialect-aware DDL) if missing, `await`s every not-yet-applied file in `database/migrations/` in filename order, records each as applied |

Live-verified against a real local MySQL/MariaDB server: full
create→find→where→update→delete cycle in a dedicated test database
(created and dropped as part of verification, never touching any other
data on that server). The SQLite path was fully regression-tested
afterward with zero issues.

### ORM — `@codeseedelearning/mool-orm@0.0.2` (local, not yet published)

An Active Record-style layer on top of `mool-database`, with a real
chainable query builder underneath the `Model` static methods. Every
method is `async` — depends on `mool-database@^0.0.2`.

| Feature | Details |
|---|---|
| `Model` (abstract class) | Subclass with a `static table = "users"`; the row's columns become instance properties automatically (`Object.assign` from the raw row) |
| `Model.query()` | Returns a `QueryBuilder` instance for manual chaining — every other static read method below is a shortcut onto this |
| `Model.all()` | `async` — `SELECT * FROM table` |
| `Model.find(id)` / `findOrFail(id)` | `async` — `WHERE id = ?`; `find` returns `null` if missing, `findOrFail` throws `ModelNotFoundError` |
| `Model.first()` | `async` — first matching row (or of the whole table), `null` if none |
| `Model.firstWhere(column, op?, value)` | `async` — shortcut for `.where(...).first()` |
| `Model.count()` / `Model.exists()` | `async` — row count / whether any row matches |
| `Model.paginate(page?, perPage?)` | `async` — `{ data, total, page, perPage, lastPage }` |
| `Model.where(column, value)` / `.where(column, operator, value)` | Chainable — equality shortcut, or an explicit operator from a whitelist (`=`,`!=`,`<>`,`<`,`>`,`<=`,`>=`,`LIKE`,`NOT LIKE`) enforced in `QueryBuilder` to prevent SQL injection through the operator argument |
| `.orWhere(...)` | Chainable — same signature as `.where()`, joined with `OR` instead of `AND` |
| `.whereIn(column, values)` | Chainable — `column IN (?, ?, ...)` |
| `.whereNull(column)` / `.whereNotNull(column)` | Chainable |
| `.select(...columns)` | Chainable — restricts returned columns (default `*`) |
| `.orderBy(column, direction?)` | Chainable — `"asc"` (default) or `"desc"` |
| `.limit(n)` / `.offset(n)` | Chainable |
| `.get()` | Terminal — runs the built query, maps rows to `Model` instances |
| `Model.create(attributes)` | `async` — `INSERT`, then re-fetches and returns the created row (so auto-generated columns like `id` come back populated) |
| `instance.update(attributes)` | `async` — `UPDATE ... WHERE id = ?`, then merges the new attributes onto the in-memory instance |
| `instance.delete()` | `async` — `DELETE ... WHERE id = ?` |
| `ModelNotFoundError` | Thrown by `findOrFail`; exported from `mool-orm` for `instanceof` checks in route handlers |

**Design note — `QueryBuilder` as a thenable:** `Model.where(...)` doesn't
return a bare `Promise`; it returns a `QueryBuilder` that implements
`PromiseLike<T[]>` (a `then()` method that delegates to `.get()`). That
means every pre-existing call site in the codebase — `await User.where(...)`,
`const [user] = await User.where(...)` — kept working unmodified after the
rewrite, while new code can also chain `.orderBy().limit().offset()`
before awaiting. This was the load-bearing compatibility decision for the
whole rewrite; verified via a 21-assertion script covering both the old
call patterns and every new method, then re-verified through the live
`my-app` HTTP server (`/users`, `/login`, `/profile`) end to end.

What it still does **not** have: relationships (hasMany/belongsTo), eager
loading, validation hooks, automatic timestamps, soft deletes, model
hooks/events, attribute casting, or a schema/column-type system. Complex
joins/aggregates/mixed `AND`/`OR` grouping still drop down to
`Database.query()` directly — this is an intentional scope boundary, not
a gap to fill later.

### JWT — `@codeseedelearning/mool-jwt` (published)

Zero-dependency JWT, HS256 only (uses `node:crypto`'s `createHmac`, no
external JWT library).

| Feature | Details |
|---|---|
| `sign(payload, secret, expiresInSeconds?)` | Adds `iat`/`exp` automatically (default TTL 1 hour), returns the standard `header.payload.signature` string |
| `verify(token, secret)` | Checks part count, signature (via `crypto.timingSafeEqual`, not naive string comparison), and expiry; throws `JwtError` with a specific message on any failure |

Only one algorithm exists on purpose — no RS256/alg-negotiation, so there's
no "alg: none" class of vulnerability to worry about.

### Auth — `@codeseedelearning/mool-auth@0.0.2` (published)

JWT-based only (no sessions, no OAuth) — password hashing + token
issuance/verification, built on `mool-jwt`.

| Feature | Details |
|---|---|
| `hashPassword(password)` | `scrypt` with a random 16-byte salt per password (`node:crypto`, no `bcrypt` dependency), returns `"salt:hash"` (both hex) as a single string to store |
| `verifyPassword(password, hashed)` | Re-derives the hash with the stored salt, compares with `timingSafeEqual` |
| `createToken(payload, options?)` | Thin wrapper over `mool-jwt`'s `sign()`; secret defaults to `process.env.APP_KEY`, throws a clear error if neither that nor an explicit secret is provided |
| `verifyToken(token, secret?)` | Same default-secret behavior, wraps `mool-jwt`'s `verify()` |
| `getBearerToken(request)` | Extracts the token from an `Authorization: Bearer <token>` header, or `null` |
| `AuthMiddleware` | Verifies the bearer token; on success attaches the decoded payload to **`request.state.user`** and calls `next()`; on failure short-circuits with a real `HttpResponse(401, ...)` — a genuine HTTP 401, verified with `curl -w "%{http_code}"`. Protected handlers read `request.state.user` directly, no re-verification needed (rewritten alongside the router's middleware pipeline rework — previously this was a boolean-only gate that couldn't attach anything to the request, and its 401 wasn't even a real HTTP 401). |

Deliberately doesn't depend on `mool-orm`/`mool-database` — it only handles
password hashing and token issuance/verification. Looking up/creating
users is left to the app (the `basic` template demonstrates this with a
real `User` model).

### View — `@codeseedelearning/mool-view` (published)

A minimal, zero-dependency view engine — no external templating library,
compiled with `new Function` (same technique EJS uses internally).

| Feature | Details |
|---|---|
| `compile(template)` | Compiles a template string to a render function. Tags: `<%= expr %>` (HTML-escaped output), `<%- expr %>` (raw/unescaped output), `<% code %>` (arbitrary JS — `if`/`for`/etc., runs as-is) |
| `View.render(name, data?, viewsDir?)` | Reads `resources/views/<name>.html`, compiles (cached by resolved file path after the first render), executes with `data`, returns the HTML string |
| `View.clearCache()` | Drops the compiled-template cache |
| `html(body, status?)` | Wraps a rendered string in an `HttpResponse` with `Content-Type: text/html; charset=utf-8` (status defaults to 200) — needed because plain string returns default to `text/plain` |

**Trust model:** templates are compiled with `new Function`, i.e. they run
as trusted code with full JS access — same as EJS/Handlebars-with-helpers.
Never compile a template sourced from user input; only render `.html`
files you wrote yourself.

Required a small `mool-http` addition to support: `HttpResponse` gained an
optional `contentType` field, and `Response` gained a `.write(body)` method
that ends the response without forcing a particular Content-Type (both
still unpublished `0.0.3` changes, no separate version bump needed since
`0.0.3` was never published).

### Distribution / tooling

| Feature | Details |
|---|---|
| npm workspaces monorepo | `packages/*`, root `package.json` marked `private` |
| Real published packages | 8 of 13 packages live on the public npm registry under `@codeseedelearning/*` (5 more built and verified locally, awaiting publish: `database`, `orm`, `jwt`, `auth`, `view`; plus `core`/`router`/`http` have unpublished `0.0.3` bumps) |
| `npx @codeseedelearning/mool new my-app --basic` | Verified working end-to-end from the real registry — zero cloning |
| Local-CLI-via-devDependency pattern | Generated projects get `@codeseedelearning/mool` as a `devDependency`, so `npm run dev` uses the locally installed CLI — no global install needed |
| `basic` template | The only populated template; demonstrates Config, Events, Validation, Cache, real database persistence (SQLite by default, MySQL via `.env`), full JWT auth (register → hash password → login → issue token → access a protected route), and view rendering (`GET /welcome`) together in `routes/web.ts`. Migrations run automatically on `mool dev`/`start` via `bootstrap/app.ts`. |

---

## Feature inventory — not implemented

These exist as directories with a `.gitkeep` and nothing else:

- **`queue`** — no background job system
- **`mail`** — no mailer/transport
- **`middleware`** — still no dedicated standalone package for shipping reusable middlewares, but the router's own pipeline mechanism (see Router above) is now a real, complete `next()`-based system, not a placeholder
- **`filesystem`** — no `Storage`-style abstraction for `public/`/`storage/` (the CLI has its own internal file-copying helper, but nothing user-facing)
- **`console`** — no way for a user's own app to register custom CLI commands (only the framework's own commands exist)
- **`contracts`** — no centralized interfaces; `Middleware`/`RouteHandler` types live inside the router package instead of a shared contracts package
- **`container`** — dedicated DI package doesn't exist; the minimal container lives inline in `core`
- **`support`** — no helper/utility function library
- **`testing`** — no test harness, no HTTP test client, no assertions helpers
- **`packages/templates/*`** (root-level `default`, `api`, `full-stack`) — dead code, superseded by `packages/cli/src/templates/basic`; should probably be deleted

## Feature inventory — partially built / known gaps

- **`Request.query`** — the property exists (`Record<string, string>`) but nothing ever parses the URL's query string into it; always `{}`
- **`mool serve`** — still registered as a command but boots a blank `Application` with no routes loaded; dead code superseded by `dev`/`start`, should be removed
- **`--api` / `--full-stack` templates** — flags exist and are rejected cleanly (good error message), but no content behind them
- **Error handling** — any thrown error becomes a generic `500 Internal Server Error`; no custom exception classes, no per-route error handlers
- **No static file serving** — `public/` is scaffolded but the server never serves anything from it
- **No CORS support**
- **No logging system** — `Server` still prints a raw `console.log` per request; no real logger, log levels, or structured output (the noisier per-request route-table dump in `Router.resolve` was removed during the middleware rework, but basic request logging remains ad hoc)
- **No build pipeline** — `npm run build` (`tsc`) exists but isn't part of the workflow; the compiler currently reports errors across the codebase (missing `@types/node`, ESM extension requirements) that have never been cleaned up
- **The ORM is genuinely minimal** — see the Database/ORM section above
- **Auth is JWT-only and stateless** — no refresh tokens, no logout/revocation mechanism

---

## Priority order for what's next

Done, in order: publishing config/events/validation/cache → Database/ORM →
Auth → Middleware rework → Views → publishing everything → hot reload
(`mool dev` now watches and restarts) → **MySQL support** (`mool-database`
now supports MySQL/MariaDB via `mysql2` alongside SQLite, driver switched
via `DB_CONNECTION`; required making `Database`/`Model` async throughout —
a real breaking change, live-verified against an actual MySQL server).
Current focus:

1. **Publish `mool` (0.0.2, hot reload) and `mool-database`/`mool-orm` (0.0.2, MySQL + async)** — not yet on the registry
2. **Fix `Request.query`, remove `mool serve`, add basic error classes (real 404 status too)** — small, cheap correctness fixes
3. **Static file serving + CORS** — needed for almost any real app; CORS can now be a real middleware using the new pipeline
4. **`testing` package** — an HTTP test client would make everything above easier to verify going forward
5. **ORM query builder** — `where` only supports single-column equality today; no `orderBy`, no relationships, no multi-condition queries; no schema-builder DSL, so migration DDL isn't automatically portable across SQLite/MySQL
6. **Refresh tokens / logout / token revocation** — current auth is stateless JWT only; there's no way to invalidate a token before it expires
7. **Layouts/partials for views** — `mool-view` only renders a single file today; no `<% include('partial') %>` or layout inheritance yet

---

## For maintainers: working on the framework

This is a monorepo (`packages/*`) using npm workspaces. To hack on the
framework rather than just use it:

```bash
git clone <this-repo-url> mool
cd mool
npm install
npm link
```

`npm install` links all `@codeseedelearning/mool-*` packages to each other
via workspace symlinks in the root `node_modules`. `npm link` makes the
root's own `bin/mool.js` available globally as `mool`, backed by the live
source in `packages/cli/src/index.ts` via `tsx` — no build step needed for
local dev.

```bash
mool help                    # verify the link worked
mool new my-app --basic      # scaffold a test project inside the repo
cd my-app && npm install && npm run dev
```

To remove the link later: `npm unlink -g mool`.

> **Note:** the repo has a project named `my-app` at the root used as the
> running example/manual-test bed for verifying changes end to end — it's
> kept in sync with the `basic` template as features are built and tested.

---

## Publishing the packages

Packages must publish in dependency order (each depends on the one
before it): `mool-http` → `mool-router` → `mool-core` → `mool`, separately
`mool-database` → `mool-orm`, and separately `mool-jwt` → `mool-auth`.
`mool-config`, `mool-events`, `mool-validation`, and `mool-cache` have no
cross-package dependencies, so they can publish any time. The `basic`
template already depends on all of these once they exist on the registry.
All packages already have `publishConfig.access: "public"` set, so a plain
`npm publish` works for scoped packages without extra flags.

```bash
npm login   # once, interactively — do this yourself, not via an agent

cd packages/http        && npm publish
cd ../router             && npm publish
cd ../core               && npm publish
cd ../cli                && npm publish
cd ../config             && npm publish
cd ../events             && npm publish
cd ../validation         && npm publish
cd ../cache              && npm publish
cd ../database            && npm publish
cd ../orm                 && npm publish
cd ../jwt                  && npm publish
cd ../auth                  && npm publish
```

`mool-database` requires Node ≥22.5 (uses the built-in `node:sqlite`
module) — that's declared in its `engines` field, but npm doesn't enforce
`engines` by default, so it's worth calling out explicitly here.

Publishing requires npm's 2FA on the account. If you don't have OTP-based
2FA (authenticator app), a Granular Access Token with the 2FA-bypass option
enabled works for CLI publishing — see npmjs.com → your account →
Access Tokens.

Before publishing for real, verify the whole chain works exactly as an
external user would see it — pack each package to a tarball and install
from the tarballs in a directory *outside* this repo (so workspace symlinks
can't paper over a broken dependency):

```bash
mkdir -p /tmp/pack-test && cd /tmp/pack-test
npm pack /path/to/mool/packages/http
npm pack /path/to/mool/packages/router
npm pack /path/to/mool/packages/core
npm pack /path/to/mool/packages/cli
```

Then create a scratch project whose `package.json` points its dependencies
at the `.tgz` files (`"@codeseedelearning/mool-core":
"file:../pack-test/codeseedelearning-mool-core-0.0.1.tgz"`, etc.) and run
`npm install && npm run dev` there. This exact flow was used to verify the
current setup — it works standalone, no monorepo required.

Bump the `version` field in whichever package.json(s) changed before
re-publishing; npm rejects re-publishing an existing version. Note npm's
0.0.x semver quirk: `^0.0.1` only matches `0.0.1` exactly (not `0.0.2`), so
bumping a package's patch version also requires bumping the version ranges
of anything that depends on it, and republishing those too.

---

## Troubleshooting

**`npm run dev` prints CLI help / "Unknown command" instead of starting a server**
Your project's `package.json` is missing or wasn't found — `npm run` walks
up to the nearest `package.json` if the current directory doesn't have one,
which can end up running a *different* `dev` script than your project's
(e.g. the framework repo's own, if you're working inside it). Make sure
you're inside the generated project directory and that it has its own
`package.json` (re-run `mool new` if it's missing).

**`Template "<name>" not found. Available templates: basic`**
You passed a template flag that doesn't correspond to a populated template.
Use `--basic` (or omit the flag).

**"Project already exists" on `mool new`**
The target directory already exists — pick a different name or remove the
existing directory first.

**`E404` on `@codeseedelearning/mool-http` (or similar) during `npm install`**
Two likely causes: (1) right after a fresh `npm publish`, the registry's
CDN can take up to a minute to propagate — wait briefly and retry; or (2)
if you're testing from a tarball rather than the registry, you forgot to
also point a transitive dependency at its tarball too (e.g. `mool-core`
depends on `mool-http` — see [Publishing](#publishing-the-packages)).
