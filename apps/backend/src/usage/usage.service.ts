import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

function startOfDayUTC(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

@Injectable()
export class UsageService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private dailyLimit(): number {
    return Number(this.config.get('FREE_DAILY_MESSAGE_LIMIT') ?? 50);
  }

  async assertCanSendMessage(userId: string, plan: string) {
    if (plan === 'pro') {
      return;
    }
    const date = startOfDayUTC();
    const usage = await this.prisma.usageDaily.findUnique({
      where: { userId_date: { userId, date } },
    });
    const count = usage?.messageCount ?? 0;
    if (count >= this.dailyLimit()) {
      throw new ForbiddenException(
        `سقف پیام روزانه (${this.dailyLimit()}) به پایان رسیده است`,
      );
    }
  }

  async getDailySummary(userId: string) {
    const date = startOfDayUTC();
    const usage = await this.prisma.usageDaily.findUnique({
      where: { userId_date: { userId, date } },
    });
    return {
      messageCount: usage?.messageCount ?? 0,
      tokenTotal: usage?.tokenTotal ?? 0,
      limit: this.dailyLimit(),
    };
  }

  async recordMessage(userId: string, tokenIn: number, tokenOut: number) {
    const date = startOfDayUTC();
    await this.prisma.usageDaily.upsert({
      where: { userId_date: { userId, date } },
      create: {
        userId,
        date,
        messageCount: 1,
        tokenTotal: tokenIn + tokenOut,
      },
      update: {
        messageCount: { increment: 1 },
        tokenTotal: { increment: tokenIn + tokenOut },
      },
    });
  }
}