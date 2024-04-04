import { Module } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { TimeTrackingController } from './time-tracking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskHour } from './entities/time-tracking.entity';
import { TaskModule } from 'src/task/task.module';

@Module({
  imports:[TypeOrmModule.forFeature([TaskHour]),TaskModule],
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService],
})
export class TimeTrackingModule {}
