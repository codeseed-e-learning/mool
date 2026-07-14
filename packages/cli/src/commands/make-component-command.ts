import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "../types/command.js";
import { FileGenerator } from "../generators/file-generator.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export class MakeComponentCommand implements Command {
  readonly name = "make:component";

  readonly description = "Create a new reusable view component";

  private readonly generator = new FileGenerator();

  execute(args: string[]): void {
    if (args.length === 0) {
      console.error("Please provide a component name.");
      return;
    }

    const componentName = args[0];

    const destination = path.join(
      process.cwd(),
      "resources",
      "views",
      "components",
      `${componentName}.html`
    );

    if (fs.existsSync(destination)) {
      console.error(`Component "${componentName}" already exists.`);
      return;
    }

    const stub = path.join(currentDirectory, "..", "..", "stubs", "component.stub");

    this.generator.generate(stub, destination, {
      componentName,
    });

    console.log(`✅ Component created: resources/views/components/${componentName}.html`);
  }
}
