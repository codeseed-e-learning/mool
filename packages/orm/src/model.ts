import { Database } from "@codeseedelearning/mool-database";

export abstract class Model {
  static table: string;

  [key: string]: unknown;

  id?: number;

  constructor(attributes: Record<string, unknown> = {}) {
    Object.assign(this, attributes);
  }

  static all<T extends typeof Model>(this: T): InstanceType<T>[] {
    const rows = Database.query(`SELECT * FROM ${this.table}`);

    return rows.map((row) => new this(row) as InstanceType<T>);
  }

  static find<T extends typeof Model>(
    this: T,
    id: number | string
  ): InstanceType<T> | null {
    const rows = Database.query(`SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`, [
      id,
    ]);

    return rows.length ? (new this(rows[0]) as InstanceType<T>) : null;
  }

  static where<T extends typeof Model>(
    this: T,
    column: string,
    value: unknown
  ): InstanceType<T>[] {
    const rows = Database.query(
      `SELECT * FROM ${this.table} WHERE ${column} = ?`,
      [value]
    );

    return rows.map((row) => new this(row) as InstanceType<T>);
  }

  static create<T extends typeof Model>(
    this: T,
    attributes: Record<string, unknown>
  ): InstanceType<T> {
    const columns = Object.keys(attributes);
    const placeholders = columns.map(() => "?").join(", ");

    const result = Database.execute(
      `INSERT INTO ${this.table} (${columns.join(", ")}) VALUES (${placeholders})`,
      Object.values(attributes)
    );

    return this.find(Number(result.lastInsertRowid)) as InstanceType<T>;
  }

  update(attributes: Record<string, unknown>): void {
    const ctor = this.constructor as typeof Model;
    const columns = Object.keys(attributes);
    const assignments = columns.map((column) => `${column} = ?`).join(", ");

    Database.execute(`UPDATE ${ctor.table} SET ${assignments} WHERE id = ?`, [
      ...Object.values(attributes),
      this.id,
    ]);

    Object.assign(this, attributes);
  }

  delete(): void {
    const ctor = this.constructor as typeof Model;

    Database.execute(`DELETE FROM ${ctor.table} WHERE id = ?`, [this.id]);
  }
}
