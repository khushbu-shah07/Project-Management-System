import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentUser } from './entities/department-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, DepartmentUser])],
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule { }
