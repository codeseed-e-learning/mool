import path from "node:path";

import type { DatabaseDriver, ExecuteResult } from "./driver.js";
import { SqliteDriver } from "./drivers/sqlite-driver.js";
import { MysqlDriver } from "./drivers/mysql-driver.js";

export type { ExecuteResult } from "./driver.js";

export interface DatabaseConfig {
  connection?: "sqlite" | "mysql";
  /** SQLite: file path (or ":memory:"). MySQL: database name. */
  database?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}

export class Database {
  private static driver: DatabaseDriver | null = null;

  /**
   * Opens the database connection. Called automatically on first query if
   * you don't call it yourself.
   *
   * Driver selection reads from `config`, falling back to env vars:
   * DB_CONNECTION ("sqlite" [default] or "mysql"), and for MySQL:
   * DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD. For SQLite,
   * DB_DATABASE overrides the default database/database.sqlite path.
   */
  static connect(config: DatabaseConfig = {}): void {
    const connection = config.connection ?? process.env.DB_CONNECTION ?? "sqlite";

    if (connection === "mysql") {
      this.driver = new MysqlDriver({
        host: config.host ?? process.env.DB_HOST,
        port: config.port ?? (process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined),
        user: config.username ?? process.env.DB_USERNAME,
        password: config.password ?? process.env.DB_PASSWORD,
        database: config.database ?? process.env.DB_DATABASE,
      });
      return;
    }

    const sqlitePath = config.database ?? process.env.DB_DATABASE;

    this.driver = new SqliteDriver(
      sqlitePath ? path.resolve(process.cwd(), sqlitePath) : undefined
    );
  }

  static async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<T[]> {
    return this.getDriver().query<T>(sql, params);
  }

  static async execute(sql: string, params: unknown[] = []): Promise<ExecuteResult> {
    return this.getDriver().execute(sql, params);
  }

  /**
   * Runs `callback` inside a transaction — commits if it resolves, rolls
   * back and rethrows if it throws. Every `Database.query()`/`.execute()`
   * call made during `callback` (including through `Model`/`QueryBuilder`,
   * since they go through this same static class) automatically
   * participates in the transaction — no connection/client object to pass
   * around.
   *
   * Only one transaction runs at a time per process: a second concurrent
   * `transaction()` call waits for the first to finish rather than
   * interleaving. That's a deliberate simplicity tradeoff, not a bug — see
   * the "Transactions" section of guide.md.
   */
  static async transaction<T>(callback: () => Promise<T>): Promise<T> {
    return this.getDriver().transaction(callback);
  }

  static async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
    }
  }

  /**
   * Which driver is active. Useful for writing migrations that need
   * different DDL per database (e.g. AUTOINCREMENT vs AUTO_INCREMENT) —
   * the query/execute layer itself is portable (both drivers use `?`
   * placeholders), but CREATE TABLE syntax generally isn't.
   */
  static dialect(): "sqlite" | "mysql" {
    return this.getDriver() instanceof MysqlDriver ? "mysql" : "sqlite";
  }

  private static getDriver(): DatabaseDriver {
    if (!this.driver) {
      this.connect();
    }

    return this.driver!;
  }
}
