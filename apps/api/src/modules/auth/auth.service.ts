import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string) {
    // Check email uniqueness
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Cette adresse email est déjà utilisée');
    }

    // Check username uniqueness
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException("Ce nom d'utilisateur est déjà pris");
    }

    // Check store slug uniqueness
    const existingSlug = await this.prisma.store.findUnique({
      where: { slug: dto.storeSlug },
    });
    if (existingSlug) {
      throw new ConflictException('Ce nom de boutique est déjà pris');
    }

    // Hash password
    const hashedPassword = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Create user with store in transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          username: dto.username,
        },
      });

      await tx.store.create({
        data: {
          userId: newUser.id,
          name: dto.storeName,
          slug: dto.storeSlug,
          currency: dto.currency || 'XOF',
          country: dto.country || 'SN',
          primaryColor: dto.primaryColor || '#00A86B',
        },
      });

      return newUser;
    });

    // Emit event for welcome email
    this.eventEmitter.emit('user.registered', { user, ipAddress });

    // Generate tokens
    return this.generateTokens(user, ipAddress);
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { store: true },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await argon2.verify(user.password, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Votre compte a été suspendu');
    }

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
      },
    });

    return this.generateTokens(user, ipAddress, userAgent);
  }

  async refreshToken(refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
    }

    // Rotate refresh token
    const newRefreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefreshToken, expiresAt },
    });

    const accessToken = this.jwtService.sign({
      sub: session.user.id,
      email: session.user.email,
      role: session.user.role,
      username: session.user.username,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.session.deleteMany({
      where: { userId, refreshToken },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'Si cet email existe, vous recevrez un lien de réinitialisation' };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    this.eventEmitter.emit('user.passwordReset', { user, resetToken });

    return { message: 'Si cet email existe, vous recevrez un lien de réinitialisation' };
  }

  async verifyEmail(token: string) {
    // In production, verify the email token from DB
    // For MVP, simplified implementation
    return { message: 'Email vérifié avec succès' };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return null;

    const isValid = await argon2.verify(user.password, password);
    if (!isValid) return null;

    return user;
  }

  private async generateTokens(user: any, ipAddress?: string, userAgent?: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // In production: verify token from DB (store in a PasswordResetToken table)
    // For MVP: simplified implementation
    // TODO: implement proper token storage and verification
    throw new BadRequestException('Fonctionnalité de réinitialisation non implémentée. Contactez le support.');
  }
}
