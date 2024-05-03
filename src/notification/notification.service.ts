import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { ProjectService } from 'src/project/project.service';
import { TaskService } from 'src/task/task.service';
import { UsersService } from 'src/users/users.service';
import sendNotifyEmail from 'utils/Email/sendNotifyMail';

@Injectable()
export class NotificationService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(()=>ProjectService)) private readonly projectService:ProjectService,
    @Inject(forwardRef(()=>TaskService)) private readonly taskService:TaskService,
  ) {};

  async projectStatusUpdate(
    pmOrAdminEmail: string,
    allUsersInProject: any,
    statusOfProject: string,
    projectName: string,
  ) {
    try {
      const allUsersEmail: string[] = [];
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

  async TaskStatusUpdate(pmEmail: string, taskId: number, taskStatus: string) {
    console.log('inside notify');
    try {
      const userEmailsInTask = await this.taskService.getUsersInTask(
        taskId,
      );
      console.log(userEmailsInTask)
      const taskDetail = await this.taskService.findOne(taskId);
      const taskTitle = taskDetail.title;

      const projectDetail = await this.projectService.findOne(
        taskDetail.project_id.id,
      );

      const projectName = projectDetail.name;

      for (const userEmail in userEmailsInTask) {
        try {
          sendNotifyEmail(
            pmEmail,
            userEmailsInTask[userEmail],
            `the task has been ${taskStatus}`,
            taskTitle,
            projectName,
          );
        } catch (error) {
          console.error('error while sending mails to users');
        }
      }
    } catch (err) {}
  }
}
