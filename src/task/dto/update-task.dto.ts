import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';



export class PartialTaskDto extends PartialType(CreateTaskDto) {}

export class UpdateTaskDto extends OmitType(PartialTaskDto,['project_id']){}
