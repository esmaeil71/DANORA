import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");

if (!existsSync(envPath)) {
  console.warn(
    "[sync-dev-env] فایل .env در ریشه پروژه نیست — از .env.example کپی کنید.",
  );
  process.exit(0);
}

const content = readFileSync(envPath, "utf8");
writeFileSync(join(root, "apps/api/.env"), content);

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

writeFileSync(
  join(root, "apps/web/.env.local"),
  `${webEnv.trim()}\nNEXT_PUBLIC_API_URL=${pick(content, "NEXT_PUBLIC_API_URL") ?? "http://localhost:4000"}\n`,
);

function pick(text, key) {
  const m = text.match(new RegExp(`^${key}=(.+)$`, "m"));
  return m?.[1]?.trim();
}

console.log("[sync-dev-env] apps/api/.env و apps/web/.env.local به‌روز شد.");