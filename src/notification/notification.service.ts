import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { CreateDepartmentUserDto } from 'src/department/dto/create-department-user.dto';
import { ProjectService } from 'src/project/project.service';
import { CreateTaskUserDto } from 'src/task/dto/create-task-user.dto';
import { TaskService } from 'src/task/task.service';
import { UsersService } from 'src/users/users.service';
import sendNotifyEmail from 'utils/Email/sendNotifyMail';

@Injectable()
export class NotificationService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
  ) {}

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
      const userEmailsInTask = await this.taskService.getUsersInTask(taskId);
      console.log(userEmailsInTask);
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
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  async assignedOrRemoveToTask(
    pmOrAdminEmail: string,
    typeOfOperation: string,
    taskUserData: CreateTaskUserDto,
    taskTitle: string,
    projectId: number,
  ) {
    try {
      const user = await this.usersService.findOne(taskUserData.user_id);
      const userEmail = user.email;

      const projectDetail = await this.projectService.findOne(projectId);
      const projectName = projectDetail.name;

      sendNotifyEmail(
        pmOrAdminEmail,
        userEmail,
        `You have been ${typeOfOperation} to task`,
        `${taskTitle}`,
        `${projectName}`,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async UserHasComment(
    emailSendBy: string,
    taskId: number,
    commentStatus: string,
  ) {
    try {
      const userEmailsInTask = await this.taskService.getUsersInTask(
        Number(taskId),
      );
      const taskDetail = await this.taskService.findOne(taskId);
      const taskTitle = taskDetail.title;

      const projectDetail = await this.projectService.findOne(
        taskDetail.project_id.id,
      );

      const projectName = projectDetail.name;

      for (const userEmail in userEmailsInTask) {
        try {
          sendNotifyEmail(
            emailSendBy,
            userEmailsInTask[userEmail],
            `the comment has been ${commentStatus} `,
            taskTitle,
            projectName,
          );
        } catch (error) {
          console.error('error while sending mails to users');
        }
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  async addOrRemoveUserToDepartment(
    adminId: number,
    typeOfOperation: string,
    departmentUserData: CreateDepartmentUserDto,
  ) {
    try {
      const adminDetail = await this.usersService.findOne(adminId);
      const adminEmail = adminDetail.email;

      const user = await this.usersService.findOne(departmentUserData.user_id);
      const userEmail = user.email;

      sendNotifyEmail(
        adminEmail,
        userEmail,
        `You have been ${typeOfOperation} to the department`,
        'None',
        'None',
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async addOrRemoveToTeam( pmOrAdminId: number, typeOfOperation: string, userId:number , teamId: number,projectName:string) {
    try {
        
        const pmOrAdminDetail =await this.usersService.findOne(pmOrAdminId);
        let adminEmail = pmOrAdminDetail.email;


         const user = await this.usersService.findOne(userId);
         const userEmail =user.email;

         sendNotifyEmail(adminEmail,userEmail,`You have been ${typeOfOperation} to the team`,'None',`${projectName}`)

         
    } catch (error) {
        throw new BadRequestException(error.message);
    }
}

}
