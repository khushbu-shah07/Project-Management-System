import { IsAlpha, IsNotEmpty } from "class-validator";

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsAlpha()
  name: string
}
