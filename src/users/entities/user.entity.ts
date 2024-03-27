import { Column, Entity, PrimaryGeneratedColumn, OneToMany, Index } from "typeorm";
import { Project } from "src/project/entities/project.entity";

enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  PM = 'pm'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    nullable: false
  })
  name: string

  @Column({
    nullable: false
  })
  @Index({ unique: true })
  email: string

  @Column({
    nullable: false
  })
  password: string

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: false
  })
  role: UserRole;

  @OneToMany(() => Project, (project) => project.pm_id)
  projects: Project[]
}
