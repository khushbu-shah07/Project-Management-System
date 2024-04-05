import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskUser } from './entities/task-user.entity';
import { ProjectModule } from 'src/project/project.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskUser]),ProjectModule,UsersModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule { }
