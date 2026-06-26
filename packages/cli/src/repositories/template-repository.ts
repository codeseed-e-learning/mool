import path from "node:path";

export class TemplateRepository {
  /**
   * Return the absolute path of a template.
   */
  get(templateName: string): string {
    return path.resolve(
      process.cwd(),
      "packages",
      "templates",
      templateName
    );
  }
}