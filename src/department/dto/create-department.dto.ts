import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty } from "class-validator";

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsAlpha()
  @ApiProperty()
  name: string
}
