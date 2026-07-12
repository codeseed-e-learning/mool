#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const tsx = path.join(currentDirectory, "../node_modules/tsx/dist/cli.mjs");
const entry = path.join(currentDirectory, "../packages/cli/src/index.ts");

const args = process.argv.slice(2);

// `mool dev` restarts on file changes via tsx's built-in watcher —
// `mool start` runs once, no watching.
const tsxArgs =
  args[0] === "dev" ? [tsx, "watch", entry, ...args] : [tsx, entry, ...args];

const child = spawn(process.execPath, tsxArgs, {
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
