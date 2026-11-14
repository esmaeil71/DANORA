import { execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = join(root, "apps/backend");
const frontendDir = join(root, "apps/frontend");
const sharedDir = join(root, "packages/shared");

execSync("node scripts/sync-dev-env.mjs", { cwd: root, stdio: "inherit" });

const sharedDist = join(sharedDir, "dist/index.js");
if (!existsSync(sharedDist)) {
  execSync("npm run build", { cwd: sharedDir, stdio: "inherit", shell: true });
}

const opts = { stdio: "inherit", shell: true, env: process.env };
const backend = spawn("npm", ["run", "dev"], { ...opts, cwd: backendDir });
const frontend = spawn("npm", ["run", "dev"], { ...opts, cwd: frontendDir });

function shutdown() {
  backend.kill("SIGTERM");
  frontend.kill("SIGTERM");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

backend.on("exit", (code) => {
  if (code && code !== 0) process.exit(code);
});
frontend.on("exit", (code) => {
  if (code && code !== 0) process.exit(code);
});