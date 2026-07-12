import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

type ConfigStore = Record<string, unknown>;

export class Config {
  private static store: ConfigStore = {};

  /**
   * Loads every config/*.ts (or .js) file in the given directory and
   * indexes it by filename, e.g. config/app.ts's default export becomes
   * Config.get("app").
   */
  static async load(configDir = path.resolve(process.cwd(), "config")): Promise<void> {
    let files: string[] = [];

    try {
      files = readdirSync(configDir).filter(
        (file) => file.endsWith(".ts") || file.endsWith(".js")
      );
    } catch {
      return;
    }

    for (const file of files) {
      const key = path.basename(file, path.extname(file));
      const module = await import(pathToFileURL(path.join(configDir, file)).href);

      this.store[key] = module.default ?? module;
    }
  }

  /**
   * Reads a config value using dot notation, e.g. Config.get("app.port").
   */
  static get<T = unknown>(key: string, fallback?: T): T {
    const segments = key.split(".");

    let value: unknown = this.store;

    for (const segment of segments) {
      if (value === undefined || value === null || typeof value !== "object") {
        return fallback as T;
      }

      value = (value as ConfigStore)[segment];
    }

    return (value === undefined ? fallback : value) as T;
  }

  static all(): ConfigStore {
    return this.store;
  }

  static clear(): void {
    this.store = {};
  }
}
