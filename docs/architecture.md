# DANORA — معماری

## ساختار پروژه

```
DANORA/
├── apps/
│   ├── backend/      # NestJS — API، Auth، Model Router
│   └── frontend/     # Vite + React — UI فارسی / چت
├── packages/shared/  # تایپ‌های مشترک
├── docker/
├── scripts/
└── .env
```

## لایه‌ها

کاربر → **frontend** → **backend** → Model Router → Provider APIs → PostgreSQL / Redis

**Dev:** `npm install` → `docker compose up -d` (postgres/redis) → `npm run dev`

جزئیات Adapterها: `apps/backend/src/model-router/`