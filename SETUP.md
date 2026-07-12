# Mool — Setup Guide

Mool is a Laravel-inspired backend framework for Node.js, currently in early
development. It's split into scoped npm packages:

| Package | What it is | Version |
|---|---|---|
| `@codeseedelearning/mool` | The `mool` CLI (scaffolding, `dev`/`start`, etc.) | 0.0.1 |
| `@codeseedelearning/mool-core` | Application/DI container, service providers | 0.0.2 |
| `@codeseedelearning/mool-router` | Route definitions, matching, middleware pipeline | 0.0.2 |
| `@codeseedelearning/mool-http` | Request/Response wrappers, the HTTP server | 0.0.2 |
| `@codeseedelearning/mool-config` | `.env` + `config/*.ts` loading | 0.0.1 |
| `@codeseedelearning/mool-events` | `Event.listen()` / `Event.dispatch()` pub-sub | 0.0.1 |
| `@codeseedelearning/mool-validation` | Rule-based request validation | 0.0.1 |
| `@codeseedelearning/mool-cache` | In-memory cache with TTL | 0.0.1 |

> **Status note:** `mool` (unscoped) is already taken by an unrelated package
> on the npm registry, so everything here is scoped under
> `@codeseedelearning/*`. **All eight packages are published** — no cloning
> required, see below. `router`/`http`/`core` are on `0.0.2` because `0.0.1`
> had a bug (async route handlers weren't awaited); if you generated a
> project before this fix, regenerate it or bump those three dependencies to
> `^0.0.2` in its `package.json`.

## For users: install and use

No cloning, no workspace setup — just Node.js 18+ and npm.

```bash
npx @codeseedelearning/mool new my-app --basic
cd my-app
npm install
npm run dev
```

That's it. `npx` fetches and runs the CLI without a global install.
`--basic` selects the `basic` starter template — currently the only
populated one. Omitting the flag defaults to `basic` too.

If you'll be creating multiple projects, install it once instead:

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
│   └── Models/
├── bootstrap/app.ts      # builds the Application, imports routes
├── config/app.ts
├── routes/web.ts         # example routes
├── public/
├── storage/
├── package.json          # name auto-set to "my-app", depends on
│                          # @codeseedelearning/mool-core + mool-router
├── tsconfig.json
├── .env.example
└── .gitignore
```

`npm install` inside the generated project pulls in
`@codeseedelearning/mool-core` and `@codeseedelearning/mool-router` as real
dependencies, plus `@codeseedelearning/mool` itself as a `devDependency` —
that's what makes `npm run dev` (`"dev": "mool dev"`) work using the
locally-installed CLI, with no global install required at all.

### Running it

```bash
npm run dev
```

This:
1. finds `bootstrap/app.ts` in the current directory,
2. imports it (which registers the routes from `routes/web.ts`),
3. starts an HTTP server (default port `3000`, override with `PORT=xxxx npm run dev`).

Confirm it's running:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

`npm run start` does the same thing (`"start": "mool start"`).

### Framework features (Config, Events, Validation, Cache)

The generated `bootstrap/app.ts` and `routes/web.ts` already demonstrate all
four:

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
```

Try the generated example routes: `POST /users` (validation + events) and
`GET /cached-time` (cache).

## CLI command reference

| Command | Description |
|---|---|
| `mool help` | List available commands |
| `mool version` | Show CLI version |
| `mool new <name> [--<template>]` | Scaffold a new project (`--basic` is the only real template today) |
| `mool dev` | Load `bootstrap/app.ts` in the current directory and start the server |
| `mool start` | Same as `dev` (no dev/prod distinction yet) |
| `mool serve` | Starts a bare server with **no** routes loaded — a leftover from early development, not project-aware yet. Prefer `dev`/`start`. |
| `mool make:controller <Name>` | Generate `app/Controllers/<Name>.ts` from a stub |

---

## For maintainers: working on the framework itself

This is a monorepo (`packages/*`) using npm workspaces. To hack on the
framework rather than just use it:

```bash
git clone <this-repo-url> mool
cd mool
npm install
npm link
```

`npm install` links `@codeseedelearning/mool-core`, `mool-router`, `mool-http`,
and the `mool` CLI package to each other via workspace symlinks in the root
`node_modules`. `npm link` makes the root's own `bin/mool.js` available
globally as `mool`, backed by the live source in `packages/cli/src/index.ts`
via `tsx` — no build step needed for local dev.

```bash
mool help                    # verify the link worked
mool new my-app --basic      # scaffold a test project inside the repo
cd my-app && npm install && npm run dev
```

To remove the link later: `npm unlink -g mool`.

### Publishing the packages

Packages must publish in dependency order (each depends on the one before
it): `mool-http` → `mool-router` → `mool-core` → `mool`. `mool-config`,
`mool-events`, `mool-validation`, and `mool-cache` have no cross-package
dependencies, so they can publish any time (order doesn't matter for those
four, and the `basic` template already depends on them once they exist on
the registry). All packages already have `publishConfig.access: "public"`
set, so a plain `npm publish` works for scoped packages without extra flags.

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
```

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
at the `.tgz` files (`"@codeseedelearning/mool-core": "file:../pack-test/codeseedelearning-mool-core-0.0.1.tgz"`,
etc.) and run `npm install && npm run dev` there. This exact flow was used
to verify the current setup — it works standalone, no monorepo required.

Bump the `version` field in whichever package.json(s) changed before
re-publishing; npm rejects re-publishing an existing version.

## Known limitations

- **`--api` and other template names don't exist yet** — only `basic` is
  populated. `mool new` will list what's actually available if you pass an
  unknown name.
- **No build pipeline.** Everything runs through `tsx` at runtime, in both
  the monorepo and the published packages (they ship TypeScript source, not
  compiled JS). `npm run build` (`tsc`) exists as a script but isn't part of
  the normal workflow yet, and the compiler currently reports errors across
  the codebase (missing `@types/node`, ESM extension requirements) that
  haven't been cleaned up.
- **Most framework packages are still empty stubs** — `auth`, `orm`,
  `database`, `queue`, `mail`, `middleware`, `filesystem`, `jwt`, `console`,
  `contracts`, `container`, `support`, and `testing` exist as placeholder
  directories only. `core`, `router`, `http`, `cli`, `config`, `events`,
  `validation`, and `cache` have real (if minimal) implementations.
- **No database/ORM.** This is the single biggest gap — no models,
  migrations, or query builder exist yet.
- **No real auth.** The `auth` package is empty; nothing is wired to
  persist or verify users (there's no database to persist them to yet).
- **`mool serve`** was an earlier attempt at a serve command; it boots a
  blank `Application` and never loads a project's routes. Use `dev`/`start`
  instead.

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
Two likely causes: (1) right after a fresh `npm publish`, the registry's CDN
can take up to a minute to propagate — wait briefly and retry; or (2) if
you're testing from a tarball rather than the registry, you forgot to also
point the transitive `mool-http` dependency at its tarball (`mool-core`
depends on it — see [Publishing](#publishing-the-packages)).
