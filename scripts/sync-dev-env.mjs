import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");

function pick(text, key) {
  const m = text.match(new RegExp(`^${key}=(.+)$`, "m"));
  return m?.[1]?.trim();
}

if (!existsSync(envPath)) {
  console.warn(
    "[sync-dev-env] no root .env — copy from .env.example",
  );
  process.exit(0);
}

const content = readFileSync(envPath, "utf8");
writeFileSync(join(root, "apps/backend/.env"), content);

const webEnv = content
  .split("\n")
  .filter((line) => {
    const t = line.trim();
    return (
      t.startsWith("NEXT_PUBLIC_") ||
      (t.startsWith("#") && line.includes("Next")) ||
      t === ""
    );
  })
  .join("\n");

const apiUrl = pick(content, "NEXT_PUBLIC_API_URL") ?? "http://localhost:4000";
const frontendEnv = `${webEnv.trim()}\nNEXT_PUBLIC_API_URL=${apiUrl}\n`;

writeFileSync(join(root, "apps/frontend/.env.local"), frontendEnv);

console.log("[sync-dev-env] synced apps/backend/.env and apps/frontend/.env.local");