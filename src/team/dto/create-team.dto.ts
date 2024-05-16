import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  project_id: number;
}
