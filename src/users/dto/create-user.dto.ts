import { IsEmail, IsEnum, IsString } from "class-validator";
import { UserRole } from "./user.role.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name:string

  @ApiProperty()
  @IsEmail()
  email:string

  @ApiProperty()
  @IsString()
  password:string

  @ApiProperty({ name: 'role', enum: UserRole })
  @IsEnum(UserRole)
  role:UserRole

}
