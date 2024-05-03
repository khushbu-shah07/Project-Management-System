import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateProjectDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  expectedEndDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  clientEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pm_id: number;
}
