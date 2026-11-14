# دانورا (DANORA)

پلتفرم چت چندمدلی (Aggregator) — اتصال به GPT، Claude و Gemini فقط از طریق API؛ بدون اجرای مدل روی سرور شما.

## پیش‌نیاز

- Node.js 20+
- pnpm 9+
- Docker (برای PostgreSQL/Redis یا استقرار کامل)

## راه‌اندازی توسعه محلی

```bash
cp .env.example .env
# کلیدهای API را در .env تنظیم کنید (فقط ریشه پروژه — با pnpm dev خودکار به api/web کپی می‌شود)

docker compose up -d postgres redis

pnpm db:setup
pnpm dev
```

- فرانت‌اند: http://localhost:3000  
- API: http://localhost:4000  

## اسکریپت‌ها

| دستور | توضیح |
|--------|--------|
| `pnpm dev` | API + Web همزمان |
| `pnpm db:migrate` | مهاجرت Prisma |
| `pnpm db:seed` | مدل‌های پیش‌فرض کاتالوگ |

## استقرار VPS

1. روی سرور Ubuntu، Docker و Docker Compose نصب کنید.
2. مخزن را کلون کنید و `.env` تولید را از `.env.example` بسازید (`JWT_SECRET` قوی، `WEB_ORIGIN` دامنه شما).
3. `docker compose up -d --build`
4. برای TLS: `docker/nginx.conf` را پشت Nginx یا Caddy قرار دهید یا از [Let's Encrypt](https://letsencrypt.org) استفاده کنید.
5. در صورت استفاده از پروکسی `/api`، `NEXT_PUBLIC_API_URL` را به آدرس عمومی API تنظیم کنید.

معماری و تصمیم‌های محصول: [`docs/architecture.md`](docs/architecture.md)

## UI/UX (ui-ux-pro-max)

Skill پروژه: [`.cursor/skills/ui-ux-pro-max/`](.cursor/skills/ui-ux-pro-max/) (منبع: [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill))

- Design system ذخیره‌شده: [`design-system/danora/MASTER.md`](design-system/danora/MASTER.md)
- قانون Cursor: [`.cursor/rules/ui-design.mdc`](.cursor/rules/ui-design.mdc)

بازتولید پیشنهاد طراحی:

```bash
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "AI chat SaaS" --design-system -p "DANORA" --output-dir .
```

## ساختار

- `apps/web` — Next.js (فارسی، RTL)
- `apps/api` — NestJS + Model Router + Adapters
- `packages/shared` — تایپ‌های مشترک