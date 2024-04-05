import { Module } from '@nestjs/common';
import { ReportGenerationService } from './report-generation.service';
import { ReportGenerationController } from './report-generation.controller';
import { ProjectModule } from 'src/project/project.module';
import { TaskModule } from 'src/task/task.module';

@Module({
  imports:[ProjectModule,TaskModule],
  controllers: [ReportGenerationController],
  providers: [ReportGenerationService],
})
export class ReportGenerationModule {}
