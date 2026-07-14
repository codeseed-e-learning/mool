import { Database } from "@codeseedelearning/mool-database";

import type { Model } from "./model.js";

const ALLOWED_OPERATORS = ["=", "!=", "<>", ">", "<", ">=", "<=", "LIKE", "NOT LIKE"];

function normalizeOperator(operator: string): string {
  const upper = operator.toUpperCase();
  const normalized = upper === "LIKE" || upper === "NOT LIKE" ? upper : operator;

  if (!ALLOWED_OPERATORS.includes(normalized)) {
    throw new Error(
      `Unsupported where operator: "${operator}". Allowed: ${ALLOWED_OPERATORS.join(", ")}`
    );
  }

  return normalized;
}

interface WhereClause {
  boolean: "AND" | "OR";
  sql: string;
  params: unknown[];
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

type ModelConstructor<T extends Model> = {
  table: string;
  new (attributes?: Record<string, unknown>): T;
};

/**
 * Chainable, lazily-executed query. Does nothing until you call a
 * terminal method (get/first/count/exists/paginate) — or just `await` it
 * directly, since it's "thenable": `await Model.where(...)` resolves to
 * the same T[] it always did, even though `where()` no longer returns a
 * bare Promise. Each builder is meant for a single terminal call — reusing
 * one across multiple calls after `.first()`/`.paginate()` (which mutate
 * `limit`/`offset`) will carry those over.
 */
export class QueryBuilder<T extends Model> implements PromiseLike<T[]> {
  private readonly wheres: WhereClause[] = [];
  private selectColumns = "*";
  private orderByClause: string | null = null;
  private limitValue: number | null = null;
  private offsetValue: number | null = null;

  constructor(private readonly modelClass: ModelConstructor<T>) {}

  where(column: string, operatorOrValue: unknown, value?: unknown): this {
    return this.addWhere("AND", column, operatorOrValue, value);
  }

  orWhere(column: string, operatorOrValue: unknown, value?: unknown): this {
    return this.addWhere("OR", column, operatorOrValue, value);
  }

  whereIn(column: string, values: unknown[]): this {
    const placeholders = values.map(() => "?").join(", ");

    this.wheres.push({
      boolean: "AND",
      sql: `${column} IN (${placeholders})`,
      params: [...values],
    });

    return this;
  }

  whereNull(column: string): this {
    this.wheres.push({ boolean: "AND", sql: `${column} IS NULL`, params: [] });

    return this;
  }

  whereNotNull(column: string): this {
    this.wheres.push({ boolean: "AND", sql: `${column} IS NOT NULL`, params: [] });

    return this;
  }

  select(...columns: string[]): this {
    this.selectColumns = columns.length > 0 ? columns.join(", ") : "*";

    return this;
  }

  orderBy(column: string, direction: "asc" | "desc" = "asc"): this {
    this.orderByClause = `${column} ${direction.toLowerCase() === "desc" ? "DESC" : "ASC"}`;

    return this;
  }

  limit(value: number): this {
    this.limitValue = value;

    return this;
  }

  offset(value: number): this {
    this.offsetValue = value;

    return this;
  }

  async get(): Promise<T[]> {
    const { clause, params } = this.buildWhere();

    let sql = `SELECT ${this.selectColumns} FROM ${this.modelClass.table}${clause}`;

    if (this.orderByClause) {
      sql += ` ORDER BY ${this.orderByClause}`;
    }

    if (this.limitValue !== null) {
      sql += " LIMIT ?";
      params.push(this.limitValue);
    }

    if (this.offsetValue !== null) {
      sql += " OFFSET ?";
      params.push(this.offsetValue);
    }

    const rows = await Database.query(sql, params);

    return rows.map((row) => new this.modelClass(row));
  }

  async first(): Promise<T | null> {
    const results = await this.limit(1).get();

    return results[0] ?? null;
  }

  /** Ignores select/orderBy/limit/offset — counts rows matching the where clause. */
  async count(): Promise<number> {
    const { clause, params } = this.buildWhere();

    const rows = await Database.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.modelClass.table}${clause}`,
      params
    );

    return Number(rows[0]?.count ?? 0);
  }

  async exists(): Promise<boolean> {
    return (await this.count()) > 0;
  }

  async paginate(page = 1, perPage = 15): Promise<PaginationResult<T>> {
    const safePage = Math.max(1, page);
    const total = await this.count();

    const data = await this.limit(perPage)
      .offset((safePage - 1) * perPage)
      .get();

    return {
      data,
      total,
      page: safePage,
      perPage,
      lastPage: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  then<TResult1 = T[], TResult2 = never>(
    onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  private addWhere(
    boolean: "AND" | "OR",
    column: string,
    operatorOrValue: unknown,
    value: unknown
  ): this {
    if (value === undefined) {
      this.wheres.push({ boolean, sql: `${column} = ?`, params: [operatorOrValue] });
    } else {
      const operator = normalizeOperator(String(operatorOrValue));

      this.wheres.push({ boolean, sql: `${column} ${operator} ?`, params: [value] });
    }

    return this;
  }

  private buildWhere(): { clause: string; params: unknown[] } {
    if (this.wheres.length === 0) {
      return { clause: "", params: [] };
    }

    const params: unknown[] = [];
    const parts = this.wheres.map((where, index) => {
      params.push(...where.params);

      return index === 0 ? where.sql : `${where.boolean} ${where.sql}`;
    });

    return { clause: ` WHERE ${parts.join(" ")}`, params };
  }
}
