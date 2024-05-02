/* eslint-disable prettier/prettier */
import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './auth.dto';
import { httpStatusCodes } from 'utils/sendresponse';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    try {
      return this.authService.authenticate(signInDto);
    } catch (error) {
      throw new HttpException(error.message , error.status||httpStatusCodes['Bad Request'])
    }
  }

}