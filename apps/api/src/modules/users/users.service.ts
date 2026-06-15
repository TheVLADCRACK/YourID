import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(userId: string, dto: any) {
    return this.prisma.user.update({ where: { id: userId }, data: { firstName: dto.firstName, lastName: dto.lastName, bio: dto.bio, avatar: dto.avatar } });
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, search, role } = query;
    const skip = (page - 1) * limit;
    const where: any = { ...(search && { OR: [{ email: { contains: search, mode: 'insensitive' } }, { firstName: { contains: search, mode: 'insensitive' } }] }), ...(role && { role }) };
    const [users, total] = await Promise.all([
      // Use `include` OR `select` — here we include the related store with selected fields
      this.prisma.user.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' }, include: { store: { select: { name: true, totalRevenue: true, totalSales: true } } } }),
      this.prisma.user.count({ where }),
    ]);
    return { data: users, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }

  async suspend(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { status: 'SUSPENDED' } });
  }

  async activate(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { status: 'ACTIVE' } });
  }
}
