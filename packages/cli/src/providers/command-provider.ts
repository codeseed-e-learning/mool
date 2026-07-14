import { CommandRegistry } from "../command-registry.js";

import { HelpCommand } from "../commands/help-command.js";
import { VersionCommand } from "../commands/version-command.js";
import { NewCommand } from "../commands/new-command.js";
import { ServeCommand } from "../commands/serve.command.js";
import { MakeControllerCommand } from "../commands/make-controller-command.js";
import { DevCommand } from "../commands/dev-command.js";
import { StartCommand } from "../commands/start-command.js";
import { MigrateCommand } from "../commands/migrate-command.js";
import { MakeMigrationCommand } from "../commands/make-migration-command.js";
import { MigrateStatusCommand } from "../commands/migrate-status-command.js";
import { MakeModelCommand } from "../commands/make-model-command.js";
import { MakeComponentCommand } from "../commands/make-component-command.js";
import { MakeLayoutCommand } from "../commands/make-layout-command.js";
export class CommandProvider {
  /**
   * Register all available CLI commands.
   */
  register(registry: CommandRegistry): void {
    registry.register(new HelpCommand());
    registry.register(new VersionCommand());
    registry.register(new NewCommand());
    registry.register(new ServeCommand());
    registry.register(new MakeControllerCommand());
    registry.register(new DevCommand());
    registry.register(new StartCommand());
    registry.register(new MigrateCommand());
    registry.register(new MakeMigrationCommand());
    registry.register(new MigrateStatusCommand());
    registry.register(new MakeModelCommand());
    registry.register(new MakeComponentCommand());
    registry.register(new MakeLayoutCommand());
  }
}