import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

import type { DatabaseDriver, ExecuteResult } from "../driver";

export class SqliteDriver implements DatabaseDriver {
  private readonly connection: DatabaseSync;

  constructor(
    databasePath = path.resolve(process.cwd(), "database", "database.sqlite")
  ) {
    if (databasePath !== ":memory:") {
      mkdirSync(path.dirname(databasePath), { recursive: true });
    }

    this.connection = new DatabaseSync(databasePath);
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<T[]> {
    return this.connection.prepare(sql).all(...(params as [])) as T[];
  }

  async execute(sql: string, params: unknown[] = []): Promise<ExecuteResult> {
    const result = this.connection.prepare(sql).run(...(params as []));

    return {
      lastInsertRowid: result.lastInsertRowid,
      changes: result.changes,
    };
  }

  async close(): Promise<void> {
    this.connection.close();
  }
}
