export interface ExecuteResult {
  lastInsertRowid: number | bigint;
  changes: number | bigint;
}

export interface DatabaseDriver {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<ExecuteResult>;
  close(): Promise<void>;
}
