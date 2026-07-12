import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { Database } from "./database";
import type { Migration } from "./migration";

type MigrationConstructor = new () => Migration;

/**
 * Runs every not-yet-applied migration in database/migrations, in
 * filename order, tracking what's been applied in a `migrations` table.
 */
export async function runMigrations(
  migrationsDir = path.resolve(process.cwd(), "database", "migrations")
): Promise<void> {
  Database.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      run_at TEXT NOT NULL
    )
  `);

  let files: string[] = [];

  try {
    files = readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
      .sort();
  } catch {
    return;
  }

  const applied = new Set(
    Database.query<{ name: string }>("SELECT name FROM migrations").map(
      (row) => row.name
    )
  );

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const module = await import(
      pathToFileURL(path.join(migrationsDir, file)).href
    );
    const MigrationClass = module.default as MigrationConstructor;
    const migration = new MigrationClass();

    migration.up();

    Database.execute(
      "INSERT INTO migrations (name, run_at) VALUES (?, ?)",
      [file, new Date().toISOString()]
    );

    console.log(`Migrated: ${file}`);
  }
}
