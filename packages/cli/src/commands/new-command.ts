import { Command } from "../types/command";
import { FileSystem } from "../filesystem/file-system";
import { TemplateRepository } from "../repositories/template-repository";
import { ProjectGenerator } from "../generators/project-generator";

export class NewCommand implements Command {
  readonly name = "new";

  readonly description = "Create a new Mool project";

  async execute(args: string[]): Promise<void> {
    const projectName = args[0];

    if (!projectName) {
      console.error("Please provide a project name.");
      console.log("\nUsage:");
      console.log("  mool new <project-name>");
      return;
    }

    const fileSystem = new FileSystem();
    const templateRepository = new TemplateRepository();

    const generator = new ProjectGenerator(
      fileSystem,
      templateRepository
    );

    try {
      await generator.generate(projectName);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Something went wrong.");
      }
    }
  }
}