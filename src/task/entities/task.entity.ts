import { Project } from "src/project/entities/project.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskUser } from "./task-user.entity";

enum TaskStatus {
  CREATED = "created",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed"
}

enum TaskPriority{
  HIGH = "high",
  LOW = "low",
  MEDIUM = "medium",
  NONE = "none"
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column({ nullable: false })
  title: string

  @Column({ nullable: false })
  description: string

  @Column({
    type: 'enum',
    enum: TaskStatus,
    nullable: false
  })
  status: TaskStatus

  @Column({
    type:'enum',
    enum: TaskPriority,
    nullable:false,
    default:TaskPriority.NONE
  })
  priority:TaskPriority

  @Column({ nullable: false })
  startDate:Date

  @Column({nullable:false})
  expectedEndDate:Date

  @Column()
  actualEndDate:Date

  @ManyToOne(()=>Project,(project)=>project.tasks)
  project_id:Project

  @OneToMany(()=>TaskUser,(taskUser)=>taskUser.task_id)
  taskUsers:TaskUser[]

  @CreateDateColumn({ nullable: false })
  readonly created_at: Date;

  @UpdateDateColumn()
  readonly updated_at: Date;

  @DeleteDateColumn()
  readonly deleted_at: Date;

}
