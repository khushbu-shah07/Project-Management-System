import { BadRequestException } from '@nestjs/common';
import sendNotifyEmail from '../Email/sendNotifyMail';
import { UsersService } from '../../users/users.service'

export class ProjectStatus {
  static async projectStatusUpdate(
    pmOrAdminEmail: string,
    allUsersInProject: any,
    statusOfProject: string,
    projectName: string,
    usersService: UsersService,
  ) {
    try {
        const allUsersEmail:string[] = [];
        for (const user of allUsersInProject) {
          const userID = user.user_detail.user_id;
          if (userID) {
            const userDetails = await usersService.findOne(userID);
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
