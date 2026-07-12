import { Migration, Database } from "@codeseedelearning/mool-database";

export default class extends Migration {
  async up(): Promise<void> {
    const isMysql = Database.dialect() === "mysql";
    const idColumn = isMysql
      ? "id INT AUTO_INCREMENT PRIMARY KEY"
      : "id INTEGER PRIMARY KEY AUTOINCREMENT";
    const textColumn = isMysql ? "VARCHAR(255)" : "TEXT";

    await Database.execute(`
      CREATE TABLE IF NOT EXISTS users (
        ${idColumn},
        name ${textColumn} NOT NULL,
        email ${textColumn} NOT NULL UNIQUE,
        password ${textColumn} NOT NULL,
        created_at ${textColumn} NOT NULL
      )
    `);
  }

  async down(): Promise<void> {
    await Database.execute(`DROP TABLE IF EXISTS users`);
  }
}
