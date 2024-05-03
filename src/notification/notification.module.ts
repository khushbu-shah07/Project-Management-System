import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { UsersModule } from 'src/users/users.module';
import { TaskModule } from 'src/task/task.module';
import { ProjectModule } from 'src/project/project.module';
@Module({
  imports:[UsersModule,forwardRef(()=>TaskModule),forwardRef(()=>ProjectModule)],
  controllers: [NotificationController],
  exports:[NotificationService],
  providers: [NotificationService],
})
export class NotificationModule {}
