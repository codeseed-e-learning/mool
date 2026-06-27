import { Command } from "../types/command";

import { Application } from "../../../core/src/application";
import { Kernel } from "../../../core/src/kernel";

export class ServeCommand implements Command {
  readonly name = "serve";

  readonly description = "Start the Mool development server";

  execute(): void {
    const application = new Application();
    const kernel = new Kernel(application);

    kernel.boot();
    kernel.start();
  }
}