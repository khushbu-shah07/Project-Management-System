import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class PartialUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserDto extends OmitType(PartialUserDto,['email','role']){}
