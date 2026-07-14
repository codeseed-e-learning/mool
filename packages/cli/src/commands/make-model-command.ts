import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "../types/command.js";
import { FileGenerator } from "../generators/file-generator.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export class MakeModelCommand implements Command {
  readonly name = "make:model";

  readonly description = "Create a new ORM model";

  private readonly generator = new FileGenerator();

  execute(args: string[]): void {
    if (args.length === 0) {
      console.error("Please provide a model name, e.g. Post.");
      return;
    }

    const modelName = args[0];

    const destination = path.join(
      process.cwd(),
      "app",
      "Models",
      `${modelName}.ts`
    );

    if (fs.existsSync(destination)) {
      console.error(`Model "${modelName}" already exists.`);
      return;
    }

    const stub = path.join(currentDirectory, "..", "..", "stubs", "model.stub");

    this.generator.generate(stub, destination, {
      modelName,
      tableName: this.tableName(modelName),
    });

    console.log(`✅ Model created: app/Models/${modelName}.ts`);
    console.log(
      `   Table name guessed as "${this.tableName(modelName)}" — adjust the "static table" line if that's wrong.`
    );
  }

  /**
   * Guesses a table name from a PascalCase model name: splits words,
   * lowercases, snake_cases, and applies a small set of common
   * pluralization rules (not a full inflector — good enough for typical
   * English names, edit the generated file for anything irregular).
   */
  private tableName(modelName: string): string {
    const snakeCase = modelName
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      .toLowerCase();

    return this.pluralize(snakeCase);
  }

  private pluralize(word: string): string {
    if (/[^aeiou]y$/.test(word)) {
      return `${word.slice(0, -1)}ies`;
    }

    if (/(s|x|z|ch|sh)$/.test(word)) {
      return `${word}es`;
    }

    return `${word}s`;
  }
}
