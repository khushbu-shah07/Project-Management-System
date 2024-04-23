import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  startDate: Date;

  @IsNotEmpty()
  expectedEndDate: Date;

  @IsNotEmpty()
  @IsEmail()
  clientEmail: string;

  @IsNotEmpty()
  @IsNumber()
  pm_id: number;
}
