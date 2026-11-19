# دانورا (DANORA)

```
apps/backend/   — API (NestJS)
apps/frontend/  — UI (Vite + React)
packages/shared/
```

## راه‌اندازی محلی (dev)

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:setup
npm run dev
```

اگر **اتصال به API** یا خطای `Can't reach database server at localhost:5432` دیدید:

```bash
npm run db:up
npm run db:migrate
npm run dev
```

- `docker compose up -d` — PostgreSQL و Redis
- `npm run dev` — backend و frontend با هم (پورت‌های ۴۰۰۰ و ۳۰۰۰)

**پنل ادمین:** در `.env` مقدار `ADMIN_EMAILS` را با ایمیل خود تنظیم کنید، یک‌بار دوباره وارد شوید، سپس از تنظیمات → **پنل ادمین** یا مسیر `/settings/admin`.

| دستور | توضیح |
|--------|--------|
| `npm install` | وابستگی‌های همه workspaceها |
| `docker compose up -d` | دیتابیس و Redis |
| `npm run dev` | backend + frontend |
| `npm run dev:backend` | فقط API |
| `npm run dev:frontend` | فقط UI |

استقرار کامل داخل Docker (اختیاری):

```bash
docker compose --profile stack up -d
```

معماری: [`docs/architecture.md`](docs/architecture.md)

مشکل `git push` / timeout: [`docs/git-sync.md`](docs/git-sync.md)