import path from "node:path";

import { FileSystem } from "../filesystem/file-system.js";
import { TemplateRepository } from "../repositories/template-repository.js";

export class ProjectGenerator {
  constructor(
    private readonly fileSystem: FileSystem,
    private readonly templateRepository: TemplateRepository
  ) {}

  async generate(projectName: string, templateName = "basic"): Promise<void> {
    const projectRoot = path.resolve(process.cwd(), projectName);

    if (await this.fileSystem.exists(projectRoot)) {
      throw new Error(`Project "${projectName}" already exists.`);
    }

    const templatePath = await this.templateRepository.get(templateName);

    console.log(
      `Creating project "${projectName}" from the "${templateName}" template...\n`
    );

    await this.fileSystem.copyDirectory(templatePath, projectRoot);

    await this.setProjectName(projectRoot, projectName);

    console.log("Project created successfully.\n");
    console.log("Next steps:");
    console.log(`  cd ${projectName}`);
    console.log("  npm install");
    console.log("  npm run dev");
  }

  private async setProjectName(
    projectRoot: string,
    projectName: string
  ): Promise<void> {
    const packageJsonPath = path.join(projectRoot, "package.json");

    if (!(await this.fileSystem.exists(packageJsonPath))) {
      return;
    }

    const contents = JSON.parse(
      await this.fileSystem.readFile(packageJsonPath)
    );

    contents.name = projectName;

    await this.fileSystem.writeFile(
      packageJsonPath,
      `${JSON.stringify(contents, null, 2)}\n`
    );
  }
}
