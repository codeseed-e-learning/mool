import { promises as fs } from "node:fs";
import path from "node:path";

export class FileSystem {
  /**
   * Check if a path exists.
   */
  async exists(targetPath: string): Promise<boolean> {
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a directory recursively.
   */
  async createDirectory(directoryPath: string): Promise<void> {
    await fs.mkdir(directoryPath, { recursive: true });
  }

  /**
   * Create a file.
   */
  async createFile(filePath: string, content = ""): Promise<void> {
    await this.createDirectory(path.dirname(filePath));

    await fs.writeFile(filePath, content, "utf-8");
  }

  /**
   * Read a file.
   */
  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, "utf-8");
  }

  /**
   * Write to an existing file.
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, "utf-8");
  }

  /**
   * Copy a file.
   */
  async copyFile(source: string, destination: string): Promise<void> {
    await this.createDirectory(path.dirname(destination));

    await fs.copyFile(source, destination);
  }

  /**
   * Remove a file or directory.
   */
  async remove(targetPath: string): Promise<void> {
    await fs.rm(targetPath, {
      recursive: true,
      force: true,
    });
  }

  async copyDirectory(source: string, destination: string): Promise<void> {
    await fs.cp(source, destination, {
      recursive: true,
    });
  }
}
