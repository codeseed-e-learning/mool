import { Command } from "../types/command.js";
import { loadEnv, Config } from "@codeseedelearning/mool-config";
import { Database, runMigrations } from "@codeseedelearning/mool-database";

export class MigrateCommand implements Command {
  readonly name = "migrate";

  readonly description = "Run pending database migrations";

  async execute(): Promise<void> {
    loadEnv();
    await Config.load();

    try {
      await runMigrations();

      console.log("✅ Migrations complete.");
    } finally {
      // Without this, the open MySQL connection pool keeps the process
      // alive and `mool migrate` never returns to the shell.
      await Database.close();
    }
  }
}
