#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const tsx = path.join(currentDirectory, "../node_modules/tsx/dist/cli.mjs");
const entry = path.join(currentDirectory, "../packages/cli/src/index.ts");

const child = spawn(
  process.execPath,
  [
    tsx,
    entry,
    ...process.argv.slice(2),
  ],
  {
    stdio: "inherit",
  }
);

child.on("exit", (code) => process.exit(code ?? 0));
