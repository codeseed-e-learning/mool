import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

import type { DatabaseDriver, ExecuteResult } from "../driver.js";

export class SqliteDriver implements DatabaseDriver {
  private readonly connection: DatabaseSync;

  /**
   * SQLite here is a single shared connection, not a pool — running two
   * BEGINs concurrently on it would corrupt both transactions. This chains
   * transaction() calls so only one is ever open at a time; everything
   * else (plain queries) still runs immediately, unserialized.
   */
  private transactionLock: Promise<void> = Promise.resolve();

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

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const previous = this.transactionLock;
    let release!: () => void;
    this.transactionLock = new Promise((resolve) => {
      release = resolve;
    });
    await previous;

    try {
      await this.execute("BEGIN");

      try {
        const result = await callback();

        await this.execute("COMMIT");

        return result;
      } catch (error) {
        await this.execute("ROLLBACK");

        throw error;
      }
    } finally {
      release();
    }
  }

  async close(): Promise<void> {
    this.connection.close();
  }
}
