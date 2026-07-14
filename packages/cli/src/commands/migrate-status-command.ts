import { Command } from "../types/command.js";
import { loadEnv, Config } from "@codeseedelearning/mool-config";
import { Database, getMigrationStatus } from "@codeseedelearning/mool-database";

export class MigrateStatusCommand implements Command {
  readonly name = "migrate:status";

  readonly description = "Show which migrations have run and which are pending";

  async execute(): Promise<void> {
    loadEnv();
    await Config.load();

    try {
      const statuses = await getMigrationStatus();

      if (statuses.length === 0) {
        console.log("No migrations found in database/migrations.");
        return;
      }

      console.log();

      for (const status of statuses) {
        const marker = status.ran ? "✅ Ran    " : "⏳ Pending";
        const when = status.ranAt ? `  (${status.ranAt})` : "";

        console.log(`  ${marker}  ${status.name}${when}`);
      }

      console.log();

      const pendingCount = statuses.filter((status) => !status.ran).length;

      if (pendingCount > 0) {
        console.log(
          `${pendingCount} migration(s) pending. Run "mool migrate" to apply them.`
        );
      } else {
        console.log("All migrations are up to date.");
      }
    } finally {
      // Without this, the open MySQL connection pool keeps the process
      // alive and `mool migrate:status` never returns to the shell.
      await Database.close();
    }
  }
}
