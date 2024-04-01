import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentDto } from './create-department.dto';

export class tempUpdateDepartmentDto extends PartialType(CreateDepartmentDto) { }

export class UpdateDepartmentDto extends OmitType(tempUpdateDepartmentDto, []) { }
