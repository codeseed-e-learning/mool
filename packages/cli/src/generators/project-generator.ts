import path from "node:path";
import { randomBytes } from "node:crypto";

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

    await this.restoreGitignore(projectRoot);
    await this.setProjectName(projectRoot, projectName);
    await this.setupEnv(projectRoot);

    console.log("Project created successfully.\n");
    console.log("Next steps:");
    console.log(`  cd ${projectName}`);
    console.log("  npm install");
    console.log("  npm run dev");
  }

  /**
   * npm strips nested `.gitignore` files from published tarballs, so
   * templates ship an extension-less `gitignore` file instead.
   */
  private async restoreGitignore(projectRoot: string): Promise<void> {
    const source = path.join(projectRoot, "gitignore");

    if (!(await this.fileSystem.exists(source))) {
      return;
    }

    await this.fileSystem.rename(source, path.join(projectRoot, ".gitignore"));
  }

  /**
   * Copies .env.example to .env (if present and .env doesn't already
   * exist) and fills in a random APP_KEY, mirroring Laravel's
   * `key:generate` — so auth works out of the box without a manual step.
   */
  private async setupEnv(projectRoot: string): Promise<void> {
    const examplePath = path.join(projectRoot, ".env.example");
    const envPath = path.join(projectRoot, ".env");

    if (
      !(await this.fileSystem.exists(examplePath)) ||
      (await this.fileSystem.exists(envPath))
    ) {
      return;
    }

    await this.fileSystem.copyFile(examplePath, envPath);

    const contents = await this.fileSystem.readFile(envPath);

    if (!/^APP_KEY=\s*$/m.test(contents)) {
      return;
    }

    const key = randomBytes(32).toString("base64url");

    await this.fileSystem.writeFile(
      envPath,
      contents.replace(/^APP_KEY=\s*$/m, `APP_KEY=${key}`)
    );
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
