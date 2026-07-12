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
  help              Display available commands
  version           Show current version
  new               Create a new Mool project
  dev               Start the development server for the current project
  start             Start the Mool server for the current project
  serve             Start the Mool development server
  make:controller   Create a new controller
  make:model        Create a new ORM model
  migrate           Run pending database migrations
  migrate:status    Show which migrations have run and which are pending
  make:migration    Create a new database migration
`);
  }
}