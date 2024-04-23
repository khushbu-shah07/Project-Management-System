import {
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TeamUser } from './team-user.entity';
import { Project } from '../../project/entities/project.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (project) => project.teams, {
    nullable: false,
    cascade: true,
  })
  project_id: number;

  @OneToMany(() => TeamUser, (teamUser) => teamUser.team_id)
  teamUsers: TeamUser[];

  @DeleteDateColumn()
  deleted_at: Date;
}
