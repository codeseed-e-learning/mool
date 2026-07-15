import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "../types/command.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export class VersionCommand implements Command {
  readonly name = "version";

  readonly description = "Show framework version";

  execute(): void {
    const packageJsonPath = path.join(currentDirectory, "..", "..", "package.json");
    const { version } = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    console.log(`Mool v${version}`);
  }
}
