/* eslint-disable prettier/prettier */
import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './auth.dto';
import { httpStatusCodes } from 'utils/sendresponse';

import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
@ApiTags('Users')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login User' })
  @ApiCreatedResponse({ status: 201, description: 'Login Successful' })
  @ApiResponse({ status: 400, description: 'BadRequest Exception' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Invalid Credential' })
  @ApiBody({
    description: 'Login credentials',
    type: SignInDto,
  })
  async signIn(@Body() signInDto: SignInDto) {
    try {
      return this.authService.authenticate(signInDto);
    } catch (error) {
      throw new HttpException(error.message , error.status||httpStatusCodes['Bad Request'])
    }
  }

}