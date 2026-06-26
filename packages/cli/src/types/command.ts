export interface Command {
  /**
   * Command name
   * Example: help, version, new
   */
  readonly name: string;

  /**
   * Short description shown in help
   */
  readonly description: string;

  /**
   * Execute the command
   */
  execute(args: string[]): Promise<void> | void;
}