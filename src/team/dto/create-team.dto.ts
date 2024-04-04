import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTeamDto {
  @IsNotEmpty()
  @IsNumber()
  project_id: number;
}
