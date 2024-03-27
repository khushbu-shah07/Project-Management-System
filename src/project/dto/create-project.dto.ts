import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsDate()
  deadline: Date;

  @IsNumber()
  pm_id: number;
}
