import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createInquiry(userId: string, subject: string, message: string) {
    const row = await this.prisma.supportInquiry.create({
      data: {
        userId,
        subject: subject.trim(),
        message: message.trim(),
      },
    });
    return {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async listInquiries(userId: string) {
    const rows = await this.prisma.supportInquiry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        subject: true,
        message: true,
        createdAt: true,
      },
    });
    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}