import { Command } from "../types/command.js";

import { Application, Kernel } from "@codeseedelearning/mool-core";

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