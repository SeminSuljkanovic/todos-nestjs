import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
// Logic that will verify that the barer token (our JWT) is correct, is called a strategy
// We separate it to a different folder as we know this class has a specific use case
// It is for validating the token
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
  constructor( config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });
      delete user.password;
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
