import { PartialType } from '@nestjs/mapped-types';
import { CreateUserprojectDto } from './create-userproject.dto';

export class UpdateUserprojectDto extends PartialType(CreateUserprojectDto) {}
