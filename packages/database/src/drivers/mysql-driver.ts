import mysql, { type Pool, type PoolConnection, type ResultSetHeader } from "mysql2/promise";

import type { DatabaseDriver, ExecuteResult } from "../driver.js";

export interface MysqlConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

export class MysqlDriver implements DatabaseDriver {
  private readonly pool: Pool;

  /**
   * While a transaction is open, every query() / execute() call must land
   * on this one pinned connection instead of the pool — otherwise BEGIN and
   * the statements after it could run on different pooled connections and
   * the transaction would silently do nothing.
   */
  private activeConnection: PoolConnection | null = null;

  /** Only one transaction() may hold `activeConnection` at a time. */
  private transactionLock: Promise<void> = Promise.resolve();

  constructor(config: MysqlConfig = {}) {
    this.pool = mysql.createPool({
      host: config.host ?? "127.0.0.1",
      port: config.port ?? 3306,
      user: config.user ?? "root",
      password: config.password ?? "",
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<T[]> {
    const [rows] = await (this.activeConnection ?? this.pool).query(sql, params);

    return rows as T[];
  }

  async execute(sql: string, params: unknown[] = []): Promise<ExecuteResult> {
    const [result] = await (this.activeConnection ?? this.pool).query<ResultSetHeader>(
      sql,
      params
    );

    return {
      lastInsertRowid: result.insertId,
      changes: result.affectedRows,
    };
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const previous = this.transactionLock;
    let release!: () => void;
    this.transactionLock = new Promise((resolve) => {
      release = resolve;
    });
    await previous;

    const connection = await this.pool.getConnection();
    this.activeConnection = connection;

    try {
      await connection.beginTransaction();

      try {
        const result = await callback();

        await connection.commit();

        return result;
      } catch (error) {
        await connection.rollback();

        throw error;
      }
    } finally {
      this.activeConnection = null;
      connection.release();
      release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
