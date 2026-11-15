import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {}

  private transporter() {
    const host = this.config.get<string>('SMTP_HOST');
    if (!host) return null;
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    const from =
      this.config.get<string>('SMTP_FROM') ?? 'noreply@danora.local';
    const subject = 'بازیابی رمز عبور دانورا';
    const text = [
      'درخواست تغییر رمز عبور برای حساب دانورا ثبت شد.',
      '',
      'برای انتخاب رمز جدید این لینک را باز کنید (۱ ساعت اعتبار دارد):',
      resetUrl,
      '',
      'اگر این درخواست از طرف شما نبود، این ایمیل را نادیده بگیرید.',
    ].join('\n');

    const transport = this.transporter();
    if (!transport) {
      this.logger.warn(
        `[password-reset] SMTP تنظیم نیست — لینک برای ${to}: ${resetUrl}`,
      );
      return { sent: false, logged: true };
    }

    await transport.sendMail({ from, to, subject, text });
    return { sent: true };
  }
}