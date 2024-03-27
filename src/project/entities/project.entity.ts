import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne } from 'typeorm'
import { User } from 'src/users/entities/user.entity'

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false })
  description: string

  @Column({ nullable: false })
  deadline: Date

  @ManyToOne(() => User, (user) => user.projects)
  pm_id: User

  @CreateDateColumn({ nullable: false })
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @DeleteDateColumn()
  deleted_at: Date
}
