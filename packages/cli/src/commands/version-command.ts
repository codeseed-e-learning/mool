import { Command } from "../types/command.js";

export class VersionCommand implements Command {
  readonly name = "version";

  readonly description = "Show framework version";

  execute(): void {
    console.log("Mool v0.0.1");
  }
}