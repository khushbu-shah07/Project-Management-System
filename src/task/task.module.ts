import { Module, forwardRef } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskUser } from './entities/task-user.entity';
import { ProjectModule } from 'src/project/project.module';
import { UserprojectModule } from 'src/userproject/userproject.module';
import { Project } from 'src/project/entities/project.entity';
import { UsersModule } from 'src/users/users.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskUser, Project]),forwardRef(()=>ProjectModule), UserprojectModule,UsersModule,forwardRef(()=>NotificationModule)],
  controllers: [TaskController],
  providers: [TaskService],
  exports:[TaskService],
})
export class TaskModule { }
