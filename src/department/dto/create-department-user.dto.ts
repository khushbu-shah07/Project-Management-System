import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty, IsNumber } from "class-validator";

export class CreateDepartmentUserDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  department_id: number

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  user_id: number
}
