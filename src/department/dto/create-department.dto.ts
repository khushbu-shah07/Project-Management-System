import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty } from "class-validator";

export class CreateDepartmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsAlpha()
  name: string
}
