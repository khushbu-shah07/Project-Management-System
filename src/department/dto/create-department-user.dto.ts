import { IsAlpha, IsNotEmpty, IsNumber } from "class-validator";

export class CreateDepartmentUserDto {
  @IsNotEmpty()
  @IsNumber()
  department_id: number

  @IsNotEmpty()
  @IsNumber()
  user_id: number
}
