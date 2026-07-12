# Mool — Step-by-Step: Install and Run a New Project

This is a focused, beginner-friendly walkthrough for creating a brand new
Mool project and getting it running. For the full framework reference
(every feature, package internals, publishing, etc.), see
[document.md](document.md).

---

## Prerequisites

Before you start, make sure you have:

- **Node.js 22.5 or newer** — required because the database layer uses
  Node's built-in `node:sqlite` module.
  Check your version:
  ```bash
  node -v
  ```
  If it's older than `v22.5.0`, install a newer version from
  [nodejs.org](https://nodejs.org) or via a version manager (`nvm`, `fnm`,
  etc.) before continuing.
- **npm** (ships with Node, no separate install needed).
- That's it — no database server, no global CLI install required, no
  cloning any repository. Projects use SQLite (a file on disk) by
  default, so there's nothing extra to run. A MySQL server is only needed
  if you choose to switch to it later — see [Step 9](#step-9-switch-to-mysql).

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
├── public/
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

---

## Step 3: Install dependencies

```bash
npm install
```

This pulls in the actual framework packages your project depends on
(routing, database, validation, auth, views, etc.) plus the `mool` CLI
itself as a local dev dependency — that last part is what lets
`npm run dev` work without any global install.

You should see something like:

```
added 19 packages, and audited 20 packages in Xs
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

# Register a user (real SQLite persistence + password hashing)
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
```

Or just open `http://localhost:3000/welcome` in your browser to see a
rendered page.

If all of those respond, your project is fully working end to end:
routing, config, validation, real database persistence, password hashing,
JWT authentication, and view rendering.

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
fill in the columns — the generated stub already includes the
dialect-aware `id` column pattern (see [Step 9](#step-9-switch-to-mysql)
for why that branching exists):

```ts
import { Migration, Database } from "@codeseedelearning/mool-database";

export default class extends Migration {
  async up(): Promise<void> {
    const isMysql = Database.dialect() === "mysql";
    const idColumn = isMysql
      ? "id INT AUTO_INCREMENT PRIMARY KEY"
      : "id INTEGER PRIMARY KEY AUTOINCREMENT";
    const textColumn = isMysql ? "VARCHAR(255)" : "TEXT";

    await Database.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        ${idColumn},
        title ${textColumn} NOT NULL,
        body ${textColumn} NOT NULL,
        created_at ${textColumn} NOT NULL
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
again — the post is still there. It's a real row in `database/database.sqlite`,
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

---

## Step 9: Switch to MySQL

By default, every Mool project uses **SQLite** — a file on disk, zero
setup, nothing to install or run separately. That's why everything above
just worked. If you'd rather use a real MySQL (or MariaDB) server instead,
here's how.

**What changes under the hood:** `mool-database` ships two drivers behind
one API — `Database.query()`/`Database.execute()` work identically either
way. Which driver is active is controlled entirely by the `DB_CONNECTION`
env var; you don't touch any code to switch.

### 9.1 Have a MySQL server running

You need a MySQL (or MariaDB) server reachable from your machine. Any of
these work:

- Already have one installed locally (MySQL, MariaDB, XAMPP, etc.) — just
  make sure it's running.
- Docker, if you don't want to install anything system-wide:
  ```bash
  docker run --name mool-mysql -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 -d mysql:8
  ```
- A managed/hosted MySQL instance (PlanetScale, RDS, etc.) — just use its
  connection details below instead of `127.0.0.1`.

### 9.2 Create a database

Using whatever client you have (the `mysql` CLI, a GUI like TablePlus/DBeaver,
phpMyAdmin, etc.):

```sql
CREATE DATABASE my_app;
```

### 9.3 Point your project at it

Edit `.env` (not `.env.example`) in your project root:

```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=my_app
DB_USERNAME=root
DB_PASSWORD=secret
```

That's the only change needed — no code edits, no reinstalling packages.

### 9.4 Run it

```bash
npm run dev
```

Migrations run automatically on boot, same as with SQLite — you should see
`Migrated: 0001_create_users_table.ts` again, this time creating the table
in your MySQL database instead of a `.sqlite` file.

Verify with the same commands from Step 5 (`POST /users`, `POST /login`,
etc.) — they behave identically; the driver switch is completely invisible
at the `Model`/route level.

### A real limitation to know about: migrations aren't automatically portable

`Database.query()`/`.execute()` work the same on both drivers (both use
`?` placeholders), but raw `CREATE TABLE` SQL is **not** identical between
SQLite and MySQL — e.g. SQLite's `INTEGER PRIMARY KEY AUTOINCREMENT` vs
MySQL's `INT AUTO_INCREMENT PRIMARY KEY`. There's no schema-builder DSL
that abstracts this away (the ORM is deliberately minimal), so migrations
need to branch on the dialect themselves. The generated `0001_create_users_table.ts`
migration (and the stub `mool make:migration` generates) already do this
for you — copy the pattern for any migration you write:

```ts
import { Migration, Database } from "@codeseedelearning/mool-database";

export default class extends Migration {
  async up(): Promise<void> {
    const isMysql = Database.dialect() === "mysql";
    const idColumn = isMysql
      ? "id INT AUTO_INCREMENT PRIMARY KEY"
      : "id INTEGER PRIMARY KEY AUTOINCREMENT";
    const textColumn = isMysql ? "VARCHAR(255)" : "TEXT";

    await Database.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        ${idColumn},
        title ${textColumn} NOT NULL
      )
    `);
  }

  async down(): Promise<void> {
    await Database.execute(`DROP TABLE IF EXISTS posts`);
  }
}
```

If you only ever plan to use one database (just SQLite, or just MySQL),
you can skip the `isMysql` branching entirely and hardcode whichever
syntax you need — the branching is only necessary if you want the same
migration file to work against either driver.

**Switching back to SQLite** later is just as easy: set
`DB_CONNECTION=sqlite` in `.env` (or delete the line — it's the default)
and restart. Your MySQL data stays in MySQL untouched; a fresh
`database/database.sqlite` gets created and migrated from scratch.

---

## ORM Reference: Everything about Models

Step 7 walked through creating and using one Model. This is the full
reference — every method, what it actually does under the hood, common
mistakes, and (since there's no query builder) exactly how to drop down to
raw SQL for anything the ORM doesn't cover.

**Philosophy, up front:** `mool-orm` is an Active Record layer with a real
chainable query builder underneath it — closer to Eloquent than earlier
versions of this doc suggested, but still deliberately narrow. It does
**not** do relationships, eager loading, soft deletes, automatic
timestamps, model hooks/events, or attribute casting. Anything beyond
querying/CRUD on a single table is one `Database.query()` call away,
shown at the end of this section.

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
migrations use, same `?` placeholder syntax, portable between SQLite and
MySQL:

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

### Migrations recap

Every table a Model reads from needs a migration that actually creates
it — the ORM doesn't create or alter tables itself. See
[Step 7.1](#71-create-a-migration-for-the-table) for the walkthrough, and
[Step 9](#step-9-switch-to-mysql) for why migrations branch on
`Database.dialect()`. Quick command reference:

| Command | What it does |
|---|---|
| `mool make:migration create_x_table` | Generate a new migration file |
| `mool migrate` | Apply every pending migration |
| `mool migrate:status` | List every migration as ✅ Ran or ⏳ Pending, without running anything |

---

## What's next

A few more natural next steps:

- **Protect a route** — wrap it with `.middleware(new AuthMiddleware())`
  (see `/profile` in `routes/web.ts`) to require a valid JWT.
- **Add more tables/models** — repeat [Step 7](#step-7-create-your-first-model)
  for anything else your app needs (comments, tags, whatever).
- **Query beyond single-column `where`** — the ORM is deliberately minimal
  (see the "Model quick reference" in Step 7); for anything more complex,
  drop down to `Database.query()`/`Database.execute()` with raw SQL.

For a full reference of every available feature (Config, Events, Cache,
ORM, Auth, Views, CLI commands, and what's still missing from the
framework), see [document.md](document.md).

---

## Troubleshooting

**`npm run dev` prints CLI help instead of starting a server**
You're probably not inside the project directory, or `package.json` is
missing. Run commands from inside `my-app/`.

**`EADDRINUSE: address already in use :::3000`**
Something else is already using port 3000 (maybe a previous `mool dev`
that didn't shut down cleanly). Either stop that process, or run on a
different port: `PORT=4000 npm run dev`.

**`node -v` shows a version older than 22.5**
Update Node.js first — the database layer requires Node's built-in
`node:sqlite`, which isn't available on older versions. (This applies even
if you're using MySQL — SQLite is still the framework's default and
`node:sqlite` is a required dependency of `mool-database` regardless of
which driver you actually use.)

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
