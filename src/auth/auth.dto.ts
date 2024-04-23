import { IsEmail, IsString } from "class-validator";

/* eslint-disable prettier/prettier */
export class SignInDto {
  @IsEmail()
    email: string;
    
  @IsString()
    password: string;
  }