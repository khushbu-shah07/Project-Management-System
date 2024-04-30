import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

/* eslint-disable prettier/prettier */
export class SignInDto {
  @ApiProperty()
  @IsEmail()
    email: string;
    
  @ApiProperty()
  @IsString()
    password: string;
  }