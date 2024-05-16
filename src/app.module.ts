import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { ProjectModule } from './project/project.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentModule } from './department/department.module';
import { TeamModule } from './team/team.module';
import { UserprojectModule } from './userproject/userproject.module';
import { TaskModule } from './task/task.module';
import { CommentsModule } from './comments/comments.module';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';
import { ReportModule } from './report/report.module';
import { MorganModule, MorganInterceptor } from 'nest-morgan';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CustomExceptionFilter } from 'utils/customExceptionFilter';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), UsersModule, ProjectModule, AuthModule, DepartmentModule, TeamModule, TaskModule, UserprojectModule, CommentsModule, TimeTrackingModule, ReportModule, MorganModule],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MorganInterceptor("combined"),
    },
    {
        provide: APP_FILTER,
        useClass: CustomExceptionFilter,
    }
  ],
})
export class AppModule { }