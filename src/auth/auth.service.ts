/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { SignInDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  private async comaprePassword(password: any,hashedPassword:any): Promise<boolean> {
    const isMatch= await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
  
  async authenticate(
    data:SignInDto
  ): Promise<{ accessToken: string }> {
    const user = await this.userService.findByEmail(data.email);
    if(!user){
        throw new BadRequestException("Enter proper Crendentials")
    }
    if (!await this.comaprePassword(data.password,user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {role: user.role,id:user.id };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}