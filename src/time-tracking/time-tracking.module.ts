import { Module } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { TimeTrackingController } from './time-tracking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskHour } from './entities/time-tracking.entity';
import { TaskModule } from 'src/task/task.module';
import { ProjectModule } from 'src/project/project.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[TypeOrmModule.forFeature([TaskHour]),TaskModule,ProjectModule,UsersModule],
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService],
  exports:[TimeTrackingService],
})
export class TimeTrackingModule {}
