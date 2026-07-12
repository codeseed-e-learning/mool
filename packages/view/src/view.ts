import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

import { compile, type CompiledView } from "./engine";

const cache = new Map<string, CompiledView>();

export class View {
  /**
   * Renders resources/views/<name>.html with the given data. Compiled
   * templates are cached by resolved file path.
   */
  static render(
    name: string,
    data: Record<string, unknown> = {},
    viewsDir = path.resolve(process.cwd(), "resources", "views")
  ): string {
    const filePath = path.join(viewsDir, `${name}.html`);

    if (!existsSync(filePath)) {
      throw new Error(`View "${name}" not found at ${filePath}`);
    }

    let render = cache.get(filePath);

    if (!render) {
      render = compile(readFileSync(filePath, "utf-8"));
      cache.set(filePath, render);
    }

    return render(data);
  }

  static clearCache(): void {
    cache.clear();
  }
}
