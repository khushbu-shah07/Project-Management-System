import { JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/project/entities/project.entity';
export class Userproject {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userProjects, {
    nullable: false,
    cascade: true,
    eager: true,
  })
  // @JoinColumn({ name: 'user_id' })/
  user_id: User;

  @ManyToOne(() => Project, (project) => project.userProjects, {
    nullable: false,
    cascade: true,
    eager: true,
  })
  // @JoinColumn({ name: 'project_id' })
  project_id: Project;
}
