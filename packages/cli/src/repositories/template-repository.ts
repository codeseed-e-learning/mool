import path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export class TemplateRepository {
  private readonly root = path.resolve(currentDirectory, "../templates");

  /**
   * Return the absolute path of a template, throwing if it doesn't exist.
   */
  async get(templateName: string): Promise<string> {
    const templatePath = path.join(this.root, templateName);

    if (!(await this.exists(path.join(templatePath, "package.json")))) {
      const available = await this.list();

      throw new Error(
        `Template "${templateName}" not found. Available templates: ${available.join(", ")}`
      );
    }

    return templatePath;
  }

  /**
   * List the names of available (non-empty) templates.
   */
  async list(): Promise<string[]> {
    const entries = await fs.readdir(this.root, { withFileTypes: true });

    const directories = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    const usable = await Promise.all(
      directories.map(async (name) => ({
        name,
        usable: await this.exists(path.join(this.root, name, "package.json")),
      }))
    );

    return usable.filter((entry) => entry.usable).map((entry) => entry.name);
  }

  private async exists(targetPath: string): Promise<boolean> {
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }
}
