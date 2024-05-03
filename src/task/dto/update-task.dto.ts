import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from '../entities/task.entity';



export class PartialTaskDto extends PartialType(CreateTaskDto) {}

export class UpdateTaskDto extends OmitType(PartialTaskDto,['project_id']){
  @ApiProperty()
  title:string

  @ApiProperty()
  description:string

  @ApiProperty({name:'TaskPriority',enum:TaskPriority})
  priority:TaskPriority

  @ApiProperty()
  startDate:Date

  @ApiProperty()
  expectedEndDate:Date
}
