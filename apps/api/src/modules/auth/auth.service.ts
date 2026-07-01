import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../../database/database.service';
import { mapUser, mapUserWithSecrets } from '../../database/mappers';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string) {
    if (this.db.get('SELECT id FROM users WHERE email = ?', [dto.email])) {
      throw new ConflictException('Cette adresse email est déjà utilisée');
    }
    if (this.db.get('SELECT id FROM users WHERE username = ?', [dto.username])) {
      throw new ConflictException("Ce nom d'utilisateur est déjà pris");
    }
    if (this.db.get('SELECT id FROM stores WHERE slug = ?', [dto.storeSlug])) {
      throw new ConflictException('Ce nom de boutique est déjà pris');
    }

    const hashedPassword = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const userId = this.db.id();
    const storeId = this.db.id();
    const now = this.db.now();

    // MODIFICATION 4: every account automatically gets a Store, in the same atomic transaction
    this.db.transaction(() => {
      this.db.run(
        `INSERT INTO users (id, email, password, firstName, lastName, username, role, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 'SELLER', 'PENDING_VERIFICATION', ?, ?)`,
        [userId, dto.email, hashedPassword, dto.firstName, dto.lastName, dto.username, now, now],
      );
      this.db.run(
        `INSERT INTO stores (id, userId, name, slug, currency, country, primaryColor, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          storeId, userId, dto.storeName, dto.storeSlug,
          dto.currency || 'XOF', dto.country || 'SN', dto.primaryColor || '#00A86B', now, now,
        ],
      );
    });

    const user = this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
    this.eventEmitter.emit('user.registered', { user: mapUser(user), ipAddress });

    return this.generateTokens(user, ipAddress);
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = this.db.get('SELECT * FROM users WHERE email = ?', [dto.email]);
    if (!user || !user.password) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const isPasswordValid = await argon2.verify(user.password, dto.password);
    if (!isPasswordValid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    if (user.status === 'SUSPENDED') throw new UnauthorizedException('Votre compte a été suspendu');

    this.db.run(
      `INSERT INTO audit_logs (id, userId, action, entity, entityId, ipAddress, userAgent, createdAt)
       VALUES (?, ?, 'LOGIN', 'User', ?, ?, ?, ?)`,
      [this.db.id(), user.id, user.id, ipAddress ?? null, userAgent ?? null, this.db.now()],
    );

    return this.generateTokens(user, ipAddress, userAgent);
  }

  async refreshToken(refreshToken: string) {
    const session = this.db.get('SELECT * FROM sessions WHERE refreshToken = ?', [refreshToken]);
    if (!session || new Date(session.expiresAt) < new Date()) {
      throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
    }

    const user = this.db.get('SELECT * FROM users WHERE id = ?', [session.userId]);
    if (!user) throw new UnauthorizedException();

    const newRefreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    this.db.run('UPDATE sessions SET refreshToken = ?, expiresAt = ?, updatedAt = ? WHERE id = ?', [
      newRefreshToken, expiresAt.toISOString(), this.db.now(), session.id,
    ]);

    const accessToken = this.jwtService.sign({
      sub: user.id, email: user.email, role: user.role, username: user.username,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string, refreshToken: string) {
    this.db.run('DELETE FROM sessions WHERE userId = ? AND refreshToken = ?', [userId, refreshToken]);
  }

  async forgotPassword(email: string) {
    const user = this.db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      // Never reveal whether the email exists (anti-enumeration)
      return { message: 'Si cet email existe, vous recevrez un lien de réinitialisation' };
    }

    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    this.db.run(
      `INSERT INTO password_reset_tokens (id, userId, token, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [this.db.id(), user.id, resetToken, expiresAt.toISOString(), this.db.now()],
    );

    this.eventEmitter.emit('user.passwordReset', { user: mapUser(user), resetToken });
    return { message: 'Si cet email existe, vous recevrez un lien de réinitialisation' };
  }

  async resetPassword(token: string, newPassword: string) {
    const reset = this.db.get('SELECT * FROM password_reset_tokens WHERE token = ?', [token]);
    if (!reset || reset.usedAt || new Date(reset.expiresAt) < new Date()) {
      throw new BadRequestException('Lien de réinitialisation invalide ou expiré');
    }

    const hashedPassword = await argon2.hash(newPassword, {
      type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4,
    });

    this.db.transaction(() => {
      this.db.run('UPDATE users SET password = ?, updatedAt = ? WHERE id = ?', [hashedPassword, this.db.now(), reset.userId]);
      this.db.run('UPDATE password_reset_tokens SET usedAt = ? WHERE id = ?', [this.db.now(), reset.id]);
      // Invalidate all existing sessions for security after a password reset
      this.db.run('DELETE FROM sessions WHERE userId = ?', [reset.userId]);
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async validateUser(email: string, password: string) {
    const user = this.db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !user.password) return null;
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) return null;
    return mapUser(user);
  }

  private async generateTokens(user: any, ipAddress?: string, userAgent?: string) {
    const payload = { sub: user.id, email: user.email, role: user.role, username: user.username };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    this.db.run(
      `INSERT INTO sessions (id, userId, refreshToken, ipAddress, userAgent, expiresAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [this.db.id(), user.id, refreshToken, ipAddress ?? null, userAgent ?? null, expiresAt.toISOString(), this.db.now(), this.db.now()],
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
        username: user.username, role: user.role, avatar: user.avatar,
      },
    };
  }
}
