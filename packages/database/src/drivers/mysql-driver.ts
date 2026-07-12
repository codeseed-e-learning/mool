import mysql, { type Pool, type ResultSetHeader } from "mysql2/promise";

import type { DatabaseDriver, ExecuteResult } from "../driver";

export interface MysqlConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

export class MysqlDriver implements DatabaseDriver {
  private readonly pool: Pool;

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
    const [rows] = await this.pool.query(sql, params);

    return rows as T[];
  }

  async execute(sql: string, params: unknown[] = []): Promise<ExecuteResult> {
    const [result] = await this.pool.query<ResultSetHeader>(sql, params);

    return {
      lastInsertRowid: result.insertId,
      changes: result.affectedRows,
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
