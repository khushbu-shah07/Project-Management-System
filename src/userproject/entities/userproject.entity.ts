import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export class Userproject {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userProjects, {
    nullable: false,
    cascade: true,
    eager: true,
  })
  user_id: User;

  @ManyToOne(() => Project, (project) => project.userProjects,
  {
    nullable: false,
    cascade: true,
    eager: true,
  })
  project_id: Project;
}
