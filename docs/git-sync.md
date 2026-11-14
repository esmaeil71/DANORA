# همگام‌سازی با GitHub

اگر `git push` با خطای **Couldn't connect to server** یا **timeout روی 443** قطع می‌شود، معمولاً مشکل شبکه یا احراز هویت است.

## ۱. SSH (پیشنهادی)

پورت ۲۲ اغلب پایدارتر از HTTPS است.

```bash
# اگر پورت ۲۲ timeout می‌دهد، SSH روی ۴۴۳ (در ~/.ssh/config)
cat >> ~/.ssh/config <<'EOF'
Host github.com
  HostName ssh.github.com
  Port 443
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
ssh-keyscan -p 443 -t ed25519,rsa ssh.github.com >> ~/.ssh/known_hosts

# remote روی SSH
git remote set-url origin git@github.com:esmaeil71/DANORA.git

# کلید عمومی را در GitHub → Settings → SSH keys اضافه کن
cat ~/.ssh/id_ed25519.pub
```

بعد از ثبت کلید:

```bash
ssh -T git@github.com
git push origin main
```

## ۲. HTTPS با timeout طولانی‌تر

اگر می‌خواهی همان HTTPS بماند (با Personal Access Token):

```bash
git remote set-url origin https://github.com/esmaeil71/DANORA.git
git config --local http.version HTTP/1.1
git config --local http.lowSpeedLimit 1000
git config --local http.lowSpeedTime 600
git config --local http.postBuffer 524288000
```

توکن را از GitHub → Settings → Developer settings → Personal access tokens بساز و هنگام `git push` به‌جای پسورد همان توکن را بزن.

## ۳. پروکسی / VPN

اگر هر دو روش بالا باز هم timeout می‌دهند، VPN یا پروکسی سیستم لازم است:

```bash
export HTTPS_PROXY=http://127.0.0.1:PORT
export HTTP_PROXY=http://127.0.0.1:PORT
git push origin main
```

## عیب‌یابی `Permission denied (publickey)`

اتصال SSH برقرار است ولی GitHub کلید را نمی‌شناسد:

```bash
ssh-keygen -lf ~/.ssh/id_ed25519.pub
ssh -T git@github.com
```

کلید فعلی این ماشین (فقط **محتوای** `id_ed25519.pub` را در GitHub بگذار، نه فایل خصوصی):

```
# خروجی دستور:
# cat ~/.ssh/id_ed25519.pub
```

اگر تازه کلید ساخته‌ای، حتماً **همان** کلید عمومی جدید را در GitHub ثبت کن؛ کلیدهای قدیمی حذف‌شده دیگر کار نمی‌کنند.

## وضعیت فعلی این مخزن

روی این ماشین `origin` روی **SSH** تنظیم شده است. تا کلید `~/.ssh/id_ed25519.pub` در GitHub ثبت نشود، `git push` با `Permission denied (publickey)` مواجه می‌شود — این خطای احراز هویت است، نه timeout.