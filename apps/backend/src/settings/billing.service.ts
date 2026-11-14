import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async usageHistory(userId: string, days = 7) {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - (days - 1));
    start.setUTCHours(0, 0, 0, 0);

    const rows = await this.prisma.usageDaily.findMany({
      where: { userId, date: { gte: start } },
      orderBy: { date: 'asc' },
    });

    return rows.map((r) => ({
      date: r.date.toISOString().slice(0, 10),
      messageCount: r.messageCount,
      tokenTotal: r.tokenTotal,
    }));
  }

  async createUpgradeRequest(userId: string, note?: string, phone?: string) {
    const row = await this.prisma.upgradeRequest.create({
      data: {
        userId,
        note: note?.trim() || null,
        phone: phone?.trim() || null,
      },
    });
    return {
      id: row.id,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async listUpgradeRequests(userId: string) {
    const rows = await this.prisma.upgradeRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return rows.map((r) => ({
      id: r.id,
      status: r.status,
      note: r.note,
      phone: r.phone,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}