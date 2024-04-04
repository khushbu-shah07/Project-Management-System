import { Column, Entity, PrimaryGeneratedColumn, OneToMany, Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Project } from "src/project/entities/project.entity";

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  PM = 'pm'
}

@Entity()
export class User {
  save() {
    throw new Error('Method not implemented.');
  }
  @PrimaryGeneratedColumn()
  readonly id: number

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
    nullable: false,
    select: false
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

  @CreateDateColumn({ nullable: false })
  readonly created_at: Date

  @UpdateDateColumn()
  readonly updated_at: Date

  @DeleteDateColumn()
  readonly deleted_at: Date
}
