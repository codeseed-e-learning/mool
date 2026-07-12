import { Command } from "../types/command";
import { runMigrations } from "@codeseedelearning/mool-database";

export class MigrateCommand implements Command {
  readonly name = "migrate";

  readonly description = "Run pending database migrations";

  async execute(): Promise<void> {
    await runMigrations();

    console.log("✅ Migrations complete.");
  }
}
