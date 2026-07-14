import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "../types/command.js";
import { FileGenerator } from "../generators/file-generator.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export class MakeLayoutCommand implements Command {
  readonly name = "make:layout";

  readonly description = "Create a new view layout";

  private readonly generator = new FileGenerator();

  execute(args: string[]): void {
    if (args.length === 0) {
      console.error("Please provide a layout name.");
      return;
    }

    const layoutName = args[0];

    const destination = path.join(
      process.cwd(),
      "resources",
      "views",
      "layouts",
      `${layoutName}.html`
    );

    if (fs.existsSync(destination)) {
      console.error(`Layout "${layoutName}" already exists.`);
      return;
    }

    const stub = path.join(currentDirectory, "..", "..", "stubs", "layout.stub");

    this.generator.generate(stub, destination, {});

    console.log(`✅ Layout created: resources/views/layouts/${layoutName}.html`);
  }
}
