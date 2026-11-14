# دانورا (DANORA)

```
apps/backend/   — API (NestJS)
apps/frontend/  — UI (Next.js)
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

- `docker compose up -d` — PostgreSQL و Redis
- `npm run dev` — backend و frontend با هم (پورت‌های ۴۰۰۰ و ۳۰۰۰)

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