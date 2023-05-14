import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { TodoModule } from './todo/todo.module';
import { PrismaModule } from './prisma/prisma.module';
/*
A module is a class annotated with a @Module decorator. The decorator
provides metadata that Nest makes use of to organize the application structure.
*/
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TodoModule,
    PrismaModule,
  ],
})
export class AppModule {}
