import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { TaskPriority, TaskStatus } from "../entities/task.entity";

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title:string

  @IsString()
  @IsNotEmpty()
  description:string

  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status:TaskStatus

  @IsEnum(TaskPriority)
  @IsNotEmpty()
  priority:TaskPriority

  @IsNotEmpty()
  startDate:Date

  @IsNotEmpty()
  expectedEndDate:Date

  @IsNotEmpty()
  @IsNumber()
  project_id: number;
}
