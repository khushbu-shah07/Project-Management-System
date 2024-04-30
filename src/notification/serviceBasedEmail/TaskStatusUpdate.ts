import { TaskService } from 'src/task/task.service';
import sendNotifyEmail from '../Email/sendNotifyMail';
import { ProjectService } from 'src/project/project.service';

export class TaskStatus {
  static async TaskStatusUpdate(
    pmEmail:string,
    taskId: string,
    taskStatus: string,
    taskService: TaskService,
    taskTitle:string,
    projectService:ProjectService
  ) {
    try {
      const userEmailsInTask = await taskService.getUsersInTask(Number(taskId));
      const taskDetail=await taskService.findOne(Number(taskId));
      const taskTitle=taskDetail.title;

    const projectDetail=await projectService.findOne(taskDetail.project_id.id)

    const projectName=projectDetail.name

      for (const userEmail in userEmailsInTask) {
        try {
           sendNotifyEmail(pmEmail, userEmailsInTask[userEmail] , `the task has been ${taskStatus}` ,taskTitle,projectName)
        } catch (error) {
          console.error(
            'error while sending mails to users'
          );
        }
      }
    } catch (err) {}
  }
}
