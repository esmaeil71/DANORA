import { readFileSync } from "node:fs";
import net from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function pickEnv(key) {
  const envPath = join(root, ".env");
  try {
    const text = readFileSync(envPath, "utf8");
    const m = text.match(new RegExp(`^${key}=(.+)$`, "m"));
    return m?.[1]?.trim();
  } catch {
    return undefined;
  }
}

function parseDbHostPort(databaseUrl) {
  const url =
    databaseUrl ?? pickEnv("DATABASE_URL") ?? "postgresql://danora:danora@localhost:5432/danora";
  try {
    const u = new URL(url.replace(/^postgresql:/, "http:"));
    return { host: u.hostname || "localhost", port: Number(u.port) || 5432 };
  } catch {
    return { host: "localhost", port: 5432 };
  }
}

function tryConnect(host, port, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const done = (ok) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.on("connect", () => done(true));
    socket.on("timeout", () => done(false));
    socket.on("error", () => done(false));
  });
}

const { host, port } = parseDbHostPort();
const ok = await tryConnect(host, port);

if (!ok) {
  console.error(`
[danora] PostgreSQL در دسترس نیست (${host}:${port}).

backend بدون دیتابیس بالا نمی‌آید؛ برای همین UI «اتصال به API» می‌دهد.

این‌ها را در ترمینال جدا اجرا کنید:

  cd ${root}
  docker compose up -d postgres redis
  npm run db:migrate
  npm run dev

اگر docker خطای permission داد:
  sudo usermod -aG docker $USER
  (بعد logout/login) یا: sudo docker compose up -d postgres redis
`);
  process.exit(1);
}