import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Team } from './team.entity';

@Entity()
export class TeamUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Team, (team) => team.teamUsers, {
    nullable: false,
    cascade: true,
    eager: true,
  })
  team_id: number;

  @ManyToOne(() => User, (user) => user.teams, {
    nullable: false,
    cascade: true,
    eager: true,
  })
  user_id: User;
}
