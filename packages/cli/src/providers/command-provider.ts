import { CommandRegistry } from "../command-registry";

import { HelpCommand } from "../commands/help-command";
import { VersionCommand } from "../commands/version-command";
import { NewCommand } from "../commands/new-command";
export class CommandProvider {
  /**
   * Register all available CLI commands.
   */
  register(registry: CommandRegistry): void {
    registry.register(new HelpCommand());
    registry.register(new VersionCommand());
    registry.register(new NewCommand());
  }
}