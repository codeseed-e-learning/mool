#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(currentDirectory, "../src/index.ts");
const tsxCli = fileURLToPath(import.meta.resolve("tsx/cli"));

const child = spawn(
  process.execPath,
  [
    tsxCli,
    entry,
    ...process.argv.slice(2),
  ],
  {
    stdio: "inherit",
  }
);

child.on("exit", (code) => process.exit(code ?? 0));
