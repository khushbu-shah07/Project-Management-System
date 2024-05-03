import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Department } from "./department.entity";
import { User } from "../../users/entities/user.entity";

@Entity()
export class DepartmentUser {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Department, (department) => department.departments, { nullable: false, cascade: true, eager:true })
  department_id: Department

  @ManyToOne(() => User, (user) => user.departments, { nullable: false, cascade: true})
  user_id: User
}
