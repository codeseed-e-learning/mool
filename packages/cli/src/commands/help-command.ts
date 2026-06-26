import { Command } from "../types/command";

export class HelpCommand implements Command {
  readonly name = "help";

  readonly description = "Display available commands";

  execute(): void {
    console.log(`
Mool CLI v0.0.1

Usage:
  mool <command>

Commands:
  help        Display available commands
  version     Show current version
`);
  }
}