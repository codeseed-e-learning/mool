import { Migration, Database } from "@codeseedelearning/mool-database";

export default class extends Migration {
  async up(): Promise<void> {
    const idColumn =
      Database.dialect() === "mysql"
        ? "id INT AUTO_INCREMENT PRIMARY KEY"
        : "id INTEGER PRIMARY KEY AUTOINCREMENT";

    await Database.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        ${idColumn}
      )
    `);
  }

  async down(): Promise<void> {
    await Database.execute(`DROP TABLE IF EXISTS posts`);
  }
}
