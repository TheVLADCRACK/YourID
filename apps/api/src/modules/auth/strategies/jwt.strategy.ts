import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../../database/database.service';
import { mapStore } from '../../../database/mappers';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService, private db: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = this.db.get('SELECT * FROM users WHERE id = ?', [payload.sub]);
    if (!user || user.status === 'SUSPENDED') throw new UnauthorizedException();

    const store = this.db.get('SELECT * FROM stores WHERE userId = ?', [user.id]);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      store: store ? mapStore(store) : null,
    };
  }
}
