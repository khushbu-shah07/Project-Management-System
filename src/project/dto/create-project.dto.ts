import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDate()
  deadline: Date;

  @IsNotEmpty()
  @IsNumber()
  pm_id: number;
}
