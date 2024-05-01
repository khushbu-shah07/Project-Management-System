import { TaskService } from 'src/task/task.service';
import sendNotifyEmail from '../Email/sendNotifyMail';
import { ProjectService } from 'src/project/project.service';

export class UserComment {
  static async UserHasComment (
    emailSendBy: string,
    taskId: number,
    commentContent:string,
    commentStatus:string,
    taskService: TaskService,
    projectService:ProjectService
  ) {
    try {
        console.log('inside')
      const userEmailsInTask = await taskService.getUsersInTask(Number(taskId));
      const taskDetail=await taskService.findOne(taskId);
      const taskTitle=taskDetail.title;

    const projectDetail=await projectService.findOne(taskDetail.project_id.id)

 const projectName=projectDetail.name


      for (const userEmail in userEmailsInTask) {
        try {
           sendNotifyEmail(emailSendBy, userEmailsInTask[userEmail] , `the comment has been ${commentStatus} and comment is ${commentContent}` ,taskTitle,projectName)
        } catch (error) {
          console.error(
            'error while sending mails to users'
          );
        }
      }
    } catch (err) {}
  }
}
