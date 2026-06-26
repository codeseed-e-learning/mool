import { CommandRegistry } from "./command-registry";
import { Parser } from "./parser";

import { HelpCommand } from "./commands/help-command";
import { VersionCommand } from "./commands/version-command";

export class CLI {
  private readonly registry = new CommandRegistry();
  private readonly parser = new Parser();

  constructor() {
    this.registerCommands();
  }

  private registerCommands(): void {
    this.registry.register(new HelpCommand());
    this.registry.register(new VersionCommand());
  }

  run(argv: string[]): void {
    const { command, args } = this.parser.parse(argv);

    const executableCommand =
      this.registry.get(command) ??
      this.registry.get(command.replace(/^--/, ""));

    if (!executableCommand) {
      console.error(`Unknown command: ${command}\n`);

      this.registry.get("help")?.execute([]);

      process.exit(1);
    }

    executableCommand.execute(args);
  }
}