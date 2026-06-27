import fs from "node:fs";
import path from "node:path";

export class FileGenerator {
  generate(
    stubPath: string,
    destination: string,
    replacements: Record<string, string>
  ): void {
    let content = fs.readFileSync(stubPath, "utf8");

    for (const [key, value] of Object.entries(replacements)) {
      content = content.replace(
        new RegExp(`{{${key}}}`, "g"),
        value
      );
    }

    fs.mkdirSync(path.dirname(destination), {
      recursive: true,
    });

    fs.writeFileSync(destination, content);
  }
}