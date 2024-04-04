import { Module } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { TimeTrackingController } from './time-tracking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskHour } from './entities/time-tracking.entity';

@Module({
  imports:[TypeOrmModule.forFeature([TaskHour])],
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService],
})
export class TimeTrackingModule {}
