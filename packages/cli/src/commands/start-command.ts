import { Command } from "../types/command.js";
import { DevCommand } from "./dev-command.js";

export class StartCommand implements Command {
  readonly name = "start";

  readonly description = "Start the Mool server for the current project";

  private readonly devCommand = new DevCommand();

  async execute(): Promise<void> {
    await this.devCommand.execute();
  }
}
