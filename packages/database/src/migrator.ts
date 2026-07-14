import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { Database } from "./database.js";
import type { Migration } from "./migration.js";

type MigrationConstructor = new () => Migration;

export interface MigrationStatus {
  name: string;
  ran: boolean;
  ranAt: string | null;
}

async function ensureMigrationsTable(): Promise<void> {
  const idColumn =
    Database.dialect() === "mysql"
      ? "id INT AUTO_INCREMENT PRIMARY KEY"
      : "id INTEGER PRIMARY KEY AUTOINCREMENT";

  await Database.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      ${idColumn},
      name VARCHAR(255) NOT NULL UNIQUE,
      run_at VARCHAR(255) NOT NULL
    )
  `);
}

function readMigrationFiles(migrationsDir: string): string[] {
  try {
    return readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
      .sort();
  } catch {
    return [];
  }
}

/**
 * Runs every not-yet-applied migration in database/migrations, in
 * filename order, tracking what's been applied in a `migrations` table.
 */
export async function runMigrations(
  migrationsDir = path.resolve(process.cwd(), "database", "migrations")
): Promise<void> {
  await ensureMigrationsTable();

  const files = readMigrationFiles(migrationsDir);

  const appliedRows = await Database.query<{ name: string }>(
    "SELECT name FROM migrations"
  );
  const applied = new Set(appliedRows.map((row) => row.name));

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const module = await import(
      pathToFileURL(path.join(migrationsDir, file)).href
    );
    const MigrationClass = module.default as MigrationConstructor;
    const migration = new MigrationClass();

    await migration.up();

    await Database.execute(
      "INSERT INTO migrations (name, run_at) VALUES (?, ?)",
      [file, new Date().toISOString()]
    );

    console.log(`Migrated: ${file}`);
  }
}

/**
 * Lists every migration file alongside whether it's been run, and when.
 * Doesn't run anything — safe to call at any time, including before any
 * migration has ever run (creates the tracking table if missing, same as
 * runMigrations, but applies nothing).
 */
export async function getMigrationStatus(
  migrationsDir = path.resolve(process.cwd(), "database", "migrations")
): Promise<MigrationStatus[]> {
  await ensureMigrationsTable();

  const files = readMigrationFiles(migrationsDir);

  const appliedRows = await Database.query<{ name: string; run_at: string }>(
    "SELECT name, run_at FROM migrations"
  );
  const appliedAt = new Map(appliedRows.map((row) => [row.name, row.run_at]));

  return files.map((file) => ({
    name: file,
    ran: appliedAt.has(file),
    ranAt: appliedAt.get(file) ?? null,
  }));
}
