import { IsEmpty, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { TaskPriority } from "../entities/task.entity";

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title:string

  @IsString()
  @IsNotEmpty()
  description:string

  @IsOptional()
  @IsEnum(TaskPriority)
  priority:TaskPriority

  @IsNotEmpty()
  startDate:Date

  @IsNotEmpty()
  expectedEndDate:Date

  @IsNotEmpty()
  @IsNumber()
  project_id: number;
}
