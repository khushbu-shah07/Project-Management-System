import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PartialUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserDto extends OmitType(PartialUserDto, ['email','role']){
  @ApiProperty()
  name?: string;

  @ApiProperty()
  password?: string;
}
