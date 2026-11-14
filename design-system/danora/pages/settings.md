# Settings — DANORA

- **Theme:** Dark (`.settings-dark`), aligned with chat
- **Layout:** Single column, max-w-xl, sticky header + grouped menu cards
- **Sections:** Account header, quota bar, plan upgrade, prefs, support, developer, about
- **Admin** (`role=admin` only): `/settings/admin` hub — users (audit conversations), upgrade/support queues, model toggles. API under `/admin/*` (session cookie only, not API keys). Bootstrap via `ADMIN_EMAILS` in `.env`.