import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import sendNotifyEmail from 'utils/Email/sendNotifyMail';

@Injectable()
export class NotificationService {
  }
