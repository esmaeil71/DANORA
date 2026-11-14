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

const apiUrl =
  pick(content, "VITE_API_URL") ??
  pick(content, "NEXT_PUBLIC_API_URL") ??
  "http://localhost:4000";

const webEnv = content
  .split("\n")
  .filter((line) => {
    const t = line.trim();
    return (
      t.startsWith("VITE_") ||
      t.startsWith("NEXT_PUBLIC_") ||
      (t.startsWith("#") && /vite|next|frontend/i.test(line)) ||
      t === ""
    );
  })
  .join("\n");

const frontendEnv = `${webEnv.trim()}\nVITE_API_URL=${apiUrl}\n`;

writeFileSync(join(root, "apps/frontend/.env.local"), frontendEnv);

console.log("[sync-dev-env] synced apps/backend/.env and apps/frontend/.env.local");