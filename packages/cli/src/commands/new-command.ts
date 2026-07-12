import { Command } from "../types/command";
import { FileSystem } from "../filesystem/file-system";
import { TemplateRepository } from "../repositories/template-repository";
import { ProjectGenerator } from "../generators/project-generator";

export class NewCommand implements Command {
  readonly name = "new";

  readonly description = "Create a new Mool project";

  async execute(args: string[]): Promise<void> {
    const projectName = args.find((arg) => !arg.startsWith("--"));

    if (!projectName) {
      console.error("Please provide a project name.");
      console.log("\nUsage:");
      console.log("  mool new <project-name> [--<template>]");
      console.log("\nExamples:");
      console.log("  mool new my-app --basic");
      console.log("  mool new my-app --template=basic");
      return;
    }

    const templateName = this.resolveTemplateName(args);

    const fileSystem = new FileSystem();
    const templateRepository = new TemplateRepository();

    const generator = new ProjectGenerator(
      fileSystem,
      templateRepository
    );

    try {
      await generator.generate(projectName, templateName);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Something went wrong.");
      }
    }
  }

  private resolveTemplateName(args: string[]): string {
    const explicitFlag = args.find((arg) => arg.startsWith("--template="));

    if (explicitFlag) {
      return explicitFlag.slice("--template=".length);
    }

    const shorthandFlag = args.find(
      (arg) => arg.startsWith("--") && arg !== "--template"
    );

    return shorthandFlag ? shorthandFlag.slice(2) : "basic";
  }
}