import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../dto/user.role.enum";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id:number

  @Column({nullable:false})
  name:string

  @Column({nullable:false,unique:true})
  email:string

  @Column({nullable:false})
  password:string

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable:false
})
  role: UserRole;

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @DeleteDateColumn()
    deletedDate: Date
}
