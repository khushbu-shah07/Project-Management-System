import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  PM = 'pm'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id:number

  @Column()
  name:string

  @Column()
  email:string

  @Column()
  password:string

  @Column({
    type: 'enum',
    enum: UserRole,
})
role: UserRole;
}
