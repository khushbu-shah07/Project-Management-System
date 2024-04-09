import { Task } from "../../task/entities/task.entity";
import { User } from "../../users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(()=>User,(user)=>user.comments)
    emp_id:User;

    @ManyToOne(()=>Task,(task)=>task.comments)
    task_id:Task;

    @Column({nullable:false})
    content:string;

    @Column({default:false})
    edited:boolean;

    @CreateDateColumn()
    created_at:Date;

    @UpdateDateColumn()
    updated_at:Date;

}
