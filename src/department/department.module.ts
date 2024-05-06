import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentUser } from './entities/department-user.entity';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Department, DepartmentUser]),UsersModule,NotificationModule],
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule { }
