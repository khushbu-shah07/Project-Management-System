import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ProjectModule } from 'src/project/project.module';
import { TaskModule } from 'src/task/task.module';
import { UserprojectModule } from 'src/userproject/userproject.module';

@Module({
  imports: [ProjectModule, TaskModule, UserprojectModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule { }
