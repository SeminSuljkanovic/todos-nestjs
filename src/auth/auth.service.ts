import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, Todo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'rxjs';

// Nest uses dependency injection under the hood
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async login(dto: AuthDto) {
    // Find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // If user does not exist throw exception
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }
    // Compare password
    const pwMatches = await argon.verify(user.password, dto.password);
    // If password does not match throw exception
    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }
    // Return User signed token
    return await this.signToken(user.id, user.email);
  }

  async register(dto: AuthDto) {
    // Generate the password
    const password = await argon.hash(dto.password);
    try {
      // Save new user to db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password,
        },
      });

      // Return User signed token
      return await this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // P2002 is a code prisma returns when you try to create
          // a record with unique field that already exists in our db
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signToken(
    user_id: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: user_id,
      email: email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
