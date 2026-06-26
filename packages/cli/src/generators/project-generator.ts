import path from "node:path";

import { FileSystem } from "../filesystem/file-system.js";

export class ProjectGenerator {
  constructor(private readonly fileSystem: FileSystem) {}

  async generate(projectName: string): Promise<void> {
    const projectRoot = path.resolve(process.cwd(), projectName);

    if (await this.fileSystem.exists(projectRoot)) {
      throw new Error(`Project "${projectName}" already exists.`);
    }

    console.log(`Creating project "${projectName}"...\n`);

    await this.createStructure(projectRoot);

    console.log("Project created successfully.");
  }

  private async createStructure(projectRoot: string): Promise<void> {
    const directories = [
      "app",
      "app/Controllers",
      "app/Middleware",
      "app/Models",
      "bootstrap",
      "config",
      "routes",
      "storage",
      "public",
    ];

    for (const directory of directories) {
      await this.fileSystem.createDirectory(
        path.join(projectRoot, directory)
      );
    }

    await this.fileSystem.createFile(
      path.join(projectRoot, "README.md"),
      `# ${path.basename(projectRoot)}`
    );
  }
}