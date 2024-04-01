import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DepartmentUser } from "./department-user.entity";

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  name: string

  @OneToMany(() => DepartmentUser, (departmentUser) => departmentUser.department_id)
  departments: DepartmentUser[]

  @DeleteDateColumn()
  deleted_at: Date
}
