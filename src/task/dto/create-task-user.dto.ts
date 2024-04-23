import { IsAlpha, IsNotEmpty, IsNumber } from "class-validator";

export class CreateTaskUserDto {
  @IsNotEmpty()
  @IsNumber()
  task_id: number

  @IsNotEmpty()
  @IsNumber()
  user_id: number
}
