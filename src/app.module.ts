import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { ProjectModule } from './project/project.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { DepartmentModule } from './department/department.module';
import { TeamModule } from './team/team.module';
import { UserprojectModule } from './userproject/userproject.module';
import { TaskModule } from './task/task.module';
import { CommentsModule } from './comments/comments.module';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [ TypeOrmModule.forRoot(dataSourceOptions),UsersModule, ProjectModule,AuthModule, DepartmentModule, TeamModule, TaskModule, UserprojectModule, CommentsModule, TimeTrackingModule, ReportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}