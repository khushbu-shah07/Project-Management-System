import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { UsersModule } from 'src/users/users.module';
import { UserprojectService } from 'src/userproject/userproject.service';
import { UserprojectModule } from 'src/userproject/userproject.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), UsersModule,UserprojectModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService]
})
export class ProjectModule { }
