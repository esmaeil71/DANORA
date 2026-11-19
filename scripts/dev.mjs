import { execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sharedDir = join(root, "packages/shared");

execSync("node scripts/sync-dev-env.mjs", { cwd: root, stdio: "inherit" });
execSync("node scripts/check-dev-deps.mjs", { cwd: root, stdio: "inherit" });

const sharedDist = join(sharedDir, "dist/index.js");
if (!existsSync(sharedDist)) {
  execSync("npm run build -w @danora/shared", { cwd: root, stdio: "inherit" });
}

const spawnOpts = {
  cwd: root,
  env: process.env,
  stdio: "inherit",
};

const backend = spawn("npm", ["run", "dev", "-w", "@danora/backend"], spawnOpts);
const frontend = spawn("npm", ["run", "dev", "-w", "@danora/frontend"], spawnOpts);

let shuttingDown = false;

function stopChildren() {
  if (!backend.killed) backend.kill("SIGTERM");
  if (!frontend.killed) frontend.kill("SIGTERM");
}

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  stopChildren();
  process.exit(0);
}

function onChildExit(label, code, signal) {
  if (shuttingDown) return;
  const failed =
    signal !== null ||
    (code !== null && code !== 0 && code !== 143 && code !== 130);

  if (failed) {
    shuttingDown = true;
    if (code !== null && code !== 0) {
      console.error(`[dev] ${label} stopped (exit ${code}).`);
    }
    stopChildren();
    setTimeout(() => process.exit(code ?? 1), 250);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

backend.on("exit", (code, signal) => onChildExit("backend", code, signal));
frontend.on("exit", (code, signal) => onChildExit("frontend", code, signal));