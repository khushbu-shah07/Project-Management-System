import { BadRequestException } from "@nestjs/common";
import sendNotifyEmail from "../Email/sendNotifyMail";
import { UsersService } from "src/users/users.service";
import { ProjectService } from "src/project/project.service";
import { CreateTaskUserDto } from "src/task/dto/create-task-user.dto";

export class UserHasTask {
    
    static async assignedOrRemoveToTask(usersService: UsersService , projectService:ProjectService , pmOrAdminId: number, typeOfOperation: string, taskUserData:CreateTaskUserDto,taskTitle:string,projectId:number) {
        try {
            
      const pmOrAdminDetail =await usersService.findOne(pmOrAdminId);
      const adminEmail = pmOrAdminDetail.email;
      const user = await usersService.findOne(taskUserData.user_id);
      const userEmail =user.email;
        
      const projectDetail = await projectService.findOne(projectId);
      const projectName=projectDetail.name;
            
            sendNotifyEmail(adminEmail, userEmail, `You have been ${typeOfOperation} to task`, `${taskTitle}` , `${projectName}`);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
