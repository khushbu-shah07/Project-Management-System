import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne } from 'typeorm'
import { User } from 'src/users/entities/user.entity'

enum ProjectStatus {
  CREATED = 'created',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}
@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false })
  description: string

  @Column({ nullable: false })
  startDate: Date

  @Column({ nullable: false })
  expectedEndDate: Date

  @Column({
    nullable: true
  })
  actualEndDate: Date

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    nullable: false,
    default: ProjectStatus.CREATED
  })
  status: ProjectStatus

  @Column({ nullable: false })
  clientEmail: string

  @ManyToOne(() => User, (user) => user.projects, { nullable: false, cascade: true, eager: true })
  readonly pm_id: User

  @CreateDateColumn({ nullable: false })
  readonly created_at: Date

  @UpdateDateColumn()
  readonly updated_at: Date

  @DeleteDateColumn()
  readonly deleted_at: Date
}
