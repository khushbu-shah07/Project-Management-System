/* eslint-disable prettier/prettier */
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { httpStatusCodes } from 'utils/sendresponse';
// import { config } from 'dotenv';
// config()

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService , private userService:UsersService) {}

  async canActivate(context: ExecutionContext):Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const token = authorizationHeader.substring(7);

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
      const user = await this.userService.findOne(request['user'].id)
      return true;
    } catch (error) {
      throw new HttpException("Invalid Token",httpStatusCodes.Unauthorized)
    }
  }
}