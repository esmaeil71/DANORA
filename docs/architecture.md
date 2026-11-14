# DANORA — معماری (API Aggregator)

## اصل معماری

- **هیچ مدلی روی سرور خودمان اجرا نمی‌شود** (بدون vLLM/Ollama).
- نقش محصول: **واسط (Aggregator)** بین کاربر و OpenAI / Anthropic / Google و سایر ارائه‌دهندگان.
- اتصال مدل‌ها از طریق **Model Router** و **Adapter** مستقل برای هر provider/قابلیت (چت، تصویر، صوت در آینده).

## تصمیم‌های محصول (ثبت‌شده)

| موضوع | انتخاب |
|--------|--------|
| بازار هدف | **ایران** — UI فارسی، RTL، زیرساخت VPS |
| پرداخت (فاز تجاری) | **تومان** + درگاه ایرانی (مثلاً زرین‌پال) |
| کلید API | **فقط کلید پلتفرم** — کاربر کلید وارد نمی‌کند؛ هزینه و سقف روی سرور |

## لایه‌ها

```
کاربر → Next.js (Chat/Dashboard) → NestJS (Auth, Billing*, Rate limit)
      → Model Router → Adapters → Provider APIs
      → PostgreSQL + Redis (+ Storage در فاز فایل)
```

\* Billing در MVP فقط `usage_daily` و سقف پیام؛ کیف پول و زرین‌پال در فاز ۳.

## توسعه Adapter جدید

1. جدول `model_catalog` را seed/admin کنید (`provider`, `api_model_name`).
2. کلاس جدید `implements ProviderAdapter` در `apps/api/src/model-router/adapters/`.
3. در `ModelRouterModule` ثبت کنید.

هسته چت و UI بدون تغییر می‌ماند.

## متغیرهای محیط

مرجع: [`.env.example`](../.env.example)

## استقرار

Docker Compose + Nginx روی VPS — جزئیات در [`README.md`](../README.md).