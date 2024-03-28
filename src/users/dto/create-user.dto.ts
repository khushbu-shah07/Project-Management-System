import { IsEmail, IsEnum, IsString } from "class-validator";
import { UserRole } from "./user.role.enum";

export class CreateUserDto {
  @IsString()
  name:string

  @IsEmail()
  email:string

  @IsString()
  password:string

  @IsEnum(UserRole)
  role:UserRole

}
