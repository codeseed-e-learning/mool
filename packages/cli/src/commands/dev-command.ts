import path from "node:path";
import { pathToFileURL } from "node:url";
import { promises as fs } from "node:fs";

import { Command } from "../types/command.js";
import type { Application } from "../../../core/src/application.js";

export class DevCommand implements Command {
  readonly name = "dev";

  readonly description = "Start the development server for the current project";

  async execute(): Promise<void> {
    const bootstrapPath = path.resolve(process.cwd(), "bootstrap", "app.ts");

    if (!(await this.exists(bootstrapPath))) {
      console.error(
        "No bootstrap/app.ts found in the current directory.\nRun this command from the root of a Mool project."
      );
      return;
    }

    const module = await import(pathToFileURL(bootstrapPath).href);
    const app: Application = module.default;

    if (!app || typeof app.start !== "function") {
      console.error(
        "bootstrap/app.ts must export a Mool Application instance as its default export."
      );
      return;
    }

    const port = Number(process.env.PORT) || 3000;

    app.start(port);
  }

  private async exists(targetPath: string): Promise<boolean> {
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }
}
