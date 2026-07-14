import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "../types/command.js";
import { FileGenerator } from "../generators/file-generator.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export class MakeControllerCommand implements Command {
  readonly name = "make:controller";

  readonly description = "Create a new controller";

  private readonly generator = new FileGenerator();

  execute(args: string[]): void {
    if (args.length === 0) {
      console.error("Please provide a controller name.");
      return;
    }

    const controllerName = args[0];

    const destination = path.join(
      process.cwd(),
      "app",
      "Controllers",
      `${controllerName}.ts`
    );

    if (fs.existsSync(destination)) {
      console.error(`Controller "${controllerName}" already exists.`);
      return;
    }

    const stub = path.join(
      currentDirectory,
      "..",
      "..",
      "stubs",
      "controller.stub"
    );

    this.generator.generate(
      stub,
      destination,
      {
        controllerName,
      }
    );

    console.log(
      `✅ Controller created: app/Controllers/${controllerName}.ts`
    );
  }
}