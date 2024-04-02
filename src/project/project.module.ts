import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { UsersModule } from 'src/users/users.module';
import { EndDateInterceptor } from './Interceptors/endDateInterceptor';
import { StartDateInterceptor } from './Interceptors/startDateInterceptor';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), UsersModule],
  controllers: [ProjectController],
  providers: [ProjectService,EndDateInterceptor,StartDateInterceptor],
  exports:[ProjectService]
})
export class ProjectModule { }
