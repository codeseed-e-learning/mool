# Mool — Complete Guide

Mool is a Laravel-inspired backend framework for Node.js/TypeScript,
published as scoped npm packages under `@codeseedelearning/*`. This is the
**single, complete reference** for the project — installing it, every
feature with usage examples, the full CLI, what's implemented vs. not,
and how to work on the framework itself. Nothing else to read.

---

## Table of contents

1. [Packages](#packages)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create the project](#step-1-create-the-project)
4. [Step 2: Move into the project](#step-2-move-into-the-project)
5. [Step 3: Install dependencies](#step-3-install-dependencies)
6. [Step 4: Start the dev server](#step-4-start-the-dev-server)
7. [Step 5: Confirm it's working](#step-5-confirm-its-working)
8. [Step 6: Create your first controller](#step-6-create-your-first-controller)
9. [Step 7: Create your first Model](#step-7-create-your-first-model)
10. [Step 8: Create your first view](#step-8-create-your-first-view)
11. [More framework features, with usage examples](#more-framework-features-with-usage-examples)
12. [ORM Reference: Everything about Models](#orm-reference-everything-about-models)
13. [CLI command reference](#cli-command-reference)
14. [Complete feature inventory](#complete-feature-inventory)
15. [Roadmap — what's next](#roadmap--whats-next)
16. [For maintainers: working on the framework itself](#for-maintainers-working-on-the-framework-itself)
17. [Troubleshooting](#troubleshooting)

---

## Packages

Mool is split into scoped npm packages under `@codeseedelearning/*` (the
unscoped `mool` name was already taken by an unrelated package on the
registry).

| Package | What it is | Version | Published? |
|---|---|---|---|
| `@codeseedelearning/mool` | The `mool` CLI (scaffolding, `dev`/`start`, `migrate`, etc.) | 0.0.7 | ✅ |
| `@codeseedelearning/mool-core` | Application/DI container, service providers | 0.0.5 | ✅ |
| `@codeseedelearning/mool-router` | Route definitions, matching, real `next()`-based middleware pipeline | 0.0.4 | ✅ |
| `@codeseedelearning/mool-http` | Request/Response wrappers, `HttpResponse`, the HTTP server, static file serving from `public/` | 0.0.5 | ✅ |
| `@codeseedelearning/mool-config` | `.env` + `config/*.ts` loading | 0.0.2 | ✅ |
| `@codeseedelearning/mool-events` | `Event.listen()` / `Event.dispatch()` pub-sub | 0.0.2 | ✅ |
| `@codeseedelearning/mool-validation` | Rule-based request validation | 0.0.2 | ✅ |
| `@codeseedelearning/mool-cache` | In-memory cache with TTL | 0.0.2 | ✅ |
| `@codeseedelearning/mool-database` | MySQL (`mysql2`) connections, migrations, transactions | 0.0.5 | ✅ |
| `@codeseedelearning/mool-orm` | Active Record `Model` with a real chainable query builder | 0.0.5 | ✅ |
| `@codeseedelearning/mool-jwt` | Zero-dependency HS256 JWT sign/verify | 0.0.2 | ✅ |
| `@codeseedelearning/mool-auth` | Password hashing (scrypt) + JWT auth (`createToken`, `AuthMiddleware`) | 0.0.4 | ✅ |
| `@codeseedelearning/mool-view` | Minimal zero-dependency view engine (`<%= %>`/`<% %>` tags), layouts + reusable components (`layout()`/`component()`), `View.render()`, `html()` | 0.0.3 | ✅ |

Everything is live on npm — a fresh `npx @codeseedelearning/mool new` pulls
every package straight from the registry, no local/unpublished state.

---

## Prerequisites

Before you start, make sure you have:

- **Node.js** (any reasonably recent LTS) and **npm** (ships with Node,
  no separate install needed).
- **A MySQL (or MariaDB) server reachable from your machine.** MySQL is
  the only database Mool supports — there's no bundled/zero-config
  option, so migrations and anything touching `Database`/`Model` need a
  real server before they'll work. Any of these work:
  - Already have one installed locally (MySQL, MariaDB, XAMPP, etc.) —
    just make sure it's running.
  - Docker, if you don't want to install anything system-wide:
    ```bash
    docker run --name mool-mysql -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 -d mysql:8
    ```
  - A managed/hosted MySQL instance (PlanetScale, RDS, etc.) — just use
    its connection details instead of `127.0.0.1` when you configure
    `.env` in [Step 3](#step-3-install-dependencies).
- No global CLI install required, no cloning any repository — `npx` pulls
  everything on demand.

---

## Step 1: Create the project

Open a terminal, `cd` into wherever you keep your projects, and run:

```bash
npx @codeseedelearning/mool new my-app --basic
```

What happens:
- `npx` downloads the `mool` CLI just for this command (nothing installed
  globally unless you choose to later).
- `new my-app` scaffolds a new folder called `my-app` in your current
  directory.
- `--basic` selects the `basic` starter template — currently the only
  populated template. (Leaving the flag off also defaults to `basic`.)

You should see output like:

```
Creating project "my-app" from the "basic" template...

Project created successfully.

Next steps:
  cd my-app
  npm install
  npm run dev
```

If you see `Project "my-app" already exists.`, either pick a different
name or remove the existing folder first.

**Creating multiple projects?** Install the CLI once instead of using
`npx` every time:

```bash
npm install -g @codeseedelearning/mool
mool new my-app --basic
```

---

## Step 2: Move into the project

```bash
cd my-app
```

Take a quick look at what was generated:

```
my-app/
├── app/
│   ├── Controllers/HomeController.ts
│   ├── Middleware/
│   └── Models/User.ts
├── bootstrap/app.ts        # wires everything together, runs migrations
├── config/app.ts
├── database/
│   └── migrations/0001_create_users_table.ts
├── resources/
│   └── views/welcome.html
├── routes/web.ts           # your routes live here
├── public/                 # static assets — served as-is, e.g. public/css/nav.css -> /css/nav.css
├── storage/
├── package.json
├── tsconfig.json
├── .env                    # generated automatically — see below
├── .env.example
└── .gitignore
```

A `.env` file was already created for you (copied from `.env.example`)
with a real, randomly-generated `APP_KEY` filled in — this is the secret
used to sign JWTs for authentication, so login/auth works immediately with
no manual setup.

**Point it at your MySQL server.** `.env`'s `DB_*` values default to
`127.0.0.1:3306`, database `mool`, user `root`, no password — edit them
to match your server if that's not accurate:

```bash
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mool
DB_USERNAME=root
DB_PASSWORD=
```

Then create that database (Mool creates tables via migrations, but not
the database itself):

```sql
CREATE DATABASE mool;
```

---

## Step 3: Install dependencies

```bash
npm install
```

This pulls in the actual framework packages your project depends on —
`mool-core`, `mool-router`, `mool-config`, `mool-events`,
`mool-validation`, `mool-cache`, `mool-database`, `mool-orm`, `mool-jwt`,
`mool-auth`, `mool-view` — plus `@codeseedelearning/mool` itself as a
`devDependency`. That last part is what lets `npm run dev` work using the
locally-installed CLI, with no global install required at all.

You should see something like (the exact count includes `mysql2`'s own
transitive dependencies, so it'll drift over time — don't worry if it
doesn't match exactly):

```
added 29 packages, and audited 30 packages in Xs
found 0 vulnerabilities
```

---

## Step 4: Start the dev server

```bash
npm run dev
```

This runs `mool dev`, which:
1. Loads `bootstrap/app.ts`.
2. Runs any pending database migrations automatically (you'll see
   `Migrated: 0001_create_users_table.ts` the first time).
3. Registers the routes from `routes/web.ts`.
4. Starts an HTTP server on port `3000` by default.
5. **Watches your files** — any change you save to a route, controller,
   model, migration, or view automatically restarts the server. You don't
   need to stop and restart it yourself while developing.

You should see:

```
🚀 Bootstrapping Mool...
🚀 Mool server running at http://localhost:3000
```

To use a different port:

```bash
PORT=4000 npm run dev
```

To stop the server, press `Ctrl+C` in the terminal.

`npm run start` (`mool start`) does the same thing but runs once — no
file watching. Use that for production/always-on.

---

## Step 5: Confirm it's working

Open a **second terminal** (leave the dev server running in the first one)
and try the built-in example routes:

```bash
# Basic health check
curl http://localhost:3000/health
# → OK

# Home route (reads config/app.ts)
curl http://localhost:3000/

# Register a user (real MySQL persistence + password hashing)
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Amit","email":"amit@example.com","password":"secret123"}'

# Log in (issues a real JWT)
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amit@example.com","password":"secret123"}'
# → {"success":true,"token":"eyJ..."}

# Access a protected route (replace <token> with the value from above)
curl http://localhost:3000/profile -H "Authorization: Bearer <token>"

# Rendered HTML view
curl http://localhost:3000/welcome

# Cache
curl http://localhost:3000/cached-time
```

Or just open `http://localhost:3000/welcome` in your browser to see a
rendered page.

If all of those respond, your project is fully working end to end:
routing, config, validation, real database persistence, password hashing,
JWT authentication, caching, and view rendering.

---

## Step 6: Create your first controller

Controllers live in `app/Controllers/` and are just plain classes with
static methods — the router calls the method directly, whatever it
returns becomes the response.

**Generate one:**

```bash
mool make:controller PostController
```

You should see:

```
✅ Controller created: app/Controllers/PostController.ts
```

Open it — the generated stub looks like this:

```ts
export class PostController {
  static index(): string {
    return "";
  }
}
```

**Give it something real to do.** Replace the body of `index`:

```ts
export class PostController {
  static index() {
    return {
      posts: [
        { id: 1, title: "Hello, Mool" },
        { id: 2, title: "Second post" },
      ],
    };
  }
}
```

A plain object return is automatically sent back as JSON — no extra work
needed (that's how `HomeController.index()` already works).

**Wire it to a route.** Open `routes/web.ts`, import it, and register a
route:

```ts
import { PostController } from "../app/Controllers/PostController.js";

Route.get("/posts", PostController.index);
```

Save both files. Since `npm run dev` is watching, the server restarts on
its own — no manual restart needed.

**Test it:**

```bash
curl http://localhost:3000/posts
```

```json
{"posts":[{"id":1,"title":"Hello, Mool"},{"id":2,"title":"Second post"}]}
```

---

## Step 7: Create your first Model

So far `PostController` returns a hardcoded array. Let's back it with a
real database table instead, using `mool-orm`'s `Model` class — the same
pattern `app/Models/User.ts` already uses for the built-in auth routes.

### 7.1 Create a migration for the table

```bash
mool make:migration create_posts_table
```

```
✅ Migration created: database/migrations/20260713120000_create_posts_table.ts
```

(Your actual filename will have today's timestamp instead.) Open it and
fill in the columns:

```ts
import { Migration, Database } from "@codeseedelearning/mool-database";

export default class extends Migration {
  async up(): Promise<void> {
    await Database.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body VARCHAR(255) NOT NULL,
        created_at VARCHAR(255) NOT NULL
      )
    `);
  }

  async down(): Promise<void> {
    await Database.execute(`DROP TABLE IF EXISTS posts`);
  }
}
```

Since `npm run dev` is watching and runs pending migrations on every
restart, saving this file and letting the server reload applies it
automatically. To apply it without restarting, or to double check it
actually ran, use:

```bash
mool migrate            # applies any pending migrations right now
mool migrate:status     # lists every migration as ✅ Ran or ⏳ Pending
```

```
  ✅ Ran      0001_create_users_table.ts  (2026-07-13T10:00:00.000Z)
  ✅ Ran      20260713120000_create_posts_table.ts  (2026-07-13T10:05:00.000Z)

All migrations are up to date.
```

### 7.2 Create the Model

```bash
mool make:model Post
```

```
✅ Model created: app/Models/Post.ts
   Table name guessed as "posts" — adjust the "static table" line if that's wrong.
```

The table name is guessed from the model name (PascalCase → snake_case,
then pluralized with common English rules: `Post` → `posts`, `Category` →
`categories`, `Box` → `boxes`, `BlogPost` → `blog_posts`). It's a
heuristic, not a full inflector — check the generated file and fix
`static table` if your model has an irregular plural (`Person` → `people`,
not `persons`).

The generated file is exactly this — no schema declaration needed. `Model`
reads whatever columns actually exist on the row and exposes them as
instance properties automatically once you fetch or create one:

```ts
import { Model } from "@codeseedelearning/mool-orm";

export class Post extends Model {
  static table = "posts";
}
```

### 7.3 Use it in your controller

Every `Model` method is **async** — real database calls, so they all need
`await`. Update `PostController`:

```ts
import { Post } from "../Models/Post.js";

export class PostController {
  static async index() {
    const posts = await Post.all();

    return { posts };
  }

  static async store(request) {
    const post = await Post.create({
      title: request.body.title,
      body: request.body.body,
      created_at: new Date().toISOString(),
    });

    return { success: true, post };
  }
}
```

Wire up the new route in `routes/web.ts`:

```ts
Route.get("/posts", PostController.index);
Route.post("/posts", PostController.store);
```

### 7.4 Test it

```bash
# Empty at first
curl http://localhost:3000/posts
# → {"posts":[]}

# Create one
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello, Mool","body":"My first real post."}'
# → {"success":true,"post":{"id":1,"title":"Hello, Mool","body":"My first real post.","created_at":"..."}}

# List again — now persisted
curl http://localhost:3000/posts
# → {"posts":[{"id":1,"title":"Hello, Mool", ...}]}
```

Restart the server (or let the watcher do it) and run the second `curl`
again — the post is still there. It's a real row in your MySQL database,
not in-memory state that resets on restart.

### Model quick reference

All of these are `async` — always `await` them (or a route handler
returning the resulting `Promise` works too, same as any other route).

| Call | What it does |
|---|---|
| `Post.all()` | Every row: `SELECT * FROM posts` |
| `Post.find(id)` | One row by id, or `null` if not found |
| `Post.findOrFail(id)` | Same, but throws `ModelNotFoundError` instead of returning `null` |
| `Post.first()` | The first row, or `null` if the table is empty |
| `Post.where("title", value)` | Rows matching a single column equality |
| `Post.where("views", ">", 10)` | Rows matching a comparison (`=`, `!=`, `<`, `>`, `<=`, `>=`, `LIKE`, `NOT LIKE`) |
| `Post.count()` / `Post.exists()` | Row count / whether any row matches |
| `Post.paginate(page, perPage)` | `{ data, total, page, perPage, lastPage }` |
| `Post.create({ ... })` | Inserts, then returns the created row (with its new `id`) |
| `post.update({ ... })` | Updates that row, merges the change onto the in-memory instance |
| `post.delete()` | Deletes that row |

There's also a real chainable query builder now —
`Post.where(...).orderBy(...).limit(...).get()` — covered in full in the
[ORM Reference](#orm-reference-everything-about-models) below. Still no
relationships (`hasMany`/`belongsTo`), timestamps/soft-delete helpers, or
joins — for those, write the SQL yourself with `Database.query()`/
`Database.execute()` directly (same functions the migrations use).

---

## Step 8: Create your first view

Views are `.html` files in `resources/views/`, rendered with `View.render()`
and returned with `html()` so the response gets a proper
`Content-Type: text/html` header instead of JSON.

**Create the view file** — `resources/views/posts.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><%= title %></title>
</head>
<body>
  <h1><%= title %></h1>

  <% if (posts.length > 0) { %>
    <ul>
      <% for (const post of posts) { %>
        <li><%= post.title %></li>
      <% } %>
    </ul>
  <% } else { %>
    <p>No posts yet.</p>
  <% } %>
</body>
</html>
```

Quick syntax reference:
- `<%= expr %>` — prints a value, **HTML-escaped** (safe default for any data)
- `<%- expr %>` — prints a value **unescaped** (only for HTML you trust)
- `<% code %>` — runs raw JS with no output — `if`/`for`/etc.

**Render it from your controller.** Update `PostController` to return HTML
instead of JSON:

```ts
import { View, html } from "@codeseedelearning/mool-view";

export class PostController {
  static index() {
    return html(View.render("posts", {
      title: "All Posts",
      posts: [
        { id: 1, title: "Hello, Mool" },
        { id: 2, title: "Second post" },
      ],
    }));
  }
}
```

The object passed as the second argument to `View.render()` is exactly
what's available inside the `.html` file — its keys (`title`, `posts`)
become the variables `<%= title %>` and `<% for (const post of posts) %>`
reference.

**Test it:**

```bash
curl -i http://localhost:3000/posts
```

You should see `Content-Type: text/html; charset=utf-8` in the headers,
and the rendered page in the body — or just open
`http://localhost:3000/posts` in a browser.

**Trust model:** templates are compiled with `new Function` (same
technique EJS uses internally) — they run as trusted code with full JS
access, same as EJS/Handlebars-with-helpers. Never compile a template
sourced from user input; only render `.html` files you wrote yourself.

### Layouts and reusable components

Two more helpers are always in scope inside a template, on top of
`<%= %>`/`<%- %>`/`<% %>`: `layout()` and `component()`. Together they let
you build a page out of a shared layout plus reusable, prop-driven
components — the same shape as a React app (`<Layout><Card /></Layout>`),
just spelled with template tags instead of JSX.

**`layout(name, data?)`** wraps the current view's rendered output in
`resources/views/<name>.html` (by convention, put layouts under
`resources/views/layouts/`). The layout receives `data` merged with
whatever object you pass here, plus a `children` variable holding the
page's rendered body — the equivalent of a React layout's `{children}`
prop:

```html
<!-- resources/views/welcome.html -->
<% layout("layouts/app", { title }) %>
<h1>Hello <%= name %></h1>
```

```html
<!-- resources/views/layouts/app.html -->
<!DOCTYPE html>
<html>
<head><title><%= title %></title></head>
<body>
  <%- children %>
</body>
</html>
```

Call `layout()` anywhere in the page template (top is conventional). It
just records which layout to use — the actual wrapping happens after the
page finishes rendering, so `layout()` can itself appear inside a layout
to nest further.

**`component(name, props, childrenFn?)`** renders
`resources/views/components/<name>.html` with `props` as its data, like a
React component with props. The optional third argument is a callback
whose emitted markup is captured and passed to the component as
`children` — React's `props.children`:

```html
<!-- resources/views/components/Card.html -->
<div class="card">
  <h2><%= heading %></h2>
  <div class="body"><%- children %></div>
</div>
```

```html
<!-- used from any view or layout -->
<% component("Card", { heading: "Features" }, function () { %>
  <ul>
    <% for (const f of features) { %>
      <li><%= f %></li>
    <% } %>
  </ul>
<% }); %>

<!-- a leaf component with no children just omits the third argument -->
<% component("Header", { active: "home" }); %>
```

**Always call `component()` as a bare `<% %>` statement**, never inside
`<%- %>`/`<%= %>`. It writes its own output directly (so the children
callback's markup can span multiple tags, the same way `<% if (...) { %>`
already does) — wrapping it in `<%- %>` would write the output twice. A
component with no markup children can also take a plain string via
`props.children` instead of a callback.

Scaffold new ones with the CLI, same as controllers and models:

```bash
mool make:layout app          # resources/views/layouts/app.html
mool make:component Card      # resources/views/components/Card.html
```

See `resources/views/welcome.html`, `resources/views/layouts/app.html`,
and `resources/views/components/` in a freshly generated project for a
working example — `welcome.html` already uses the layout plus the
`PageHeader`/`PageFooter` components shipped with the `basic` template.

### Static assets: CSS, JS, images (`public/`)

Anything placed under `public/` is served as-is at the matching URL
path — put a stylesheet at `public/css/nav.css` and it's reachable at
`/css/nav.css`, no route needed:

```html
<link rel="stylesheet" href="/css/nav.css">
<script src="/js/app.js"></script>
<img src="/images/logo.png" alt="Logo">
```

This is handled by `Server` (`@codeseedelearning/mool-http`) itself, ahead
of routing: on every `GET`/`HEAD` request it first checks whether the URL
maps to a real file under `public/` (resolved relative to `process.cwd()`
— your project root) and streams it back with a `Content-Type` inferred
from the file extension (`.css`, `.js`, `.json`, `.svg`, `.png`, `.woff2`,
etc. — anything unrecognized falls back to `application/octet-stream`).
Only if no static file matches does the request fall through to
`Router.resolve()`, so a route and a file under `public/` can never both
claim the same path — the static file always wins. Requests that try to
escape `public/` (e.g. `/../package.json`) are rejected the same as a
missing file.

No setup needed — every generated project already has a `public/`
directory ready to drop files into.

---

## More framework features, with usage examples

Steps 1–8 covered routing, the database/ORM, auth, and views in depth.
The rest of the framework in one place:

```ts
// config: config/app.ts is loaded automatically; read it anywhere via
import { Config } from "@codeseedelearning/mool-config";
Config.get("app.name", "Mool"); // reads process.env.APP_NAME via .env
Config.all();                   // introspect everything loaded
Config.clear();                 // reset (mainly for tests)

// events: fire-and-forget pub/sub
import { Event } from "@codeseedelearning/mool-events";
Event.listen("user.registered", (payload) => { /* ... */ });
Event.dispatch("user.registered", { name: "Amit" }); // awaits every listener
Event.clear("user.registered"); // or Event.clear() for all listeners

// validation: rule strings, Laravel-style
import { validate } from "@codeseedelearning/mool-validation";
const { valid, errors } = validate(request.body, {
  name: "required|string|min:2",
  email: "required|email",
});
// supported rules: required, string, number, email, min:N, max:N
// (length for strings, value for numbers)

// cache: in-memory, with TTL — resets on process restart, single-process only
import { Cache } from "@codeseedelearning/mool-cache";
Cache.put("key", value, 60);          // store with a 60s TTL
Cache.get("key");                     // undefined if missing/expired
Cache.has("key");
Cache.forget("key");
Cache.flush();                        // clear everything
const value = await Cache.remember("key", 10, () => expensiveWork());

// middleware: real next()-based pipeline, fully async
Route.get("/profile", (request) => {
  return { success: true, user: request.state.user };
}).middleware(new AuthMiddleware());
// Middleware.handle(request, next) — call next() to continue the chain
// (and get its result back), or return your own value to short-circuit.
// Mutate request before calling next() to pass data forward, e.g.
// request.state.user = ... (request.state is a generic bag for exactly this).

// transactions: wrap multi-write operations so they succeed or fail together
import { Database } from "@codeseedelearning/mool-database";
await Database.transaction(async () => {
  const user = await User.create({ name: "Amit", email: "amit@example.com" });
  await Profile.create({ user_id: user.id, bio: "..." });
});
// full details: "Transactions" under the ORM Reference below
```

Migrations (`database/migrations/*.ts`) run automatically every time you
`mool dev`/`start` — no separate step needed for local dev, though `mool
migrate` also exists for running them explicitly (e.g. in a deploy step).

---

## ORM Reference: Everything about Models

Step 7 walked through creating and using one Model. This is the full
reference — every method, what it actually does under the hood, common
mistakes, and exactly how to drop down to raw SQL for anything the ORM
doesn't cover.

**Philosophy, up front:** `mool-orm` is an Active Record layer with a real
chainable query builder underneath it — closer to Eloquent than a purely
minimal wrapper, but still deliberately narrow. It does **not** do
relationships, eager loading, soft deletes, automatic timestamps, model
hooks/events, or attribute casting. Anything beyond querying/CRUD on a
single table is one `Database.query()` call away, shown at the end of
this section.

### Defining a Model

```bash
mool make:model Post
```

generates:

```ts
import { Model } from "@codeseedelearning/mool-orm";

export class Post extends Model {
  static table = "posts";
}
```

That `static table` line is the entire contract between your class and
the database — there's no column/type declaration, no decorators, nothing
else required. `Model` figures out what properties an instance has purely
from whatever columns come back in the row.

### Reading data

**`Model.all()`** — every row in the table.

```ts
const posts = await Post.all();
// Post[] — could be an empty array, never null
```

**`Model.find(id)`** — one row by primary key, or `null`.

```ts
const post = await Post.find(3);

if (!post) {
  return { success: false, message: "Not found" };
}

console.log(post.title);
```

Always check for `null` before using the result — unlike `all()`/`where()`
(which return `[]` when nothing matches), `find()` returns `null`, not an
empty object.

**`Model.where(column, value)`** — rows matching a single column equality.
Returns an **array**, even if you expect at most one match — this is the
one place people most often trip up:

```ts
// WRONG — result is an array, .email doesn't exist on an array
const user = await User.where("email", "amit@example.com");
console.log(user.email); // undefined

// RIGHT — destructure the first element
const [user] = await User.where("email", "amit@example.com");
console.log(user?.email); // works, and ?. guards against no match
```

This is exactly the pattern used in the built-in `/login` route
(`routes/web.ts`) — `where` for a unique-ish lookup, destructured
immediately.

**`Model.first()`** — the first row, or `null` if the table (or the
filtered query) has no matches. Like `find()`, always check for `null`.

```ts
const latest = await Post.orderBy("created_at", "desc").first();
```

**`Model.findOrFail(id)`** — same as `find()`, but throws a
`ModelNotFoundError` instead of returning `null`. Useful in a route where
a missing record should just become an error response rather than a
manual `if (!post)` check:

```ts
import { ModelNotFoundError } from "@codeseedelearning/mool-orm";

try {
  const post = await Post.findOrFail(id);
  return { post };
} catch (error) {
  if (error instanceof ModelNotFoundError) {
    return { success: false, message: error.message };
  }
  throw error;
}
```

**`Model.count()`** / **`Model.exists()`** — row count, or whether at
least one row matches:

```ts
const total = await Post.count();
const hasAny = await Post.where("published", true).exists();
```

### The query builder

Every read method above is actually a shortcut onto a chainable query
builder. `Model.where(...)` doesn't return a `Promise` directly — it
returns a builder that is itself `await`-able (so all the code above still
works unchanged), but you can also keep chaining before awaiting it:

```ts
const posts = await Post
  .where("published", true)
  .orderBy("created_at", "desc")
  .limit(10)
  .get(); // .get() is optional — `await` alone also works
```

**Comparison operators** — `where(column, operator, value)`, not just
equality. Allowed operators: `=`, `!=`, `<>`, `<`, `>`, `<=`, `>=`,
`LIKE`, `NOT LIKE` (anything else throws, so raw SQL can't sneak in
through this argument):

```ts
const popular = await Post.where("views", ">", 100);
const drafts = await Post.where("title", "LIKE", "%draft%");
```

**`orWhere(column, value)`** — chains an `OR` instead of an `AND`:

```ts
const matches = await Post
  .where("status", "published")
  .orWhere("status", "featured");
// WHERE status = ? OR status = ?
```

**`whereIn(column, values)`** — matches any value in an array:

```ts
const some = await Post.whereIn("id", [1, 2, 3]);
```

**`whereNull(column)` / `whereNotNull(column)`:**

```ts
const noAuthor = await Post.whereNull("author_id");
```

**`select(...columns)`** — restrict which columns come back (default is
`*`):

```ts
const titles = await Post.select("id", "title").get();
```

**`orderBy(column, direction?)`** — `direction` is `"asc"` (default) or
`"desc"`:

```ts
const newest = await Post.orderBy("created_at", "desc");
```

**`limit(n)` / `offset(n)`:**

```ts
const page2 = await Post.orderBy("id").limit(10).offset(10);
```

**`paginate(page, perPage)`** — wraps `limit`/`offset`/`count` into one
call, returning `{ data, total, page, perPage, lastPage }`:

```ts
const result = await Post.where("published", true).paginate(2, 10);
// result.data      -> Post[] (rows 11-20)
// result.total      -> total matching rows across all pages
// result.lastPage   -> Math.ceil(total / perPage)
```

All of these chain together freely — `Model.where(...).orWhere(...).whereIn(...).orderBy(...).limit(...).offset(...)`
— and every chain still ends the same two ways: call `.get()` explicitly,
or just `await` the builder directly. `.first()`, `.count()`, `.exists()`,
and `.paginate()` are terminal methods — call them instead of `.get()`
when that's what you need, not in addition to it.

One thing the builder does **not** support: it's meant for a single
terminal call. Reusing the same builder variable for two different awaits
(e.g. calling `.first()` and then `.get()` on the same stored builder)
will carry over whatever `limit`/`offset` the first call set — build a
fresh `Model.where(...)` chain per query instead of storing and reusing a
builder.

### Writing data

**`Model.create(attributes)`** — inserts a row, then re-fetches and
returns it as a full instance (so auto-generated columns like `id` come
back populated, not just what you passed in):

```ts
const post = await Post.create({
  title: "Hello",
  body: "...",
  created_at: new Date().toISOString(),
});

console.log(post.id); // populated, even though you didn't pass it in
```

Pass exactly the columns your table has (minus auto-increment ones like
`id`) — there's no validation or column-checking, so a typo'd or missing
required column surfaces as a raw database error (`NOT NULL constraint
failed`, `Unknown column`, etc.), not a friendly ORM error. Validate with
`@codeseedelearning/mool-validation` *before* calling `create()`, the way
every built-in route already does.

**`instance.update(attributes)`** — updates that row, and merges the same
attributes onto the in-memory object so it stays in sync without
re-fetching:

```ts
const post = await Post.find(1);

if (post) {
  await post.update({ title: "Updated title" });
  console.log(post.title); // "Updated title" — merged automatically
}
```

Only pass the columns you're changing — `update()` doesn't touch anything
you don't include.

**`instance.delete()`** — deletes that row. The in-memory object still
exists afterward (JS doesn't have a way to "undefine" an object), but the
database row is gone — don't call `.update()`/`.delete()` on it again.

```ts
const post = await Post.find(1);
await post?.delete();
```

### Async gotchas

Every single Model method is `async`. The single most common mistake:
forgetting `await` and getting a `Promise` object instead of your data —

```ts
// WRONG — posts is a Promise, not an array
const posts = Post.all();
return { posts }; // {"posts":{}}  — a Promise serializes to {}

// RIGHT
const posts = await Post.all();
return { posts }; // {"posts":[...]}
```

If you ever see `{}` where you expected real data, check for a missing
`await` first — this exact bug (an un-awaited `Router.resolve()`) was a
real one found and fixed in this framework's own router earlier on.

### Beyond what the ORM supports

The query builder above covers single-table filtering, ordering,
pagination, and simple comparisons. It still doesn't do relationships,
joins, aggregates other than `count()`, or `AND`/`OR` groups with mixed
precedence (e.g. `WHERE a AND (b OR c)`). For any of those, use
`Database.query()`/`Database.execute()` directly — same functions
migrations use, same `?` placeholder syntax:

**Joins:**

```ts
const postsWithAuthors = await Database.query(`
  SELECT posts.*, users.name AS author_name
  FROM posts
  JOIN users ON users.id = posts.user_id
`);
```

**Aggregates:**

```ts
const [{ count }] = await Database.query<{ count: number }>(
  "SELECT COUNT(*) as count FROM posts"
);
```

**Relationships (manual, since there's no `hasMany`/`belongsTo`):**

```ts
// "has many" — fetch a post's comments yourself
const post = await Post.find(1);
const comments = post
  ? await Database.query("SELECT * FROM comments WHERE post_id = ?", [post.id])
  : [];
```

If you want the result mapped back into your `Model` class instead of a
plain object, wrap raw rows the same way `Model`'s own methods do:

```ts
const rows = await Database.query("SELECT * FROM posts WHERE published = ?", [true]);
const posts = rows.map((row) => new Post(row));
```

(`new Post(row)` works because `Model`'s constructor just does
`Object.assign(this, attributes)` — any plain object of column data
becomes a usable instance.)

### Transactions

Any time a request needs **more than one write to succeed or fail
together** — create a user and a related row, transfer a balance between
two accounts, anything where a partial write would leave bad data behind
— wrap it in `Database.transaction()`:

```ts
import { Database } from "@codeseedelearning/mool-database";

await Database.transaction(async () => {
  const user = await User.create({ name: "Amit", email: "amit@example.com" });
  await Profile.create({ user_id: user.id, bio: "..." });
});
```

If the callback throws (a failed `create()`, a thrown validation error,
anything), every write made inside it — including through `Model.create()`/
`update()`/`delete()` and raw `Database.execute()` calls — is rolled back
as if none of it happened, and the error propagates to your route handler:

```ts
Route.post("/transfer", async (request) => {
  try {
    await Database.transaction(async () => {
      const from = await Account.findOrFail(request.body.fromId);
      const to = await Account.findOrFail(request.body.toId);

      if (Number(from.balance) < request.body.amount) {
        throw new Error("Insufficient balance");
      }

      await from.update({ balance: Number(from.balance) - request.body.amount });
      await to.update({ balance: Number(to.balance) + request.body.amount });
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
});
```

No connection or client object to thread through your code — every
`Model`/`Database` call made anywhere during the callback automatically
participates in the same transaction, because they all go through the
same underlying connection.

**How it's implemented:** a single connection is checked out of the
MySQL pool (`pool.getConnection()`) and pinned for the duration of the
callback — `query()`/`execute()` check for a pinned connection first and
use it instead of the pool when one is set. Released back to the pool in
a `finally` regardless of commit/rollback. An internal promise-chain lock
serializes concurrent `transaction()` calls so only one holds the pinned
connection at a time.

**One tradeoff to know about:** only one transaction runs at a time, per
process. If two requests call `Database.transaction()` at the same
moment, the second one's callback simply waits for the first to finish
(commit or rollback) before it starts — they never interleave, so data
can't get corrupted by two transactions racing on the same connection,
but they also don't run in parallel. For the request volumes this
framework targets, that serialization is unlikely to be a bottleneck —
but it's worth knowing this isn't the same concurrency model as a
connection-per-transaction production database layer.

Don't call `.first()`/`.get()` from outside a `transaction()` callback and
expect it to see uncommitted writes from an in-progress transaction
elsewhere — that's correct behavior (uncommitted data shouldn't be
visible), not a bug.

### Migrations recap

Every table a Model reads from needs a migration that actually creates
it — the ORM doesn't create or alter tables itself. See
[Step 7.1](#71-create-a-migration-for-the-table) for the walkthrough.
Quick command reference:

| Command | What it does |
|---|---|
| `mool make:migration create_x_table` | Generate a new migration file |
| `mool migrate` | Apply every pending migration |
| `mool migrate:status` | List every migration as ✅ Ran or ⏳ Pending, without running anything |

---

## CLI command reference

| Command | Description |
|---|---|
| `mool help` | List available commands |
| `mool version` | Show CLI version |
| `mool new <name> [--<template>]` | Scaffold a new project (`--basic` is the only real template today) |
| `mool dev` | Load `bootstrap/app.ts` and start the server, **auto-restarting on file changes** (routes, controllers, models, views — anything loaded, via `tsx watch`) |
| `mool start` | Same, but runs once — no file watching. Use for production/always-on. |
| `mool serve` | Starts a bare server with **no** routes loaded — a leftover from early development, not project-aware. Prefer `dev`/`start`. |
| `mool make:controller <Name>` | Generate `app/Controllers/<Name>.ts` from a stub |
| `mool make:model <Name>` | Generate `app/Models/<Name>.ts` from a stub, with the table name guessed via a small built-in pluralizer (`Post` → `posts`, `Category` → `categories`, `BlogPost` → `blog_posts`) — not a full inflector, irregular plurals need a manual fix |
| `mool make:layout <name>` | Generate `resources/views/layouts/<name>.html` from a stub |
| `mool make:component <Name>` | Generate `resources/views/components/<Name>.html` from a stub |
| `mool migrate` | Run every pending file in `database/migrations/`, tracked in a `migrations` table |
| `mool migrate:status` | List every migration with ✅ Ran (+ timestamp) or ⏳ Pending — runs nothing, safe to call any time |
| `mool make:migration <name>` | Generate a timestamped migration file (table name inferred from `create_x_table`-style names) |

---

## Complete feature inventory

"Implemented" means real, working code that's been exercised and verified
end to end (not a stub).

### CLI — `@codeseedelearning/mool` (published)

| Feature | Details |
|---|---|
| `mool new <name> [--<template>]` | Scaffolds a project by copying a template directory, patching `package.json`'s `name`, restoring `.gitignore` (shipped as `gitignore` to survive npm's tarball stripping). Only `--basic` has real content. |
| `mool dev` | Finds `bootstrap/app.ts` in the current directory, dynamically imports it (registering routes as a side effect), starts the HTTP server on `PORT` or `3000` — run under `tsx watch`, so any change to a loaded file kills and restarts the process automatically. |
| `mool start` | Same underlying command as `dev`, but runs once (no watch). |
| `mool make:controller <Name>` | Generates from a stub file, resolved relative to the CLI package itself (works standalone, not just in the monorepo). |
| `mool make:model <Name>` | Generates a `Model` subclass with `static table` pre-filled via a small built-in pluralizer. Rejects if the file already exists. |
| `mool make:layout <name>` | Generates `resources/views/layouts/<name>.html` from a stub. Rejects if the file already exists. |
| `mool make:component <Name>` | Generates `resources/views/components/<Name>.html` from a stub. Rejects if the file already exists. |
| `mool migrate` | Runs every pending file in `database/migrations/` in filename order, tracking what's applied in a `migrations` table so re-runs are a no-op. |
| `mool migrate:status` | Creates the tracking table if missing (applies nothing), lists every migration file with ✅/⏳ and the applied timestamp, plus a pending count. |
| `mool make:migration <name>` | Generates a timestamp-prefixed migration file, deriving the table name from `create_x_table`-style names. |
| `.env` auto-setup on `mool new` | Copies `.env.example` to `.env` and fills an empty `APP_KEY=` line with a random 32-byte key — mirrors Laravel's `key:generate`, so auth works with zero manual setup. |

### Core — `@codeseedelearning/mool-core` (published)

| Feature | Details |
|---|---|
| `Container` | `bind(Class, instance?)` / `make(Class)` — a flat singleton map. No auto-wiring, no constructor injection, no reflection — you must bind everything by hand. |
| `Application` | Owns the container, binds `Server` into it, exposes `register(provider)`, `make(Class)`, `bootstrap()`, `start(port)`. |
| `Kernel` | Thin wrapper: `boot()` calls `application.bootstrap()`, `start()` calls `application.start()`. |
| `Provider` (abstract class) | `register()` / `boot()` lifecycle hooks, both no-ops by default. |
| `ProviderRepository` | Holds registered providers, calls `register()` on all of them then `boot()` on all of them. |

Note: `Application.bootstrap()` calls into this provider lifecycle, but
no `Provider` subclasses exist anywhere in the framework or template —
routes/database/config are all wired via plain static imports instead.
The container/provider system is real and working, just currently unused
in practice.

### Router — `@codeseedelearning/mool-router@0.0.4` (published)

| Feature | Details |
|---|---|
| `Route.get/post/put/delete(path, handler)` | Static registration into a shared `RouteCollection`. |
| Path param matching | `:id`-style segments, e.g. `/users/:id` → `request.params.id`. |
| `.middleware(m)` chaining | Attaches one or more `Middleware` to a route definition, in call order. |
| **Real middleware pipeline** | `Middleware.handle(request, next)` — an onion-style chain built with `reduceRight`. Each middleware calls `next()` to continue (and gets the downstream result back), or returns its own value to short-circuit. Fully async. Mutate `request` before calling `next()` to pass data forward. |
| `Router.resolve(request)` | Matches method+path, builds the middleware pipeline, awaits and returns its result. |
| 404 | Returns the literal string `"404 Not Found"` when no route matches — doesn't set a real HTTP status code (known gap). |

### HTTP — `@codeseedelearning/mool-http@0.0.5` (published)

| Feature | Details |
|---|---|
| `Request` | Wraps Node's `IncomingMessage`: `.method`, `.url`, `.headers`, `.params`, `.body` (JSON-parsed, falls back to `{}` on parse failure), and `.state` — a generic bag middleware use to pass data forward, e.g. `request.state.user = ...`. |
| `Response` | `.status(code)`, `.header(name, value)`, `.send(string)` (text/plain), `.json(data)` — all chainable except the terminal two. |
| `HttpResponse` | Return `new HttpResponse(status, body)` from a route handler or middleware to control the actual HTTP status code — plain return values always send `200`. This is what makes `AuthMiddleware`'s 401 a real 401. |
| `Server` | Raw `node:http` server: on `GET`/`HEAD`, first checks for a matching file under `public/` and streams it back with an extension-based `Content-Type` (see [Static assets](#static-assets-css-js-images-public) in Step 8); otherwise reads the full request body, JSON-parses it, calls the router; catches thrown errors into a generic `500 {"success":false,"message":"Internal Server Error"}`. |
| `Response.raw` | Escape hatch to the underlying `node:http` `ServerResponse` — used internally to pipe static file streams. |

### Config — `@codeseedelearning/mool-config` (published)

| Feature | Details |
|---|---|
| `loadEnv(path?)` | Parses a `.env` file (`KEY=VALUE`, `#` comments, quoted values) into `process.env`, without overriding variables already set. |
| `Config.load(dir?)` | Dynamically imports every `.ts`/`.js` file in `config/`, indexes each by filename (`config/app.ts` → `Config.get("app")`). |
| `Config.get(key, fallback?)` | Dot-notation lookup, e.g. `Config.get("app.port")`. |
| `Config.all()` / `Config.clear()` | Introspection / reset (mainly useful for tests). |

### Events — `@codeseedelearning/mool-events` (published)

| Feature | Details |
|---|---|
| `Event.listen(name, handler)` | Registers a handler for a named event. |
| `Event.dispatch(name, payload)` | Awaits every registered handler in registration order. |
| `Event.clear(name?)` | Removes listeners for one event, or all of them. |

### Validation — `@codeseedelearning/mool-validation` (published)

| Feature | Details |
|---|---|
| `validate(data, rules)` | Laravel-style rule strings (`"required\|string\|min:2"`) per field, returns `{ valid, errors }`. |
| Supported rules | `required`, `string`, `number`, `email`, `min:N`, `max:N` (length for strings, value for numbers). |

### Cache — `@codeseedelearning/mool-cache` (published)

| Feature | Details |
|---|---|
| `Cache.put(key, value, ttlSeconds?)` | In-memory `Map` store, optional expiry. |
| `Cache.get(key)` / `.has(key)` / `.forget(key)` | Standard cache reads/eviction, lazily expires on read. |
| `Cache.remember(key, ttl, callback)` | Get-or-compute-and-store pattern. |
| `Cache.flush()` | Clears everything. |

Single-process, in-memory only — doesn't survive a restart, no
Redis/file/Memcached drivers.

### Database — `@codeseedelearning/mool-database@0.0.5` (published)

MySQL/MariaDB only, via `mysql2` (the one genuine external dependency
anywhere in this framework), behind a small `?`-placeholder query API.

| Feature | Details |
|---|---|
| `Database.connect(config?)` | Opens a MySQL connection pool from `config`, falling back to env vars (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`). Lazily called on first query if you never call it yourself. |
| `Database.query(sql, params?)` | `async` — runs a `SELECT`, returns rows as plain objects. |
| `Database.execute(sql, params?)` | `async` — runs an `INSERT`/`UPDATE`/`DELETE`, returns `{ lastInsertRowid, changes }`. |
| `Database.close()` | `async` — closes the active connection pool. |
| `Database.transaction(callback)` | `async` — commits if `callback` resolves, rolls back and rethrows if it throws. See [Transactions](#transactions) above. |
| `Migration` (abstract class) | `up()` / `down()`, `void \| Promise<void>` — write (`await`ed) SQL against `Database.execute()`. |
| `runMigrations(dir?)` | `async`. Creates a `migrations` tracking table if missing, `await`s every not-yet-applied file in filename order. |

Every method is `async` — real network I/O on the MySQL side means
there's no way to represent that behind a sync API.

### ORM — `@codeseedelearning/mool-orm@0.0.5` (published)

An Active Record-style layer on top of `mool-database`, with a real
chainable query builder underneath the `Model` static methods. See the
full [ORM Reference](#orm-reference-everything-about-models) above for
usage — quick summary of everything it exposes:

`Model.query()`, `.all()`, `.find(id)`/`.findOrFail(id)`, `.first()`,
`.firstWhere(...)`, `.count()`/`.exists()`, `.paginate(page?, perPage?)`,
`.where(...)`/`.orWhere(...)` (equality or a whitelisted operator:
`=`,`!=`,`<>`,`<`,`>`,`<=`,`>=`,`LIKE`,`NOT LIKE`), `.whereIn(...)`,
`.whereNull(...)`/`.whereNotNull(...)`, `.select(...)`, `.orderBy(...)`,
`.limit(...)`/`.offset(...)`, `.get()`, `.create(...)`,
`instance.update(...)`, `instance.delete()`, and `ModelNotFoundError`
(exported, thrown by `findOrFail`).

**Design note — `QueryBuilder` as a thenable:** `Model.where(...)` doesn't
return a bare `Promise`; it returns a `QueryBuilder` that implements
`PromiseLike<T[]>` (a `then()` that delegates to `.get()`). That means
every call site — `await User.where(...)`, `const [user] = await
User.where(...)` — works exactly as if it returned a plain array promise,
while also supporting `.orderBy().limit().offset()` chaining before
awaiting.

What it still does **not** have: relationships (hasMany/belongsTo), eager
loading, validation hooks, automatic timestamps, soft deletes, model
hooks/events, attribute casting, or a schema/column-type system. Complex
joins/aggregates/mixed `AND`/`OR` grouping still drop down to
`Database.query()` directly — an intentional scope boundary.

### JWT — `@codeseedelearning/mool-jwt` (published)

Zero-dependency JWT, HS256 only (uses `node:crypto`'s `createHmac`, no
external JWT library).

| Feature | Details |
|---|---|
| `sign(payload, secret, expiresInSeconds?)` | Adds `iat`/`exp` automatically (default TTL 1 hour), returns the standard `header.payload.signature` string. |
| `verify(token, secret)` | Checks part count, signature (via `crypto.timingSafeEqual`), and expiry; throws `JwtError` with a specific message on any failure. |

Only one algorithm exists on purpose — no RS256/alg-negotiation, so
there's no "alg: none" class of vulnerability to worry about.

### Auth — `@codeseedelearning/mool-auth@0.0.2` (published)

JWT-based only (no sessions, no OAuth) — password hashing + token
issuance/verification, built on `mool-jwt`.

| Feature | Details |
|---|---|
| `hashPassword(password)` | `scrypt` with a random 16-byte salt per password (`node:crypto`, no `bcrypt`), returns `"salt:hash"` (both hex) as a single string to store. |
| `verifyPassword(password, hashed)` | Re-derives the hash with the stored salt, compares with `timingSafeEqual`. |
| `createToken(payload, options?)` | Thin wrapper over `mool-jwt`'s `sign()`; secret defaults to `process.env.APP_KEY`. |
| `verifyToken(token, secret?)` | Same default-secret behavior, wraps `mool-jwt`'s `verify()`. |
| `getBearerToken(request)` | Extracts the token from an `Authorization: Bearer <token>` header, or `null`. |
| `AuthMiddleware` | Verifies the bearer token; on success attaches the decoded payload to `request.state.user` and calls `next()`; on failure short-circuits with a real `HttpResponse(401, ...)`. |

Deliberately doesn't depend on `mool-orm`/`mool-database` — it only
handles password hashing and token issuance/verification. Looking
up/creating users is left to the app.

### View — `@codeseedelearning/mool-view` (published)

A minimal, zero-dependency view engine — no external templating library,
compiled with `new Function` (same technique EJS uses internally).

| Feature | Details |
|---|---|
| `compile(template)` | Compiles a template string to a render function. Tags: `<%= expr %>` (escaped), `<%- expr %>` (raw), `<% code %>` (arbitrary JS). |
| `View.render(name, data?, viewsDir?)` | Reads `resources/views/<name>.html`, compiles (cached by resolved file path), executes with `data`, returns the HTML string. |
| `View.clearCache()` | Drops the compiled-template cache. |
| `html(body, status?)` | Wraps a rendered string in an `HttpResponse` with `Content-Type: text/html; charset=utf-8` (status defaults to 200). |
| `layout(name, data?)` | In-template helper (always in scope). Wraps the view's rendered output in `resources/views/<name>.html`, passing it `data` merged with `children` (the view's rendered body). See [Layouts and reusable components](#layouts-and-reusable-components) in Step 8. |
| `component(name, props?, childrenFn?)` | In-template helper (always in scope). Renders `resources/views/components/<name>.html` with `props`; the optional children callback's captured markup is passed as `props.children`, React-style. Must be called as a bare `<% %>` statement. |

### Distribution / tooling

| Feature | Details |
|---|---|
| npm workspaces monorepo | `packages/*`, root `package.json` marked `private`. |
| `npx @codeseedelearning/mool new my-app --basic` | Verified working end-to-end from the real registry — zero cloning. |
| Local-CLI-via-devDependency pattern | Generated projects get `@codeseedelearning/mool` as a `devDependency`, so `npm run dev` uses the locally installed CLI — no global install needed. |
| `basic` template | The only populated template; demonstrates Config, Events, Validation, Cache, real database persistence, full JWT auth, and view rendering together in `routes/web.ts`. |

### What's NOT implemented

These exist as empty directories (`.gitkeep` only) or don't exist at all:

- **Database transactions across concurrent requests** — `transaction()`
  exists (see above), but only one runs at a time per process; not true
  connection-per-transaction concurrency.
- **`queue`** — no background job system.
- **`mail`** — no mailer/transport.
- **`filesystem`** — no `Storage`-style abstraction for `public/`/`storage/`
  (the CLI has its own internal file-copying helper, but nothing
  user-facing).
- **`console`** — no way for a user's own app to register custom CLI
  commands (only the framework's own commands exist).
- **`contracts`** — no centralized interfaces package; `Middleware`/
  `RouteHandler` types live inside the router package instead.
- **`support`** — no helper/utility function library (`Str`/`Arr`
  equivalents).
- **`testing`** — no test harness, no HTTP test client, no assertions
  helpers.
- **Authorization** — no Gates/Policies.
- **Rate limiting/throttling** — none. A route like `/login` is
  brute-forceable as-is.
- **Logging** — nothing beyond `console.log`; no log levels, no
  structured output.
- **`packages/templates/*`** (root-level `default`) — dead code,
  superseded by `packages/cli/src/templates/basic`.

### Partially built / known gaps

- **`Request.query`** — the property exists (`Record<string, string>`)
  but nothing ever parses the URL's query string into it; always `{}`.
- **`mool serve`** — still registered as a command but boots a blank
  `Application` with no routes loaded; dead code superseded by
  `dev`/`start`.
- **`--api` / `--full-stack` templates** — flags exist and are rejected
  cleanly, but no content behind them.
- **Error handling** — any thrown error becomes a generic
  `500 Internal Server Error`; no custom exception classes, no per-route
  error handlers.
- **No CORS support.**
- **Auth is JWT-only and stateless** — no refresh tokens, no
  logout/revocation mechanism.
- **The container/provider system is unused** — real and wired into
  `Application.bootstrap()`, but zero `Provider` subclasses exist
  anywhere; everything is wired via plain static imports instead.

---

## Roadmap — what's next

Ranked by actual risk if shipped as-is, not by feature completeness:

1. **✅ Database transactions** — done (see [Transactions](#transactions)).
   Was the top priority: any multi-step write could previously fail
   halfway and leave the database inconsistent.
2. **Rate limiting** — a live gap. `/login` has zero throttling right now
   and is brute-forceable.
3. **Logging** — the only visibility into a running server is
   `console.log`; nothing to debug from if something breaks in
   production.
4. **A testing framework** — without one, every change risks silent
   regressions that only surface from manual `curl` testing.
5. **✅ Static file serving** — done (`public/` is served by `Server`
   itself, see [Static assets](#static-assets-css-js-images-public) in
   Step 8). **CORS is still a live gap** — needed for almost any real
   app calling this from a browser on a different origin; can be a real
   middleware using the router's pipeline.
6. **Authorization (Gates/Policies).**
7. **Refresh tokens / logout / token revocation** — current auth is
   stateless JWT only; no way to invalidate a token before it expires.
8. **✅ Layouts/reusable components for views** — done (see
   [Layouts and reusable components](#layouts-and-reusable-components) in
   Step 8). `layout()`/`component()` helpers give React-style layout
   nesting and prop-driven components with a `children` slot; no
   `<% include('partial') %>`-style ad hoc includes, but that's covered by
   `component()`.
9. **Relationships/eager loading in the ORM** — `hasMany`/`belongsTo`/
   `with()` remain out of scope for now, but would be the next natural
   ORM step after the query builder.

Everything else in "What's NOT implemented" above (mail, queues, file
storage, custom CLI commands, wiring up the container/providers) is real
missing functionality, but additive — the app doesn't misbehave without
them, it just can't do those specific things yet.

---

## For maintainers: working on the framework itself

Skip this section unless you're contributing to Mool itself, not just
using it. This is a monorepo (`packages/*`) using npm workspaces.

### Local setup

```bash
git clone <this-repo-url> mool
cd mool
npm install
npm link
```

`npm install` links all `@codeseedelearning/mool-*` packages to each
other via workspace symlinks in the root `node_modules`. `npm link` makes
the root's own `bin/mool.js` available globally as `mool`, backed by the
live source in `packages/cli/src/index.ts` via `tsx` — no build step
needed for local dev.

```bash
mool help                    # verify the link worked
mool new my-app --basic      # scaffold a test project inside the repo
cd my-app && npm install && npm run dev
```

To remove the link later: `npm unlink -g mool`.

> **Note:** the repo has a project named `my-app` at the root used as the
> running example/manual-test bed for verifying changes end to end — it's
> kept in sync with the `basic` template as features are built and tested.

### Recurring gotcha: stale nested `node_modules` copies

npm workspace hoisting can create a real (non-symlinked) copy of a
package inside another package's `node_modules` (most often
`packages/*/node_modules/@codeseedelearning/*`) instead of a symlink to
the local workspace source — this happens whenever a package's declared
dependency range (e.g. `"@codeseedelearning/mool-database": "^0.0.2"`)
no longer matches the current local version of that dependency (e.g. it's
been bumped to `0.0.3` locally but not yet published). Because of npm's
strict `0.0.x` semver behavior, `^0.0.2` matches *only* `0.0.2`, so npm
fetches the last-published `0.0.2` from the registry into a nested copy
rather than linking to the newer local source.

**Fix:** bump the dependency range to match the current local version,
then do a full clean reinstall (incremental `npm install` doesn't always
invalidate a stale lockfile resolution):

```bash
find packages -maxdepth 2 -name node_modules -type d -exec rm -rf {} +
rm -rf node_modules my-app/node_modules package-lock.json
npm install
```

### TypeScript / NodeNext module resolution

Every package uses `"moduleResolution": "NodeNext"`, which enforces real
Node.js ESM rules — relative imports **require an explicit extension**
(`./route.js`, not `./route`), even though the source files are `.ts`.
`tsx` (what `mool dev`/`start` actually run under) resolves extensionless
imports leniently regardless of this setting, so missing extensions won't
break anything at runtime — but they will surface as `Module has no
exported member 'X'` errors in `tsc`/VS Code's language server, cascading
from wherever the extension is missing up through every re-export barrel
file that imports it. Keep every internal relative import
extension-correct to avoid this.

`@types/node` needs to be an explicit `devDependency` (it isn't picked up
reliably via implicit walk-up discovery under this workspace's hoisting
layout) — `my-app`'s and the template's `tsconfig.json` both set
`"types": ["node"]` explicitly for this reason.

### Publishing the packages

Packages must publish in dependency order (each depends on the one
before it): `mool-http` → `mool-router` → `mool-core` → `mool`, separately
`mool-database` → `mool-orm`, and separately `mool-jwt` → `mool-auth`.
`mool-config`, `mool-events`, `mool-validation`, and `mool-cache` have no
cross-package dependencies, so they can publish any time. All packages
already have `publishConfig.access: "public"` set, so a plain
`npm publish` works for scoped packages without extra flags.

```bash
npm login   # once, interactively — do this yourself, not via an agent

cd packages/http         && npm publish
cd ../router              && npm publish
cd ../core                && npm publish
cd ../cli                 && npm publish
cd ../config              && npm publish
cd ../events               && npm publish
cd ../validation           && npm publish
cd ../cache                 && npm publish
cd ../database                && npm publish
cd ../orm                      && npm publish
cd ../jwt                       && npm publish
cd ../auth                       && npm publish
```

Publishing requires npm's 2FA on the account. If you don't have OTP-based
2FA (authenticator app), a Granular Access Token with the 2FA-bypass
option enabled works for CLI publishing — see npmjs.com → your account →
Access Tokens. **Never commit a token to the repo** — store it in a
temporary `.npmrc` outside the repo (`npm publish --userconfig <path>`)
and delete it immediately after use.

Before publishing for real, verify the whole chain works exactly as an
external user would see it — pack each package to a tarball and install
from the tarballs in a directory *outside* this repo (so workspace
symlinks can't paper over a broken dependency):

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
`npm install && npm run dev` there.

Bump the `version` field in whichever package.json(s) changed before
re-publishing; npm rejects re-publishing an existing version. Note npm's
0.0.x semver quirk: `^0.0.1` only matches `0.0.1` exactly (not `0.0.2`), so
bumping a package's patch version also requires bumping the version ranges
of anything that depends on it, and republishing those too — see the
"stale nested `node_modules`" gotcha above, which is the local-dev
symptom of this exact issue.

---

## Troubleshooting

**`npm run dev` prints CLI help / "Unknown command" instead of starting a server**
Your project's `package.json` is missing or wasn't found — `npm run` walks
up to the nearest `package.json` if the current directory doesn't have one,
which can end up running a *different* `dev` script than your project's
(e.g. the framework repo's own, if you're working inside it). Make sure
you're inside the generated project directory and that it has its own
`package.json` (re-run `mool new` if it's missing).

**`EADDRINUSE: address already in use :::3000`**
Something else is already using port 3000 (maybe a previous `mool dev`
that didn't shut down cleanly). Either stop that process, or run on a
different port: `PORT=4000 npm run dev`.

**`Template "<name>" not found. Available templates: basic`**
You passed a template flag that doesn't correspond to a populated
template. Use `--basic` (or omit the flag).

**"Project already exists" on `mool new`**
The target directory already exists — pick a different name or remove the
existing directory first.

**`Error: connect ECONNREFUSED` when using MySQL**
Nothing is listening on the host/port in your `.env`. Confirm your MySQL
server is actually running and reachable (`DB_HOST`/`DB_PORT`), and that
nothing else (a firewall, wrong container port mapping, etc.) is blocking
it.

**`Error: Access denied for user '...'@'...'`**
`DB_USERNAME`/`DB_PASSWORD` in `.env` don't match a valid MySQL user for
that host. Double-check them, and that the user has privileges on the
database named in `DB_DATABASE`.

**`Error: Unknown database '...'`**
The database named in `DB_DATABASE` doesn't exist yet — create it first
(`CREATE DATABASE my_app;`), Mool doesn't create the database itself, only
the tables inside it (via migrations).

**`E404` on `@codeseedelearning/mool-http` (or similar) during `npm install`**
Two likely causes: (1) right after a fresh `npm publish`, the registry's
CDN can take up to a minute to propagate — wait briefly and retry; or (2)
if you're testing from a tarball rather than the registry, you forgot to
also point a transitive dependency at its tarball too (e.g. `mool-core`
depends on `mool-http`).

**Module has no exported member 'X' in VS Code, but the app runs fine**
A TypeScript module-resolution issue, not a runtime bug — see
["TypeScript / NodeNext module resolution"](#typescript--nodenext-module-resolution)
under "For maintainers" above.
