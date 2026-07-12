import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "../types/command";
import { FileGenerator } from "../generators/file-generator";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export class MakeMigrationCommand implements Command {
  readonly name = "make:migration";

  readonly description = "Create a new database migration";

  private readonly generator = new FileGenerator();

  execute(args: string[]): void {
    if (args.length === 0) {
      console.error("Please provide a migration name, e.g. create_users_table.");
      return;
    }

    const name = args[0];
    const fileName = `${this.timestamp()}_${name}.ts`;

    const destination = path.join(
      process.cwd(),
      "database",
      "migrations",
      fileName
    );

    if (fs.existsSync(destination)) {
      console.error(`Migration "${fileName}" already exists.`);
      return;
    }

    const stub = path.join(currentDirectory, "..", "..", "stubs", "migration.stub");

    this.generator.generate(stub, destination, {
      tableName: this.tableName(name),
    });

    console.log(`✅ Migration created: database/migrations/${fileName}`);
  }

  private tableName(migrationName: string): string {
    return migrationName.replace(/^create_/, "").replace(/_table$/, "");
  }

  private timestamp(): string {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");

    return [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds()),
    ].join("");
  }
}
