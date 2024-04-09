import { TaskUser } from "../../task/entities/task-user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class TaskHour {
    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(()=>TaskUser,(taskUser)=>taskUser.taskHours)
    taskUser_id:number;

    @Column({nullable:false})
    hours:number;

    @Column({nullable:false})
    description:string;

    @CreateDateColumn()
    created_at:Date;

    @UpdateDateColumn()
    updated_at:Date;

}
