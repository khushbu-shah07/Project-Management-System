import { IsAlpha, IsAlphanumeric, IsEmail, IsEnum, IsString, IsStrongPassword, MinLength } from "class-validator";
import { UserRole } from "./user.role.enum";
import { ApiProperty } from "@nestjs/swagger";

import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

// export function IsStrongPassword(validationOptions?: ValidationOptions) {
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       name: 'isStrongPassword',
//       target: object.constructor,
//       propertyName: propertyName,
//       constraints: [],
//       options: validationOptions,
//       validator: {
//         validate(value: any, args: ValidationArguments) {
//           const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
//           return strongPasswordRegex.test(value);
//         },
//         defaultMessage(args: ValidationArguments) {
//           return 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.';
//         },
//       },
//     });
//   };
// }

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name:string

  @ApiProperty()
  @IsEmail()
  email:string

  @ApiProperty()
  @IsString()
  @IsStrongPassword()
  password:string

  @ApiProperty({ name: 'role', enum: UserRole })
  @IsEnum(UserRole)
  role:UserRole

}
