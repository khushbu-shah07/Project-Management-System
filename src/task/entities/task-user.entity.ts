import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Task } from "./task.entity";
import { User } from "src/users/entities/user.entity";
import { TaskHour } from "src/time-tracking/entities/time-tracking.entity";

@Entity()
export class TaskUser{
  @PrimaryGeneratedColumn()
  id:number

  @ManyToOne(()=>Task,(task)=>task.taskUsers, { nullable: false, cascade: true, eager: true })
  task_id:Task

  @ManyToOne(()=>User,(user)=>user.tasks, { nullable: false, cascade: true, eager: true })
  user_id:User

  @OneToMany(()=>TaskHour,(taskHour)=>taskHour.taskUser_id)
  taskHours:TaskHour[];

}