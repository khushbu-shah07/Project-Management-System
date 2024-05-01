import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import sendNotifyEmail from 'utils/Email/sendNotifyMail';

@Injectable()
export class NotificationService {
    constructor(private readonly usersService:UsersService){};

    async projectStatusUpdate(
        pmOrAdminEmail: string,
        allUsersInProject: any,
        statusOfProject: string,
        projectName: string
      ) {
        try {
            const allUsersEmail:string[] = [];
            for (const user of allUsersInProject) {
              const userID = user.user_detail.user_id;
              if (userID) {
                const userDetails = await this.usersService.findOne(userID);
                if (userDetails && userDetails.email) {
                  allUsersEmail.push(userDetails.email);
                  try {
                    await sendNotifyEmail(
                      pmOrAdminEmail,
                      userDetails.email,
                      `Project status is ${statusOfProject}`,
                      'None',
                      projectName,
                    );
                  } catch (error) {
                    console.error(
                      `Failed to send notification email to ${userDetails.email}: ${error.message}`,
                    );
                  }
                }
              }
            }
            
        } catch (error) {
          throw new BadRequestException(error.message);
        }
      }
}
