import { IsEmpty, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { TaskPriority } from "../entities/task.entity";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title:string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description:string

  @ApiProperty({name:'TaskPriority',enum:TaskPriority})
  @IsOptional()
  @IsEnum(TaskPriority)
  priority:TaskPriority

  @ApiProperty()
  @IsNotEmpty()
  startDate:Date

  @ApiProperty()
  @IsNotEmpty()
  expectedEndDate:Date

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  project_id: number;
}
