import { Database } from "@codeseedelearning/mool-database";

import { QueryBuilder, type PaginationResult } from "./query-builder";
import { ModelNotFoundError } from "./errors";

type Ctor<T extends Model> = {
  table: string;
  new (attributes?: Record<string, unknown>): T;
};

export abstract class Model {
  static table: string;

  [key: string]: unknown;

  id?: number;

  constructor(attributes: Record<string, unknown> = {}) {
    Object.assign(this, attributes);
  }

  // --- Query builder entry points (chainable, and directly awaitable) ---

  static query<T extends typeof Model>(this: T): QueryBuilder<InstanceType<T>> {
    return new QueryBuilder(this as unknown as Ctor<InstanceType<T>>);
  }

  static where<T extends typeof Model>(
    this: T,
    column: string,
    operatorOrValue: unknown,
    value?: unknown
  ): QueryBuilder<InstanceType<T>> {
    return this.query().where(column, operatorOrValue, value);
  }

  static orWhere<T extends typeof Model>(
    this: T,
    column: string,
    operatorOrValue: unknown,
    value?: unknown
  ): QueryBuilder<InstanceType<T>> {
    return this.query().orWhere(column, operatorOrValue, value);
  }

  static whereIn<T extends typeof Model>(
    this: T,
    column: string,
    values: unknown[]
  ): QueryBuilder<InstanceType<T>> {
    return this.query().whereIn(column, values);
  }

  static whereNull<T extends typeof Model>(
    this: T,
    column: string
  ): QueryBuilder<InstanceType<T>> {
    return this.query().whereNull(column);
  }

  static whereNotNull<T extends typeof Model>(
    this: T,
    column: string
  ): QueryBuilder<InstanceType<T>> {
    return this.query().whereNotNull(column);
  }

  static select<T extends typeof Model>(
    this: T,
    ...columns: string[]
  ): QueryBuilder<InstanceType<T>> {
    return this.query().select(...columns);
  }

  static orderBy<T extends typeof Model>(
    this: T,
    column: string,
    direction: "asc" | "desc" = "asc"
  ): QueryBuilder<InstanceType<T>> {
    return this.query().orderBy(column, direction);
  }

  static limit<T extends typeof Model>(
    this: T,
    value: number
  ): QueryBuilder<InstanceType<T>> {
    return this.query().limit(value);
  }

  static offset<T extends typeof Model>(
    this: T,
    value: number
  ): QueryBuilder<InstanceType<T>> {
    return this.query().offset(value);
  }

  // --- Immediate reads ---

  static async all<T extends typeof Model>(this: T): Promise<InstanceType<T>[]> {
    return this.query().get();
  }

  static async find<T extends typeof Model>(
    this: T,
    id: number | string
  ): Promise<InstanceType<T> | null> {
    return this.query().where("id", id).first();
  }

  static async findOrFail<T extends typeof Model>(
    this: T,
    id: number | string
  ): Promise<InstanceType<T>> {
    const result = await this.find(id);

    if (!result) {
      throw new ModelNotFoundError(`${this.name} with id "${id}" not found.`);
    }

    return result;
  }

  static async first<T extends typeof Model>(this: T): Promise<InstanceType<T> | null> {
    return this.query().first();
  }

  static async firstWhere<T extends typeof Model>(
    this: T,
    column: string,
    operatorOrValue: unknown,
    value?: unknown
  ): Promise<InstanceType<T> | null> {
    return this.query().where(column, operatorOrValue, value).first();
  }

  static async count<T extends typeof Model>(this: T): Promise<number> {
    return this.query().count();
  }

  static async exists<T extends typeof Model>(this: T): Promise<boolean> {
    return this.query().exists();
  }

  static async paginate<T extends typeof Model>(
    this: T,
    page = 1,
    perPage = 15
  ): Promise<PaginationResult<InstanceType<T>>> {
    return this.query().paginate(page, perPage);
  }

  // --- Writes ---

  static async create<T extends typeof Model>(
    this: T,
    attributes: Record<string, unknown>
  ): Promise<InstanceType<T>> {
    const columns = Object.keys(attributes);
    const placeholders = columns.map(() => "?").join(", ");

    const result = await Database.execute(
      `INSERT INTO ${this.table} (${columns.join(", ")}) VALUES (${placeholders})`,
      Object.values(attributes)
    );

    return (await this.find(Number(result.lastInsertRowid))) as InstanceType<T>;
  }

  async update(attributes: Record<string, unknown>): Promise<void> {
    const ctor = this.constructor as typeof Model;
    const columns = Object.keys(attributes);
    const assignments = columns.map((column) => `${column} = ?`).join(", ");

    await Database.execute(
      `UPDATE ${ctor.table} SET ${assignments} WHERE id = ?`,
      [...Object.values(attributes), this.id]
    );

    Object.assign(this, attributes);
  }

  async delete(): Promise<void> {
    const ctor = this.constructor as typeof Model;

    await Database.execute(`DELETE FROM ${ctor.table} WHERE id = ?`, [this.id]);
  }
}
