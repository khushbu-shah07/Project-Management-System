import { BadRequestException } from "@nestjs/common";
import sendNotifyEmail from "../Email/sendNotifyMail";
import { UsersService } from "src/users/users.service";
import { ProjectService } from "src/project/project.service";
import { TeamService } from "src/team/team.service";

export class UserInTeam {
    
    static async addOrRemoveToTeam(usersService: UsersService, projectService: ProjectService, teamService:TeamService ,  pmOrAdminId: number, typeOfOperation: string, userId:number , teamId: number) {
        try {
            
            const pmOrAdminDetail =await usersService.findOne(pmOrAdminId);
            let adminEmail = pmOrAdminDetail.email;
    
      
            const teamDeail = await teamService.findOne(teamId);
            const projectID = teamDeail.project_id;
      
             const projectDetail = await projectService.findOne(projectID);
             const projectName =projectDetail.name;

             const user = await usersService.findOne(userId);
             const userEmail =user.email;

             sendNotifyEmail(adminEmail,userEmail,`You have been ${typeOfOperation} to the team`,'None',`${projectName}`)

             
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
