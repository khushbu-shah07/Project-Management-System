import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[UsersModule],
  controllers: [NotificationController],
  exports:[NotificationService],
  providers: [NotificationService],
})
export class NotificationModule {}
