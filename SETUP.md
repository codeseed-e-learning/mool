# Mool — Setup Guide

Mool is a Laravel-inspired backend framework for Node.js, currently in early
development. This guide walks through setting up the framework repo itself
and scaffolding a project with it.

> **Status note:** Mool is not published to npm and the `mool` package name
> is already taken by an unrelated package on the registry. Everything below
> works **locally**, from a clone of this repo, via `npm link`. There is no
> `npm install mool` yet.

## Prerequisites

- Node.js 18+ (tested on Node 22)
- npm 9+ (ships with recent Node; needed for workspaces support)
- Git

## 1. Clone and install

```bash
git clone <this-repo-url> mool
cd mool
npm install
```

This installs dependencies at the repo root and, because the root
`package.json` declares `workspaces: ["packages/*"]`, links the framework's
own packages (`@mool/core`, `@mool/router`, `@mool/http`, …) into the root
`node_modules` so they can `import`-resolve from each other and from any
project you scaffold inside this repo.

## 2. Link the `mool` CLI globally

```bash
npm link
```

This makes the `mool` command available anywhere on your machine, backed by
[`bin/mool.js`](bin/mool.js), which runs the CLI source
(`packages/cli/src/index.ts`) through `tsx` — no build step required yet.

Verify it worked:

```bash
mool help
```

You should see the list of available commands.

To remove the link later: `npm unlink -g mool`.

## 3. Create a new project

From inside the `mool` repo (this matters — see [Known limitations](#known-limitations)):

```bash
mool new my-app --basic
cd my-app
```

`--basic` selects the `basic` starter template — currently the only
populated template. Flags map to template names, so this also works:

```bash
mool new my-app --template=basic
```

Omitting the flag defaults to `basic` as well.

This generates:

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
├── package.json          # name auto-set to "my-app"
├── tsconfig.json
├── .env.example
└── .gitignore
```

## 4. Install and run the generated project

```bash
npm install
npm run dev
```

`npm run dev` runs the project's own `"dev": "mool dev"` script, which:
1. finds `bootstrap/app.ts` in the current directory,
2. imports it (which registers the routes from `routes/web.ts`),
3. starts an HTTP server (default port `3000`, override with `PORT=xxxx npm run dev`).

Confirm it's running:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

`npm run start` does the same thing (`"start": "mool start"`).

## CLI command reference

| Command | Description |
|---|---|
| `mool help` | List available commands |
| `mool version` | Show CLI version |
| `mool new <name> [--<template>]` | Scaffold a new project (`--basic` is the only real template today) |
| `mool dev` | Load `bootstrap/app.ts` in the current directory and start the server |
| `mool start` | Same as `dev` (no dev/prod distinction yet) |
| `mool serve` | Starts a bare server with **no** routes loaded — a leftover from early development, not project-aware yet. Prefer `dev`/`start`. |
| `mool make:controller <Name>` | Generate `app/controllers/<Name>.ts` from a stub |

## Known limitations

- **Only works inside this repo.** A generated project resolves `@mool/core`
  and `@mool/router` by walking up from its own location to this repo's
  `node_modules` (via the workspace symlinks from step 1). A project created
  outside the `mool` repo won't find those packages — real portability
  requires publishing the framework, which is blocked on the npm name
  collision noted above.
- **`--api` and other template names don't exist yet** — only `basic` is
  populated. `mool new` will list what's actually available if you pass an
  unknown name.
- **No build pipeline.** Everything runs through `tsx` at dev time; `npm run
  build` (`tsc`) exists as a script but isn't part of the normal workflow yet
  and the compiler currently reports errors across the codebase (missing
  `@types/node`, ESM extension requirements) that haven't been cleaned up.
- **Most framework packages are empty stubs** — `auth`, `orm`, `database`,
  `validation`, `cache`, `queue`, `mail`, `events`, and others exist as
  placeholder directories only. Only `core`, `router`, `http`, and `cli` have
  real implementations, and those are minimal (basic DI container, route
  matching + middleware pipeline, a raw HTTP server).
- **`mool serve`** was an earlier attempt at a serve command; it boots a
  blank `Application` and never loads a project's routes. Use `dev`/`start`
  instead.

## Troubleshooting

**`npm run dev` prints CLI help / "Unknown command" instead of starting a server**
Your project's `package.json` is missing or wasn't found — `npm run` walks
up to the nearest `package.json` if the current directory doesn't have one,
which can end up running the *framework repo's* `dev` script instead of your
project's. Make sure you're inside the generated project directory and that
it has its own `package.json` (re-run `mool new` if it's missing).

**`Template "<name>" not found. Available templates: basic`**
You passed a template flag that doesn't correspond to a populated template.
Use `--basic` (or omit the flag).

**"Project already exists" on `mool new`**
The target directory already exists — pick a different name or remove the
existing directory first.
