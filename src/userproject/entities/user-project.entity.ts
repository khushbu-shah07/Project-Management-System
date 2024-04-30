import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../project/entities/project.entity';

@Entity({
  name: 'user_project',
})
export class Userproject {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userProjects, {
    nullable: false,
    cascade: true,
    eager: true
  })
  user_id: User;

  @ManyToOne(() => Project, (project) => project.userProjects, {
    nullable: false,
    cascade: true,
  })
  project_id: Project;
}
