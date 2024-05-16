import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty, IsNumber } from "class-validator";

export class CreateTaskUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  task_id: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  user_id: number
}
