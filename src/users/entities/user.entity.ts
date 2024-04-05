import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Project } from 'src/project/entities/project.entity';
import { Exclude } from 'class-transformer';
import { DepartmentUser } from 'src/department/entities/department-user.entity';
import { TeamUser } from 'src/team/entities/team-user.entity';
import { TaskUser } from 'src/task/entities/task-user.entity';
import { Userproject } from 'src/userproject/entities/user-project.entity';
import { Comment } from "src/comments/entities/comment.entity";

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  PM = 'pm',
}

@Entity()
export class User {
  save() {
    throw new Error('Method not implemented.');
  }
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    nullable: false,
  })
  @Index({ unique: true })
  email: string
 

  @Column({
    nullable: false,
    select: false
  })
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: false,
  })
  role: UserRole;

  @OneToMany(() => Project, (project) => project.pm_id)
  projects: Project[];

  @OneToMany(() => DepartmentUser, (department) => department.user_id)
  departments: DepartmentUser[];

  @OneToMany(() => TeamUser, (teamUser) => teamUser.user_id)
  teams: TeamUser[];

  @OneToMany(() => Userproject, (userProject) => userProject.user_id)
  userProjects: Userproject[];

  @OneToMany(() => TaskUser, (taskUser) => taskUser.user_id)
  tasks: TaskUser[];

  @OneToMany(()=>Comment,(comment)=>comment.emp_id)
  comments:Comment[];

  @CreateDateColumn({ nullable: false })
  readonly created_at: Date;

  @UpdateDateColumn()
  readonly updated_at: Date;

  @DeleteDateColumn()
  readonly deleted_at: Date;
}
