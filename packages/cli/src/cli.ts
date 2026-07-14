import { CommandRegistry } from "./command-registry.js";
import { Parser } from "./parser.js";
import { CommandProvider } from "./providers/command-provider.js";

export class CLI {
  private readonly registry: CommandRegistry;
  private readonly parser: Parser;
  private readonly provider: CommandProvider;

  constructor() {
    this.registry = new CommandRegistry();
    this.parser = new Parser();
    this.provider = new CommandProvider();

    this.bootstrap();
  }

  /**
   * Bootstrap the CLI.
   * Registers all available commands.
   */
  private bootstrap(): void {
    this.provider.register(this.registry);
  }

  /**
   * Execute the CLI.
   */
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