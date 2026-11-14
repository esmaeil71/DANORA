import { ConfigService } from '@nestjs/config';

export function parseAdminEmails(config: ConfigService): Set<string> {
  const raw = config.get<string>('ADMIN_EMAILS') ?? '';
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isConfiguredAdmin(
  config: ConfigService,
  email: string,
): boolean {
  return parseAdminEmails(config).has(email.toLowerCase());
}