import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
// DTO - data transfer object - object where you push your data from lets say a request, and you can run validation on it
import { AuthDto } from './dto';
// The controller based on the requests coming from the client has to call functions from the service
// The controller needs to instantiate the service
// The controllers are handling the requests

// Pipes - functions that transform your data - string that comes from request
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }
  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }
}
