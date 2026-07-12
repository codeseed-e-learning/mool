import { Migration, Database } from "@codeseedelearning/mool-database";

export default class extends Migration {
  up(): void {
    Database.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
  }

  down(): void {
    Database.execute(`DROP TABLE IF EXISTS users`);
  }
}
