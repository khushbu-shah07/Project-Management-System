import { Column, Entity, PrimaryGeneratedColumn, OneToMany, Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Project } from "src/project/entities/project.entity";
import { Exclude } from "class-transformer";
import { DepartmentUser } from "src/department/entities/department-user.entity";
import { TeamUser } from "src/team/entities/team-user.entity";
import { TaskUser } from "src/task/entities/task-user.entity";

enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  PM = 'pm'
}

@Entity()
export class User {
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
  readonly email: string;

  @Column({
    nullable: false,
  })
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: false,
  })
  readonly role: UserRole;

  @OneToMany(() => Project, (project) => project.pm_id)
  projects: Project[];

  @OneToMany(() => DepartmentUser, (department) => department.user_id)
  departments: DepartmentUser[];

  @OneToMany(() => TeamUser, (teamUser) => teamUser.user_id)
  teams: TeamUser[];

  @OneToMany(()=>TaskUser,(taskUser)=>taskUser.user_id)
  tasks:TaskUser[]

  @CreateDateColumn({ nullable: false })
  readonly created_at: Date;

  @UpdateDateColumn()
  readonly updated_at: Date;

  @DeleteDateColumn()
  readonly deleted_at: Date;
}
