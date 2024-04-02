import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id:number;

    @Column({nullable:false})
    emp_id:number;

    @Column({nullable:false})
    task_id:number;

    @Column({nullable:false})
    content:string;

    @Column({default:false})
    edited:boolean;

    @CreateDateColumn()
    created_at:Date;

    @UpdateDateColumn()
    updated_at:Date;

}
