import fs from "node:fs";
import path from "node:path";

import { Command } from "../types/command";
import { FileGenerator } from "../generators/file-generator";

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
      "controllers",
      `${controllerName}.ts`
    );

    if (fs.existsSync(destination)) {
      console.error(`Controller "${controllerName}" already exists.`);
      return;
    }

    const stub = path.join(
      process.cwd(),
      "packages",
      "cli",
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
      `✅ Controller created: app/controllers/${controllerName}.ts`
    );
  }
}