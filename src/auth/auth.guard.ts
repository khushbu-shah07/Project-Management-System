/* eslint-disable prettier/prettier */
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
// import { config } from 'dotenv';
// config()

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
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
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}