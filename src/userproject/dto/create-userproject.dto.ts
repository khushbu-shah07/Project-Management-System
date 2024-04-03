import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateUserprojectDto {
  @IsNotEmpty()
  @IsNumber()
  project_id: number;

  @IsNotEmpty()
  @IsNumber()
  user_id: number;
}
