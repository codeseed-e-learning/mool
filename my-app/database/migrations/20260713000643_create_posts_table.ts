import { Migration, Database } from "@codeseedelearning/mool-database";

export default class extends Migration {
  async up(): Promise<void> {
    await Database.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY
      )
    `);
  }

  async down(): Promise<void> {
    await Database.execute(`DROP TABLE IF EXISTS posts`);
  }
}
