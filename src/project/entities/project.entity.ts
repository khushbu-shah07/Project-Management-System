import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne } from 'typeorm'
import { User } from 'src/users/entities/user.entity'

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false })
  description: string

  @Column({ nullable: false })
  deadline: Date

  @ManyToOne(() => User, (user) => user.projects, { nullable: false })
  readonly pm_id: User

  @CreateDateColumn({ nullable: false })
  readonly created_at: Date

  @UpdateDateColumn()
  readonly updated_at: Date

  @DeleteDateColumn()
  readonly deleted_at: Date
}
