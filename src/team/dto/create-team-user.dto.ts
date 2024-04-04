import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTeamUserDto {
  @IsNotEmpty()
  @IsNumber()
  team_id: number;

  @IsNotEmpty()
  @IsNumber()
  user_id: number;
}
