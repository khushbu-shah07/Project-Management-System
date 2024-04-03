import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskUser } from './entities/task-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskUser])],
  controllers: [TaskController],
  providers: [TaskService],
  exports:[TaskService],
})
export class TaskModule { }
