#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(currentDirectory, "../src/index.ts");
const tsxCli = fileURLToPath(import.meta.resolve("tsx/cli"));

const args = process.argv.slice(2);

// `mool dev` restarts on file changes (routes, controllers, models, etc.)
// via tsx's built-in watcher — `mool start` runs once, no watching.
const tsxArgs =
  args[0] === "dev"
    ? [tsxCli, "watch", entry, ...args]
    : [tsxCli, entry, ...args];

const child = spawn(process.execPath, tsxArgs, {
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
