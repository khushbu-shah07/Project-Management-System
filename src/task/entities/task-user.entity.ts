import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Task } from "./task.entity";
import { User } from "src/users/entities/user.entity";

@Entity()
export class TaskUser{
  @PrimaryGeneratedColumn()
  id:number

  @ManyToOne(()=>Task,(task)=>task.taskUsers, { nullable: false, cascade: true, eager: true })
  task_id:Task

  @ManyToOne(()=>User,(user)=>user.tasks, { nullable: false, cascade: true, eager: true })
  user_id:User

}