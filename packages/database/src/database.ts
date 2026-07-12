import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

export interface ExecuteResult {
  lastInsertRowid: number | bigint;
  changes: number | bigint;
}

export class Database {
  private static connection: DatabaseSync | null = null;

  /**
   * Opens the SQLite connection. Called automatically on first query if
   * you don't call it yourself.
   */
  static connect(
    databasePath = path.resolve(process.cwd(), "database", "database.sqlite")
  ): void {
    if (databasePath !== ":memory:") {
      mkdirSync(path.dirname(databasePath), { recursive: true });
    }

    this.connection = new DatabaseSync(databasePath);
  }

  static query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): T[] {
    return this.getConnection().prepare(sql).all(...(params as [])) as T[];
  }

  static execute(sql: string, params: unknown[] = []): ExecuteResult {
    const result = this.getConnection().prepare(sql).run(...(params as []));

    return {
      lastInsertRowid: result.lastInsertRowid,
      changes: result.changes,
    };
  }

  static close(): void {
    this.connection?.close();
    this.connection = null;
  }

  private static getConnection(): DatabaseSync {
    if (!this.connection) {
      this.connect();
    }

    return this.connection!;
  }
}
