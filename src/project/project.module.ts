import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { UsersModule } from 'src/users/users.module';
import { UserprojectModule } from 'src/userproject/userproject.module';
import { NotificationModule } from 'src/notification/notification.module';
@Module({
  imports: [TypeOrmModule.forFeature([Project]), UsersModule,UserprojectModule,NotificationModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService]
})
export class ProjectModule { }
